<!-- 参数管理页面 -->
<template>
  <div class="art-full-height">
    <ParamsSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></ParamsSearch>

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
              type="primary"
              @click="
                buttonMoreClick(
                  { key: 'add', label: '' },
                  {
                    id: 0,
                    paramName: '',
                    paramKey: '',
                    remark: '',
                    createTime: '',
                    paramType: 0,
                    idList: []
                  }
                )
              "
              v-ripple
            >
              新增参数
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
      <!-- 参数弹窗 -->
      <ParamsDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :params-data="currentParamsData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchDeleteParams, fetchGetParamsList } from '@/api/system/manage'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import ParamsSearch from './modules/params-search.vue'
  import ParamsDialog from './modules/params-dialog.vue'
  import { ElTag, ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'Params' })

  type ParamsInfo = Api.SystemManage.ParamsInfo

  // 搜索表单
  const searchForm = ref({
    name: undefined,
    code: undefined,
    daterange: undefined
  })

  const showSearchBar = ref(false)
  const dialogVisible = ref(false)
  const currentParamsData = ref<ParamsInfo | undefined>(undefined)

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
      apiFn: fetchGetParamsList,
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
          prop: 'paramName',
          label: '参数名称',
          minWidth: 120
        },
        {
          prop: 'paramKey',
          label: '参数KEY',
          minWidth: 120
        },
        {
          prop: 'paramValue',
          label: '参数值',
          minWidth: 120
        },
        {
          prop: 'paramType',
          label: '系统参数',
          align: 'center',
          width: 110,
          formatter: (row: ParamsInfo) => {
            const statusConfig =
              row.paramType == 1 ? { type: 'warning', text: '是' } : { type: 'success', text: '否' }
            return h(
              ElTag,
              { type: statusConfig.type as 'success' | 'warning' },
              () => statusConfig.text
            )
          }
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 150,
          showOverflowTooltip: true
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
                    key: 'edit',
                    label: '编辑参数',
                    icon: 'ri:edit-2-line'
                  },
                  {
                    key: 'delete',
                    label: '删除参数',
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

  const showDialog = (type: 'add' | 'edit', row?: ParamsInfo) => {
    dialogType.value = type
    currentParamsData.value = row
    nextTick(() => {
      dialogVisible.value = true
    })
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

  const buttonMoreClick = (item: ButtonMoreItem, row: ParamsInfo) => {
    switch (item.key) {
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

  const deleteParams = (row: ParamsInfo) => {
    ElMessageBox.confirm(`确定删除参数"${row.paramName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        // TODO: 调用删除接口
        fetchDeleteParams([row.id]).then(() => {
          ElMessage.success('删除成功')
          refreshData()
        })
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>
