<template>
  <ElDialog
    :title="dialogTitle"
    :model-value="visible"
    @update:model-value="handleCancel"
    width="850px"
    align-center
    :draggable="true"
    @closed="handleClosed"
  >
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="formItems"
      :rules="rules"
      :span="width > 640 ? 12 : 24"
      :gutter="20"
      label-width="100px"
      :show-reset="false"
      :show-submit="false"
    >
      <template #menuType>
        <ElRadioGroup v-model="form.menuType" :disabled="disableMenuType">
          <ElRadioButton value="menu" label="menu">菜单</ElRadioButton>
          <ElRadioButton value="button" label="button">按钮</ElRadioButton>
        </ElRadioGroup>
      </template>
    </ArtForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取 消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确 定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import { ElIcon, ElTooltip } from 'element-plus'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import { formatMenuTitle } from '@/utils/router'
  import type { AppRouteRecord } from '@/types/router'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import { useWindowSize } from '@vueuse/core'

  const { width } = useWindowSize()

  /**
   * 创建带 tooltip 的表单标签
   * @param label 标签文本
   * @param tooltip 提示文本
   * @returns 渲染函数
   */
  const createLabelTooltip = (label: string, tooltip: string) => {
    return () =>
      h('span', { class: 'flex items-center' }, [
        h('span', label),
        h(
          ElTooltip,
          {
            content: tooltip,
            placement: 'top'
          },
          () => h(ElIcon, { class: 'ml-0.5 cursor-help' }, () => h(QuestionFilled))
        )
      ])
  }

  interface MenuFormData {
    id: number
    parentId: number
    parentName: string
    name: string
    path: string
    title: string
    component: string
    icon: string
    sort: number
    isMenu: boolean
    keepAlive: boolean
    isHide: boolean
    isHideTab: boolean
    isFullPage: boolean
    link: string
    isIframe: boolean
    showBadge: boolean
    showTextBadge: string
    fixedTab: boolean
    activePath: string
    authName: string
    authList: string[]
    authIcon: string
    mark: string
    menuMark: string
    menuType: string
  }

  interface Props {
    visible: boolean
    editData?: AppRouteRecord | any
    type?: 'menu' | 'button'
    lockType?: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: MenuFormData): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'menu',
    lockType: false
  })

  const emit = defineEmits<Emits>()

  const formRef = ref()
  const isEdit = ref(false)

  const form = reactive<MenuFormData>({
    id: 0,
    name: '',
    parentId: 0,
    parentName: '',
    path: '',
    title: '',
    component: '',
    icon: '',
    sort: 1,
    isMenu: true,
    keepAlive: true,
    isHide: false,
    isHideTab: false,
    isFullPage: false,
    link: '',
    isIframe: false,
    showBadge: false,
    showTextBadge: '',
    fixedTab: false,
    activePath: '',
    authName: '',
    authList: [],
    authIcon: '',
    mark: '',
    menuMark: '',
    menuType: ''
  })

  const rules = reactive<FormRules>({
    title: [
      { required: true, message: '请输入菜单名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    name: [{ required: true, message: '输入权限标识', trigger: 'blur' }],
    component: [{ required: false, message: '请输入组件路径', trigger: 'blur' }],
    authName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    authList: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
  })

  /**
   * 表单项配置
   */
  const formItems = computed<FormItem[]>(() => {
    const baseItems: FormItem[] = [{ label: '菜单类型', key: 'menuType', span: 24 }]

    // Switch 组件的 span：小屏幕 12，大屏幕 6
    const switchSpan = width.value < 640 ? 12 : 6

    if (form.menuType === 'menu') {
      return [
        ...baseItems,
        {
          label: '上级菜单ID',
          key: 'parentId',
          type: 'input',
          hidden: true,
          props: { placeholder: '上级菜单ID' }
        },
        {
          label: '上级菜单',
          key: 'parentName',
          type: 'input',
          props: { placeholder: '上级菜单', disabled: true }
        },
        { label: '菜单名称', key: 'title', type: 'input', props: { placeholder: '菜单名称' } },
        { label: '路由地址', key: 'path', type: 'input', props: { placeholder: '路由地址' } },
        {
          label: createLabelTooltip('菜单标识', '菜单的唯一标识'),
          key: 'name',
          type: 'input',
          props: { placeholder: '权限标识' }
        },
        { label: '组件路径', key: 'component', type: 'input', props: { placeholder: '组件路径' } },
        {
          label: '激活路径',
          key: 'activePath',
          type: 'input',
          props: { placeholder: '详情页激活选中的菜单路径' }
        },
        {
          label: '外部链接',
          key: 'link',
          type: 'input',
          props: { placeholder: '外部/内嵌地址(https://www.demo.com)' }
        },
        { label: '图标', key: 'icon', type: 'input', props: { placeholder: '图标名称' } },
        {
          label: '文本徽章',
          key: 'showTextBadge',
          type: 'input',
          props: { placeholder: '文本徽章内容' }
        },
        {
          label: '菜单排序',
          key: 'sort',
          type: 'number',
          props: { min: 1, controlsPosition: 'right', style: { width: '100%' } }
        },
        {
          label: '备注',
          key: 'menuMark',
          type: 'input',
          span: 24,
          props: { placeholder: '备注信息' }
        },
        // { label: '是否启用', key: 'isEnable', type: 'switch', span: switchSpan },
        { label: '页面缓存', key: 'keepAlive', type: 'switch', span: switchSpan },
        { label: '隐藏菜单', key: 'isHide', type: 'switch', span: switchSpan },
        { label: '是否内嵌', key: 'isIframe', type: 'switch', span: switchSpan },
        { label: '显示徽章', key: 'showBadge', type: 'switch', span: switchSpan },
        { label: '固定标签', key: 'fixedTab', type: 'switch', span: switchSpan },
        { label: '标签隐藏', key: 'isHideTab', type: 'switch', span: switchSpan },
        { label: '全屏页面', key: 'isFullPage', type: 'switch', span: switchSpan }
      ]
    } else {
      return [
        ...baseItems,
        {
          label: '上级菜单ID',
          key: 'parentId',
          type: 'input',
          hidden: true,
          props: { placeholder: '上级菜单ID' }
        },
        {
          label: '上级菜单',
          key: 'parentName',
          type: 'input',
          props: { placeholder: '上级菜单', disabled: true }
        },
        {
          label: '权限名称',
          key: 'authName',
          type: 'input',
          props: { placeholder: '权限名称' }
        },
        { label: '备注', key: 'mark', type: 'input', props: { placeholder: '备注' } },
        {
          label: '排序',
          key: 'sort',
          type: 'number',
          props: { min: 1, controlsPosition: 'right', style: { width: '100%' } }
        },
        { label: '权限标识', key: 'authList', type: 'inputtag', span: 24, props: { placeholder: '回车确认' } }
      ]
    }
  })

  const dialogTitle = computed(() => {
    const type = form.menuType === 'menu' ? '菜单' : '按钮'
    return isEdit.value ? `编辑${type}` : `新建${type}`
  })

  /**
   * 是否禁用菜单类型切换
   */
  const disableMenuType = computed(() => {
    if (isEdit.value) return true
    if (!isEdit.value && form.menuType === 'menu' && props.lockType) return true
    return false
  })

  /**
   * 重置表单数据
   */
  const resetForm = (): void => {
    formRef.value?.reset()
    form.menuType = 'menu'
  }

  /**
   * 加载表单数据（编辑模式）
   */
  const loadFormData = (): void => {
    const row = props.editData

    form.parentId = row.parentId || 0
    form.parentName = row.parentName || '根目录'
    // if (!props.editData.meta?.title) return
    isEdit.value = false
    if (row.id) {
      isEdit.value = true
    }
    if (form.menuType === 'menu') {
      form.id = row.id || 0
      form.title = formatMenuTitle(row.meta?.title || '')
      form.path = row.path || ''
      form.name = row.name || ''
      form.component = row.component || ''
      form.icon = row.meta?.icon || ''
      form.sort = row.meta?.sort || 1
      form.isMenu = row.meta?.isMenu ?? true
      form.keepAlive = row.meta?.keepAlive ?? false
      form.isHide = row.meta?.isHide ?? false
      form.isHideTab = row.meta?.isHideTab ?? false
      form.isFullPage = row.meta?.isFullPage ?? false
      form.link = row.meta?.link || ''
      form.isIframe = row.meta?.isIframe ?? false
      form.showBadge = row.meta?.showBadge ?? false
      form.showTextBadge = row.meta?.showTextBadge || ''
      form.fixedTab = row.meta?.fixedTab ?? false
      form.activePath = row.meta?.activePath || ''
      form.menuType = 'menu'
      form.menuMark = row.meta?.mark
    } else {
      form.id = row.id || 0
      form.authName = formatMenuTitle(row.meta?.title || '') || ''
      form.authList = row.authList || []
      form.authIcon = row.icon || ''
      form.sort = row.meta.sort || 1
      form.mark = row.meta.mark
      form.menuType = 'button'
    }
  }

  /**
   * 提交表单
   */
  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid: any) => {
      if (valid) {
        try {
          // form.menuType = menuType.value
          emit('submit', { ...form })
          handleCancel()
        } catch {
          ElMessage.error(`${isEdit.value ? '编辑' : '新增'}失败`)
        }
      }
    })
  }

  /**
   * 取消操作
   */
  const handleCancel = (): void => {
    emit('update:visible', false)
  }

  /**
   * 对话框关闭后的回调
   */
  const handleClosed = (): void => {
    resetForm()
    isEdit.value = false
  }

  /**
   * 监听对话框显示状态
   */
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        form.menuType = props.type
        nextTick(() => {
          if (props.editData) {
            loadFormData()
          }
        })
      }
    }
  )

  /**
   * 监听菜单类型变化
   */
  watch(
    () => props.type,
    (newType) => {
      if (props.visible) {
        form.menuType = newType
      }
    }
  )
</script>
