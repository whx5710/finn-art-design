<!-- 参数管理页面 -->
<template>
  <div class="art-full-height">
    <TenantSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></TenantSearch>

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton
              @click="
                buttonMoreClick(
                  { key: 'add', label: '' },
                  {
                    id: '0',
                    tenantName: '',
                    tenantId: '',
                    note: '',
                    status: 1,
                    sort: 0
                  }
                )
              "
              v-ripple
            >
              新增租户
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        :highlight-current-row="true"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
      <!-- 租户弹窗 -->
      <TenantDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :params-data="currentParamsData"
        @submit="handleDialogSubmit"
      />

      <!-- 租户配置 -->
      <TenantDrawer
        v-model:visible="drawerVisible"
        :type="dialogType"
        :params-data="tenantUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetTenantList, deleteTenant } from '@/api/system/user'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import TenantSearch from './modules/tenant-search.vue'
  import TenantDialog from './modules/tenant-dialog.vue'
  import TenantDrawer from './modules/tenant-drawer.vue'
  import { ElTag, ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'Tenant' })

  type TenantInfo = Api.SystemManage.TenantInfo

  // 搜索表单
  const searchForm = ref({
    name: undefined,
    code: undefined,
    daterange: undefined
  })

  const showSearchBar = ref(false)
  const dialogVisible = ref(false)
  const drawerVisible = ref(false)
  const currentParamsData = ref<TenantInfo | undefined>(undefined)
  const tenantUserData = ref<TenantInfo | undefined>(undefined)

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
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetTenantList,
      // apiParams: {
      //   pageNum: 1,
      //   pageSize: 20
      // },
      // 排除 apiParams 中的属性
      excludeParams: ['daterange'],
      columnsFactory: () => [
        {
          type: 'index',
          prop: 'index',
          label: '序号',
          width: 70
        },
        {
          prop: 'tenantId',
          label: '租户编码',
          minWidth: 120
        },
        {
          prop: 'tenantName',
          label: '租户名',
          minWidth: 120
        },
        {
          prop: 'note',
          label: '备注',
          minWidth: 120
        },
        {
          prop: 'status',
          label: '状态',
          align: 'center',
          width: 80,
          formatter: (row: TenantInfo) => {
            const statusConfig =
              row.status == 1
                ? { type: 'success', text: '正常' }
                : { type: 'warning', text: '停用' }
            return h(
              ElTag,
              { type: statusConfig.type as 'success' | 'warning' },
              () => statusConfig.text
            )
          }
        },
        {
          prop: 'createTime',
          label: '创建日期',
          width: 180,
          sortable: true
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
                    key: 'append',
                    label: '配置用户',
                    icon: 'ri:user-received-line'
                  },
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

  const dialogType = ref<'add' | 'edit'>('add')
  /**
   * 新增修改租户
   * @param type 类型
   * @param row 数据
   */
  const showDialog = (type: 'add' | 'edit', row?: TenantInfo) => {
    dialogType.value = type
    currentParamsData.value = row
    nextTick(() => {
      dialogVisible.value = true
    })
  }
  /**
   * 配置租户
   */
  const configTenant = (row?: TenantInfo) => {
    tenantUserData.value = row
    drawerVisible.value = true
  }

  /**
   * 搜索处理
   * @param params 搜索参数
   */
  const handleSearch = (params: Record<string, any>) => {
    // 处理日期区间参数，把 daterange 转换为 startTime 和 endTime
    const { daterange, ...filtersParams } = params
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]

    // 搜索参数赋值
    Object.assign(searchParams, { ...filtersParams, startTime, endTime })
    getData()
  }

  const buttonMoreClick = (item: ButtonMoreItem, row: TenantInfo) => {
    switch (item.key) {
      case 'append':
        configTenant(row)
        break
      case 'add':
        showDialog('add', row)
        break
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        deleteParams(row)
        break
    }
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      // initData()
      getData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  const deleteParams = (row: TenantInfo) => {
    ElMessageBox.confirm(`确定删除参数"${row.tenantName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        // TODO: 调用删除接口
        deleteTenant(row.id).then(() => {
          ElMessage.success('删除成功')
          refreshData()
        })
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>
