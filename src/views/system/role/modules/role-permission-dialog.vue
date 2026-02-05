<template>
  <ElDrawer
    v-model="visible"
    title="菜单权限"
    size="520px"
    align-center
    class="el-dialog-border"
    @close="handleClose"
  >
    <ElScrollbar height="75vh">
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="80px">
        <ElFormItem label="角色名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入角色名称" />
        </ElFormItem>
        <ElFormItem label="角色编码" prop="code">
          <ElInput v-model="form.code" placeholder="请输入角色编码" />
        </ElFormItem>
        <ElFormItem label="描述" prop="remark">
          <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </ElFormItem>
        <ElFormItem label="菜单权限" prop="menuIdList">
          <ElTree
            ref="treeRef"
            :data="processedMenuList"
            show-checkbox
            node-key="id"
            :default-expand-all="isExpandAll"
            :default-checked-keys="form.menuIdList"
            :props="defaultProps"
            @check="handleTreeCheck"
          >
            <template #default="{ data }">
              <div style="display: flex; align-items: center">
                <span v-if="data.isAuth">
                  {{ data.label }}
                </span>
                <span v-else>{{ defaultProps.label(data) }}</span>
              </div>
            </template>
          </ElTree>
        </ElFormItem>
      </ElForm>
    </ElScrollbar>
    <template #footer>
      <div class="dialog-footer">
        <!-- <ElButton @click="outputSelectedData" style="margin-left: 8px">获取选中数据</ElButton> -->

        <ElButton @click="toggleExpandAll">{{ isExpandAll ? '全部收起' : '全部展开' }}</ElButton>
        <!-- <ElButton @click="toggleSelectAll" style="margin-left: 8px">{{
          isSelectAll ? '取消全选' : '全部选择'
        }}</ElButton> -->
        <ElButton type="primary" @click="savePermission">保存</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { formatMenuTitle } from '@/utils/router'
  import { fetchGetMenuList } from '@/api/system/manage'
  import { fetchSaveRole, fetchUpdateRole } from '@/api/system/role'
  import type { FormInstance, FormRules } from 'element-plus'

  type RoleListItem = Api.SystemManage.RoleListItem

  interface Props {
    modelValue: boolean
    roleData?: RoleListItem
    type?: string
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const formRef = ref<FormInstance>()

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    roleData: undefined,
    type: 'add'
  })

  const emit = defineEmits<Emits>()

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const treeRef = ref()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)

  let form = ref<RoleListItem>({
    id: 0,
    code: '',
    name: '',
    remark: '',
    createTime: '',
    isSystem: 0,
    menuIdList: []
  })

  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    code: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ]
    // remark: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
  })

  /**
   * 树形组件配置
   */
  const defaultProps = {
    children: 'children',
    label: (data: any) => formatMenuTitle(data.meta?.title) || ''
  }

  // 菜单数据
  let processedMenuList = ref()
  /**
   * 监听弹窗打开，初始化权限数据
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      fetchGetMenuList({ type: 'all' }).then((res) => {
        processedMenuList.value = res
        if (newVal && props.roleData) {
          // TODO: 根据角色加载对应的权限数据
          form.value = props.roleData
        }
        // else {
        //   formRef.value?.resetFields()
        //   console.log('重置 =============');
        // }
      })
    }
  )

  /**
   * 关闭弹窗并清空选中状态
   */
  const handleClose = () => {
    visible.value = false
    // treeRef.value?.setCheckedKeys([])
  }

  /**
   * 保存权限配置
   */
  const savePermission = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      const tree = treeRef.value
      // 获取选中的节点数据
      const checkedNodes = tree.getCheckedNodes()
      // 获取半选中的节点数据
      const halfCheckedNodes = tree.getHalfCheckedNodes()
      let params: RoleListItem = form.value
      params.menuIdList = []
      if (checkedNodes) {
        checkedNodes.forEach((item: { id: any }) => {
          params.menuIdList.push(item.id)
        })
      }
      // 半选
      if (halfCheckedNodes) {
        halfCheckedNodes.forEach((item: { id: any }) => {
          params.menuIdList.push(item.id)
        })
      }
      // 去重
      params.menuIdList = Array.from(new Set(params.menuIdList))
      if (props.type === 'edit') {
        // TODO: 调用修改权限接口
        fetchUpdateRole(params).then(() => {
          ElMessage.success('修改成功')
          emit('success')
          handleClose()
        })
      } else {
        // TODO: 调用保存权限接口
        fetchSaveRole(params).then(() => {
          ElMessage.success('保存成功')
          emit('success')
          handleClose()
        })
      }
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  /**
   * 切换全部展开/收起状态
   */
  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return

    const nodes = tree.store.nodesMap
    // 这里保留 any，因为 Element Plus 的内部节点类型较复杂
    Object.values(nodes).forEach((node: any) => {
      node.expanded = !isExpandAll.value
    })

    isExpandAll.value = !isExpandAll.value
  }

  /**
   * 递归获取所有节点的 key
   * @param nodes 节点列表
   * @returns 所有节点的 key 数组
   */
  const getAllNodeKeys = (nodes: any[]): string[] => {
    const keys: string[] = []
    const traverse = (nodeList: any[]) => {
      nodeList.forEach((node) => {
        if (node.name) {
          keys.push(node.name)
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children)
        }
      })
    }
    traverse(nodes)
    return keys
  }

  /**
   * 处理树节点选中状态变化
   * 同步更新全选按钮状态
   */
  const handleTreeCheck = () => {
    const tree = treeRef.value
    if (!tree) return

    const checkedKeys = tree.getCheckedKeys()
    const allKeys = getAllNodeKeys(processedMenuList.value)

    isSelectAll.value = checkedKeys.length === allKeys.length && allKeys.length > 0
  }
</script>
