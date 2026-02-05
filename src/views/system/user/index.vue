<!-- 用户管理页面 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的 高级表格示例或者查看官方文档 -->
<!-- useTable 文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->

<!-- 左树右表示例页面 -->
<template>
  <div class="art-full-height">
    <div class="box-border flex gap-4 h-full max-md:block max-md:gap-0 max-md:h-auto">
      <div class="flex-shrink-0 w-66 h-full max-md:w-full max-md:h-auto max-md:mb-5">
        <ElCard class="tree-card flex flex-col h-full mt-0" shadow="never">
          <el-input v-model="filterText" class="mb-1.5" placeholder="关键字" />
          <ElScrollbar>
            <ElTree
              ref="treeRef"
              :data="deptList"
              node-key="id"
              :expand-on-click-node="false"
              @node-click="getDeptById"
              :filter-node-method="filterNode"
              :default-expanded-keys="expandedKeys"
            >
              <template #default="{ data }">
                <div style="display: flex; align-items: center">
                  {{ data.name }}
                </div>
              </template>
            </ElTree>
          </ElScrollbar>
        </ElCard>
      </div>

      <div class="flex flex-col flex-grow min-w-0">
        <!-- 搜索栏 -->
        <UserSearch
          v-model="searchForm"
          @search="handleSearch"
          @reset="resetSearchParams"
        ></UserSearch>

        <ElCard class="art-table-card" shadow="never">
          <!-- 表格头部 -->
          <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
            <template #left>
              <ElSpace wrap>
                <ElButton @click="showDialog('add')" v-ripple>新增用户</ElButton>
              </ElSpace>
            </template>
          </ArtTableHeader>

          <!-- 表格 -->
          <ArtTable
            :loading="loading"
            :data="data"
            :columns="columns"
            :pagination="pagination"
            @selection-change="handleSelectionChange"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
          >
          </ArtTable>

          <!-- 用户弹窗 -->
          <UserDialog
            v-model:visible="dialogVisible"
            :type="dialogType"
            :user-data="currentUserData"
            @submit="handleDialogSubmit"
          />
        </ElCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchDeleteUser, fetchGetUserList } from '@/api/system/user'
  import { fetchGetDeptList } from '@/api/system/dept'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElTag, ElMessage, ElMessageBox, ElImage } from 'element-plus'
  import { DialogType } from '@/types'
  import type { FilterNodeMethodFunction, TreeInstance } from 'element-plus'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'User' })
  interface Tree {
    [key: string]: any
  }

  type UserListItem = Api.SystemManage.UserListItem
  type DeptListItem = Api.SystemManage.DeptListItem
  const deptList = ref()
  const filterText = ref('')
  const treeRef = ref<TreeInstance>()
  const currentDeptData = ref<Partial<DeptListItem>>({ parentId: '0', parentName: '根目录' })
  const { hasAuth } = useAuth()

  const expandedKeys = ref<number[]>([])
  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    username: undefined,
    gender: undefined,
    mobile: undefined,
    email: undefined,
    status: undefined
  })

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        // pageNum: 1,
        // pageSize: 20,
        ...searchForm.value
      },
      // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 70, label: '序号' }, // 序号
        {
          prop: 'userInfo',
          label: '用户名',
          width: 220,
          // visible: false, // 默认是否显示列
          formatter: (row) => {
            return h('div', { class: 'user flex-c' }, [
              h(ElImage, {
                class: 'size-8 rounded-md',
                src: row.avatar,
                previewSrcList: [row.avatar],
                // 图片预览是否插入至 body 元素上，用于解决表格内部图片预览样式异常
                previewTeleported: true
              }),
              h('div', { class: 'ml-1' }, [
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
          width: 80,
          formatter: (row) => {
            if (row.gender === 0) {
              return h(ElTag, { type: 'primary' }, () => '男')
            } else if (row.gender === 1) {
              return h(ElTag, { type: 'warning' }, () => '女')
            } else {
              return h(ElTag, { type: 'danger' }, () => '未知')
            }
          }
        },
        { prop: 'mobile', label: '手机号', width: 140 },
        { prop: 'tenantName', label: '租户', visible: hasAuth('tenant:member:save') },
        {
          prop: 'status',
          label: '状态',
          formatter: (row) => {
            if (row.status === 1) {
              return h(ElTag, { type: 'success' }, () => '正常')
            } else {
              return h(ElTag, { type: 'warning' }, () => '停用')
            }
          }
        },
        {
          prop: 'createTime',
          label: '创建日期',
          width: 180,
          sortable: true,
          visible: false // 隐藏
        },
        {
          prop: 'operation',
          label: '操作',
          fixed: 'right', // 固定列
          width: 65,
          formatter: (row) =>
            h('div', [
              h(ArtButtonMore, {
                list: [
                  {
                    key: 'edit',
                    label: '编辑',
                    icon: 'ri:edit-2-line'
                  },
                  {
                    key: 'delete',
                    label: '删除',
                    icon: 'ri:delete-bin-4-line',
                    color: '#f56c6c'
                  }
                ],
                onClick: (item: ButtonMoreItem) => buttonMoreClick(item, row)
              })
            ])
        }
      ]
    },
    // 数据处理
    transform: {
      // 数据转换器 - 替换头像
      dataTransformer: (records) => {
        // 类型守卫检查
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }

        // 使用本地头像替换接口返回的头像
        return records.map((item, index: number) => {
          return {
            ...item,
            avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar
          }
        })
      }
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: DialogType, row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    if (type === 'edit' && row) {
      currentUserData.value = row
    } else {
      if (currentDeptData.value.parentId === '0') {
        currentUserData.value.deptId = ''
      } else {
        currentUserData.value.deptId = currentDeptData.value.parentId
      }
    }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: UserListItem): void => {
    console.log('删除用户:', row)
    ElMessageBox.confirm(`确定要删除该用户吗？`, '删除用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      fetchDeleteUser([row.id]).then(() => {
        ElMessage.success('删除成功')
        refreshRemove()
      })
    })
  }

  // 点击更多按钮
  const buttonMoreClick = (item: ButtonMoreItem, row: UserListItem) => {
    switch (item.key) {
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        deleteUser(row)
        break
    }
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
      getData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  // 初始化树形部门
  const initData = () => {
    fetchGetDeptList({}).then((res) => {
      deptList.value = res
      if (deptList.value) {
        deptList.value.forEach((element: { id: number }) => {
          expandedKeys.value.push(element.id)
        })
      }
    })
  }
  initData()

  // 点击部门
  const getDeptById = (params: any) => {
    let p = {}
    if (params.id !== '0') {
      p = { deptId: params.id }
      currentDeptData.value.parentId = params.id
      currentDeptData.value.parentName = params.name
    } else {
      p = {}
      currentDeptData.value.parentId = '0'
      currentDeptData.value.parentName = '根目录'
    }
    getData(p)
  }
  // 过滤筛选
  const filterNode: FilterNodeMethodFunction = (value: string, data: Tree) => {
    if (!value) return true
    return data.name.includes(value)
  }

  watch(filterText, (val) => {
    treeRef.value!.filter(val)
  })
  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>
<style scoped>
  .tree-card :deep(.el-card__body) {
    flex: 1;
    min-height: 0;
    padding: 10px;
  }

  /* Vue 3 中使用 :deep() */

  /* :deep(.el-table--default .cell) {
    padding: 0 4px;
  } */
</style>
