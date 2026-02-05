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
        <DeptSearch v-model="defaultFilter" @search="handleSearch" @reset="resetSearchParams" />

        <ElCard class="flex flex-col flex-1 min-h-0 art-table-card" shadow="never">
          <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
            <template #left>
              <ElSpace wrap>
                <ElButton @click="showDialog('add')" v-ripple type="primary" plain>新增</ElButton>
              </ElSpace>
            </template>
          </ArtTableHeader>

          <ArtTable
            rowKey="id"
            show-overflow-tooltip
            :highlight-current-row="true"
            :loading="loading"
            :data="data"
            :columns="columns"
            :pagination="pagination"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
          >
          </ArtTable>
          <!-- 部门弹窗 -->
          <DeptDialog
            v-model:visible="dialogVisible"
            :type="dialogType"
            :dept-data="currentDeptData"
            @submit="handleDialogSubmit"
          />
        </ElCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetDeptList, fetchGetDeptPage, fetchDeleteDept } from '@/api/system/dept'
  import { ElButton, ElCard, ElMessage, ElMessageBox } from 'element-plus'
  import DeptSearch from './modules/dept-search.vue'
  import DeptDialog from './modules/dept-dialog.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import type { FilterNodeMethodFunction, TreeInstance } from 'element-plus'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'Dept' })

  const { hasAuth } = useAuth()
  const deptList = ref()
  const expandedKeys = ref<number[]>([])
  const filterText = ref('')
  const treeRef = ref<TreeInstance>()

  type DeptListItem = Api.SystemManage.DeptListItem

  // 弹窗
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentDeptData = ref<Partial<DeptListItem>>({ parentId: '0', parentName: '根目录' })

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
      p = { parentId: params.id }
      currentDeptData.value.parentId = params.id
      currentDeptData.value.parentName = params.name
    } else {
      p = {}
      currentDeptData.value.parentId = '0'
      currentDeptData.value.parentName = '根目录'
    }
    getData(p)
  }

  // 表单搜索初始值
  const defaultFilter = ref({
    name: undefined
  })

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      initData() // 部门树
      getData(
        currentDeptData.value.parentId !== '0' ? { parentId: currentDeptData.value.parentId } : {}
      )
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 显示弹窗
   */
  const showDialog = (type: 'add' | 'edit', row?: DeptListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    if (row) {
      currentDeptData.value = row
      if (!currentDeptData.value.parentName) {
        currentDeptData.value.parentName = '根目录'
      }
    }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  watch(filterText, (val) => {
    treeRef.value!.filter(val)
  })

  // 点击更多按钮
  const buttonMoreClick = (item: ButtonMoreItem, row: DeptListItem) => {
    switch (item.key) {
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        console.log('row = ', row)
        deleteRole(row)
        break
    }
  }

  const deleteRole = (row: DeptListItem) => {
    ElMessageBox.confirm(`确定删除部门"${row.name}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        // TODO: 调用删除接口
        fetchDeleteDept(row.id).then(() => {
          ElMessage.success('删除成功')
          refreshData()
        })
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }

  interface Tree {
    [key: string]: any
  }

  // 过滤筛选
  const filterNode: FilterNodeMethodFunction = (value: string, data: Tree) => {
    if (!value) return true
    return data.name.includes(value)
  }

  /**
   * 搜索处理
   * @param params 搜索参数
   */
  const handleSearch = (params: Record<string, any>) => {
    const { ...filtersParams } = params
    // 搜索参数赋值
    Object.assign(searchParams, { ...filtersParams })
    getData()
  }

  const {
    data,
    columns,
    columnChecks,
    getData,
    searchParams,
    resetSearchParams,
    loading,
    pagination,
    refreshData,
    handleSizeChange,
    handleCurrentChange
  } = useTable({
    core: {
      apiFn: fetchGetDeptPage,
      apiParams: {
        pageNum: 1,
        pageSize: 20,
        name: '',
        note: ''
      },
      columnsFactory: () => [
        { type: 'index', width: 70, label: '序号' }, // 序号
        {
          prop: 'id',
          label: 'ID',
          width: 50,
          visible: false // 隐藏
        },
        {
          prop: 'name',
          label: '名称'
        },
        {
          prop: 'parentName',
          label: '上级部门',
          visible: false // 隐藏
        },
        {
          prop: 'tenantId',
          label: '租户ID',
          sortable: true,
          visible: hasAuth('tenant:member:save')
        },
        {
          prop: 'tenantName',
          label: '租户',
          visible: hasAuth('tenant:member:save')
        },
        {
          prop: 'note',
          label: '备注'
        },
        {
          prop: 'createTime',
          label: '创建时间'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
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
    }
  })
</script>

<style scoped>
  .tree-card :deep(.el-card__body) {
    flex: 1;
    min-height: 0;
    padding: 10px;
  }
</style>
