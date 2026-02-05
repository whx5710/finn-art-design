<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加部门' : '编辑部门'"
    width="30%"
    :draggable="true"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="上级ID" prop="id" v-show="false">
        <ElInput v-model="formData.id" />
      </ElFormItem>
      <ElFormItem label="上级部门" prop="parentName">
        <el-tree-select
          v-model="formData.parentId"
          :data="deptList"
          value-key="id"
          check-strictly
          :render-after-expand="false"
          :props="{ label: 'name', children: 'children' }"
          style="width: 100%"
          filterable
          :default-expanded-keys="expandedKeys"
        />
      </ElFormItem>
      <ElFormItem label="部门名称" prop="name">
        <ElInput v-model="formData.name" />
      </ElFormItem>
      <ElFormItem label="排序" prop="sort">
        <ElInputNumber v-model="formData.sort" :min="1" />
      </ElFormItem>
      <ElFormItem label="备注" prop="note">
        <ElInput v-model="formData.note" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { fetchSaveDept, fetchUpdateDept, fetchGetDeptList } from '@/api/system/dept'

  interface Props {
    visible: boolean
    type: string
    deptData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const deptList = ref()
  const expandedKeys = ref<number[]>([])
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    id: '0',
    name: '',
    parentId: '0',
    parentName: '',
    note: '',
    sort: 1
  })

  // 表单验证规则
  const rules: FormRules = {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ]
  }

  // 初始化表单数据
  const initFormData = () => {
    fetchGetDeptList({}).then((res) => {
      deptList.value = res
      if (deptList.value && deptList.value.length > 0) {
        deptList.value.forEach((element: { id: number }) => {
          expandedKeys.value.push(element.id)
        })
      } else {
        deptList.value.push({ id: '0', name: '根目录' })
        expandedKeys.value.push(0)
      }
    })
    const isEdit = props.type === 'edit' && props.deptData
    const row = props.deptData
    Object.assign(formData, {
      id: isEdit ? row.id : undefined,
      parentId: row.parentId || '0',
      parentName: row.parentName,
      name: isEdit ? row.name || '' : '',
      sort: isEdit ? row.sort || 1 : 1,
      note: isEdit ? row.note || '' : ''
    })
  }

  // 统一监听对话框状态变化
  watch(
    () => [props.visible, props.type, props.deptData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (valid) {
        if (dialogType.value === 'add') {
          fetchSaveDept(formData).then(() => {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            emit('submit')
          })
        } else {
          fetchUpdateDept(formData).then(() => {
            ElMessage.success('更新成功')
            dialogVisible.value = false
            emit('submit')
          })
        }
      }
    })
  }
</script>
