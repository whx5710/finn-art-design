<template>
  <el-drawer v-model="drawerVisible" title="配置用户" size="80%">
    <ElRow :gutter="10">
      <ElCol :span="12">
        <!-- 表格头部 -->
        <ArtTableHeader
          v-model:columns="columnChecksL"
          v-model:layout="layout"
          :loading="loadingL"
          @refresh="refreshDataL"
        >
          <template #left>
            <ElSpace wrap>
              <ElButton @click="bindUser" size="small" v-ripple>绑定用户</ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>
        <!-- 表格 -->
        <ArtTable
          show-overflow-tooltip
          :loading="loadingL"
          :data="dataL"
          :columns="columnsL"
          :pagination="paginationL"
          @selection-change="handleSelectionChange"
          @pagination:size-change="handleSizeChangeL"
          @pagination:current-change="handleCurrentChangeL"
        >
        </ArtTable>
      </ElCol>
      <ElCol :span="12" class="art-full-height">
        <!-- 表格头部 -->
        <ArtTableHeader v-model:layout="layout" :loading="loading" @refresh="refreshData">
        </ArtTableHeader>
        <!-- 表格 -->
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
        </ArtTable>
      </ElCol>
    </ElRow>
  </el-drawer>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { FormInstance } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetUserList, bindTenantUser, unBindTenantUser } from '@/api/system/user'

  type UserListItem = Api.SystemManage.UserListItem

  interface Props {
    visible: boolean
    type: string
    paramsData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const layout = 'refresh,size'

  // 选中的行
  const userPendingRows = ref<UserListItem[]>([])

  // 对话框显示控制
  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const tenantId = ref('')

  const {
    columnChecks: columnChecksL,
    columns: columnsL,
    data: dataL,
    getData: getDataL,
    loading: loadingL,
    pagination: paginationL,
    handleSizeChange: handleSizeChangeL,
    handleCurrentChange: handleCurrentChangeL
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        tenantRole: true
      },
      immediate: false,
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        // { type: 'index', width: 70, label: '序号' }, // 序号
        {
          prop: 'userInfo',
          label: '用户名/邮箱',
          width: 180,
          // visible: false, // 默认是否显示列
          formatter: (row: any) => {
            return h('div', { class: 'user flex-c' }, [
              h('div', { class: 'ml-2' }, [
                h('p', { style: 'margin-bottom: -0.3rem;' }, row.username),
                h('p', { class: 'email' }, row.email)
              ])
            ])
          }
        },
        { prop: 'realName', label: '姓名' },
        {
          prop: 'gender',
          label: '性别',
          width: 60,
          formatter: (row: { gender: number }) => {
            if (row.gender === 0) {
              // return h(ElTag, { type: 'primary' }, () => '男')
              return '男'
            } else if (row.gender === 1) {
              // return h(ElTag, { type: 'warning' }, () => '女')
              return '女'
            } else {
              // return h(ElTag, { type: 'danger' }, () => '未知')
              return '未知'
            }
          }
        },
        { prop: 'mobile', label: '手机号', width: 140 },
        { prop: 'deptName', label: '部门' },
        {
          prop: 'status',
          label: '状态',
          formatter: (row: { status: number }) => {
            if (row.status === 1) {
              // return h(ElTag, { type: 'success' }, () => '正常')
              return '正常'
            } else {
              // return h(ElTag, { type: 'warning' }, () => '停用')
              return '停用'
            }
          }
        }
      ]
    },
    // 数据处理
    transform: {
      // 数据转换器 - 替换头像
      dataTransformer: (records: any[]) => {
        // 类型守卫检查
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }

        // 使用本地头像替换接口返回的头像
        return records.map((item) => {
          return {
            ...item,
            avatar: ''
          }
        })
      }
    }
  })
  const { columns, data, getData, loading, pagination, handleSizeChange, handleCurrentChange } =
    useTable({
      // 核心配置
      core: {
        apiFn: fetchGetUserList,
        apiParams: {},
        immediate: false,
        columnsFactory: () => [
          { type: 'index', width: 50 }, // 序号
          {
            prop: 'userInfo',
            label: '用户名/邮箱',
            width: 200,
            // visible: false, // 默认是否显示列
            formatter: (row: any) => {
              return h('div', { class: 'user flex-c' }, [
                h('div', { class: 'ml-2' }, [
                  h('p', { style: 'margin-bottom: -0.3rem;' }, row.username),
                  h('p', { class: 'email' }, row.email)
                ])
              ])
            }
          },
          { prop: 'realName', label: '姓名' },
          {
            prop: 'gender',
            label: '性别',
            sortable: true,
            width: 90,
            formatter: (row: { gender: number }) => {
              if (row.gender === 0) {
                // return h(ElTag, { type: 'primary' }, () => '男')
                return '男'
              } else if (row.gender === 1) {
                // return h(ElTag, { type: 'warning' }, () => '女')
                return '女'
              } else {
                // return h(ElTag, { type: 'danger' }, () => '未知')
                return '未知'
              }
            }
          },
          { prop: 'mobile', label: '手机号', width: 140 },
          { prop: 'tenantName', label: '租户' },
          {
            prop: 'status',
            label: '状态',
            formatter: (row: { status: number }) => {
              if (row.status === 1) {
                // return h(ElTag, { type: 'success' }, () => '正常')
                return '正常'
              } else {
                // return h(ElTag, { type: 'warning' }, () => '停用')
                return '停用'
              }
            }
          },
          {
            prop: 'operation',
            label: '操作',
            width: 70,
            fixed: 'right', // 固定列
            formatter: (row: Api.SystemManage.UserListItem) =>
              h('div', [
                h(ArtButtonTable, {
                  type: 'delete',
                  onClick: () => deleteUser(row)
                })
              ])
          }
        ]
      },
      // 数据处理
      transform: {
        // 数据转换器 - 替换头像
        dataTransformer: (records: any[]) => {
          // 类型守卫检查
          if (!Array.isArray(records)) {
            console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
            return []
          }

          // 使用本地头像替换接口返回的头像
          return records.map((item) => {
            return {
              ...item,
              avatar: ''
            }
          })
        }
      }
    })

  // 初始化表单数据
  const initFormData = () => {
    const row = props.paramsData
    if (row.tenantId) {
      tenantId.value = row.tenantId
      getData({ tenantId: row.tenantId })
      getDataL({ tenantFlag: 0, deptId: row.deptId })
    } else {
      ElMessage.warning('无租户信息，查询失败')
      drawerVisible.value = false
    }
  }
  // 加载数据-左
  const refreshDataL = () => {
    getDataL({ tenantFlag: 0 })
  }
  // 加载数据-右
  const refreshData = () => {
    if (tenantId.value) {
      getData({ tenantId: tenantId.value })
    } else {
      ElMessage.warning('无租户信息，查询失败')
    }
  }
  // 统一监听对话框状态变化
  watch(
    () => [props.visible, props.type, props.paramsData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: false }
  )

  const deleteUser = (row: UserListItem): void => {
    console.log('row', row)
    ElMessageBox.confirm(`确定解除"${row.username}"绑定吗？`, '解绑确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        const userIds: string[] = []
        userIds.push(row.id)
        unBindTenantUser(tenantId.value, userIds).then(() => {
          ElMessage.success('操作成功')
          refreshData()
          refreshDataL()
        })
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
  // 事件处理函数
  const handleSelectionChange = (selection: UserListItem[]) => {
    userPendingRows.value = selection
  }
  const bindUser = () => {
    if (userPendingRows.value && userPendingRows.value.length) {
      const userIds: string[] = []
      userPendingRows.value.forEach((item) => {
        userIds.push(item.id)
      })
      bindTenantUser(tenantId.value, userIds).then(() => {
        ElMessage.success('操作成功')
        refreshData()
        refreshDataL()
      })
    } else {
      ElMessage.warning('请勾选需要绑定的用户')
    }
  }
</script>
