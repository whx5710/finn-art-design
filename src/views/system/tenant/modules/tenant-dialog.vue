<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加参数' : '编辑参数'"
    width="30%"
    :draggable="true"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="ID" prop="id" v-show="false">
        <ElInput v-model="formData.id" />
      </ElFormItem>
      <ElFormItem label="租户ID" prop="tenantId">
        <ElInput v-if="isEdit" v-model="formData.tenantId" disabled />
        <ElInput v-else v-model="formData.tenantId" />
      </ElFormItem>
      <ElFormItem label="租户名" prop="tenantName">
        <ElInput v-model="formData.tenantName" />
      </ElFormItem>
      <ElFormItem prop="deptId" label="根部门">
        <el-tree-select
          v-if="dialogType === 'add'"
          v-model="formData.deptId"
          :data="deptList"
          value-key="id"
          check-strictly
          :render-after-expand="false"
          :props="{ label: 'name', children: 'children' }"
          style="width: 100%"
          filterable
        />
        <el-tree-select
          v-else
          v-model="formData.deptId"
          :data="deptList"
          value-key="id"
          check-strictly
          :render-after-expand="false"
          :props="{ label: 'name', children: 'children' }"
          style="width: 100%"
          disabled
        />
      </ElFormItem>
      <ElFormItem prop="statusShow" label="状态">
        <el-switch v-model="formData.statusShow" active-text="正常" inactive-text="停用" />
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
  import { fetchUpdateTenant, fetchSaveTenant } from '@/api/system/user'
  import { fetchGetDeptList } from '@/api/system/dept'

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
  const deptList = ref()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)
  let isEdit = false

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    id: 0,
    tenantId: '',
    tenantName: '',
    note: '',
    sort: 1,
    status: 1,
    statusShow: true,
    deptId: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    tenantName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    tenantId: [{ required: true, message: '请输入租户编码', trigger: 'blur' }],
    deptId: [{ required: true, message: '根部门为空', trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    isEdit = props.type === 'edit' && props.paramsData
    const row = props.paramsData
    Object.assign(formData, {
      id: isEdit ? row.id : undefined,
      tenantId: isEdit ? row.tenantId || '' : '',
      tenantName: isEdit ? row.tenantName || '' : '',
      sort: isEdit ? row.sort || 1 : 1,
      status: isEdit ? row.status || 0 : 0,
      statusShow: row.status === 1 ? true : false,
      note: isEdit ? row.note || '' : '',
      deptId: isEdit ? row.deptId : ''
    })
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
    { immediate: true }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (valid) {
        formData.status = formData.statusShow ? 1 : 0
        if (dialogType.value === 'add') {
          fetchSaveTenant(formData).then(() => {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            emit('submit')
          })
        } else {
          fetchUpdateTenant(formData).then(() => {
            ElMessage.success('更新成功')
            dialogVisible.value = false
            emit('submit')
          })
        }
      }
    })
  }
  // 部门列表
  fetchGetDeptList({}).then((res) => {
    deptList.value = res
  })
</script>
