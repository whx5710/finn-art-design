<!-- 参数管理页面 -->
<template>
  <div class="art-full-height">
    <DictSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></DictSearch>

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
                    id: '0',
                    dictName: '',
                    dictType: '',
                    remark: '',
                    sort: 1,
                    dictSource: 0,
                    dictSql: '',
                    dictTypeId: ''
                  }
                )
              "
              v-ripple
            >
              新增字典
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
      <DictDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :params-data="currentParamsData"
        @submit="handleDialogSubmit"
      />

      <!-- 字典配置 -->
      <DictDrawer
        v-model:visible="drawerVisible"
        :type="dialogType"
        :params-data="dictData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchDeleteDict, fetchGetDictList } from '@/api/system/dict'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import DictSearch from './modules/dict-search.vue'
  import DictDialog from './modules/dict-dialog.vue'
  import DictDrawer from './modules/dict-drawer.vue'
  import { ElTag, ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'Params' })

  type Dict = Api.SystemManage.Dict
  const drawerVisible = ref(false)
  const dictData = ref<Dict | undefined>(undefined)

  // 搜索表单
  const searchForm = ref({
    name: undefined,
    code: undefined,
    daterange: undefined
  })

  const showSearchBar = ref(false)
  const dialogVisible = ref(false)
  const currentParamsData = ref<Dict | undefined>(undefined)

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
      apiFn: fetchGetDictList,
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
          prop: 'dictType',
          label: '字典类型',
          minWidth: 120
        },
        {
          prop: 'dictName',
          label: '字典名称',
          minWidth: 120
        },
        {
          prop: 'dictSource',
          label: '字典来源',
          align: 'center',
          width: 110,
          formatter: (row: Dict) => {
            const statusConfig =
              row.dictSource === 1
                ? { type: 'warning', text: 'SQL脚本' }
                : { type: 'success', text: '字典数据' }
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
                    label: '编辑',
                    icon: 'ri:edit-2-line'
                  },
                  {
                    key: 'config',
                    label: '配置',
                    icon: 'ri:settings-5-line'
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

  const showDialog = (type: 'add' | 'edit', row?: Dict) => {
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

  const buttonMoreClick = (item: ButtonMoreItem, row: Dict) => {
    switch (item.key) {
      case 'add':
        showDialog('add', row)
        break
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        deleteDict(row)
        break
      case 'config':
        configDict(row)
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

  const deleteDict = (row: Dict) => {
    ElMessageBox.confirm(`确定删除"${row.dictName}"字典吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        // TODO: 调用删除接口
        fetchDeleteDict([row.id]).then(() => {
          ElMessage.success('删除成功')
          refreshData()
        })
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }

  /**
   * 配置租户
   */
  const configDict = (row?: Dict) => {
    dictData.value = row
    drawerVisible.value = true
  }
</script>
