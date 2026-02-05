<template>
  <el-drawer v-model="drawerVisible" title="配置字典" size="50%">
    <!-- 表格头部 -->
    <ArtTableHeader v-model:layout="layout" :loading="loading" @refresh="refreshData">
      <template #left>
        <ElSpace wrap>
          <ElButton type="primary" @click="buttonClick()" v-ripple>新增字典</ElButton>
        </ElSpace>
      </template>
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
  </el-drawer>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { FormInstance } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import { unBindTenantUser } from '@/api/system/user'
  import { fetchGetDictDataList } from '@/api/system/dict'

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

  // 对话框显示控制
  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const tenantId = ref('')
  const { columns, data, getData, loading, pagination, handleSizeChange, handleCurrentChange } =
    useTable({
      // 核心配置
      core: {
        apiFn: fetchGetDictDataList,
        apiParams: {},
        immediate: false,
        columnsFactory: () => [
          { type: 'index', width: 50 }, // 序号
          {
            prop: 'dictLabel',
            label: '字典标签',
            width: 200
          },
          { prop: 'dictValue', label: '字典值' },
          {
            prop: 'labelClass',
            label: '标签样式',
            sortable: true,
            width: 90
          },
          { prop: 'createTime', label: '创建时间', width: 140 },
          {
            prop: 'status',
            label: '状态',
            formatter: (row: { status: number }) => {
              if (row.status === 1) {
                return '正常'
              } else {
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
      transform: {}
    })

  // 初始化表单数据
  const initFormData = () => {
    const row = props.paramsData
    if (row.id) {
      getData({ dictTypeId: row.id })
    } else {
      ElMessage.warning('无字典类型信息，查询失败')
      drawerVisible.value = false
    }
  }
  // 加载数据-右
  const refreshData = () => {
    if (tenantId.value) {
      getData()
    } else {
      ElMessage.warning('无租户信息，查询失败')
    }
  }
  // 配置字典数据
  const buttonClick = () => {}
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
        })
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>
