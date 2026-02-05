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
      <ElFormItem label="参数KEY" prop="paramKey">
        <ElInput v-if="isEdit" v-model="formData.paramKey" disabled />
        <ElInput v-else v-model="formData.paramKey" />
      </ElFormItem>
      <ElFormItem label="参数名称" prop="paramName">
        <ElInput v-model="formData.paramName" />
      </ElFormItem>
      <ElFormItem label="参数值" prop="paramValue">
        <ElInput v-model="formData.paramValue" />
      </ElFormItem>
      <ElFormItem prop="paramTypeShow" label="系统参数">
        <el-switch v-model="formData.paramTypeShow" active-text="是" inactive-text="否" />
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formData.remark" />
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
  import { fetchSaveParams, fetchUpdateParams } from '@/api/system/manage'

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
    paramName: '',
    paramKey: '',
    paramValue: '',
    paramType: 0,
    paramTypeShow: false,
    remark: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    paramValue: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    isEdit = props.type === 'edit' && props.paramsData
    const row = props.paramsData
    console.log('=====row', row)
    Object.assign(formData, {
      id: isEdit ? row.id : undefined,
      paramName: isEdit ? row.paramName || '' : '',
      paramKey: isEdit ? row.paramKey || '' : '',
      paramValue: isEdit ? row.paramValue || '' : '',
      paramType: isEdit ? row.paramType || 0 : 0,
      paramTypeShow: row.paramType === 1 ? true : false,
      remark: isEdit ? row.remark || '' : ''
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
        formData.paramType = formData.paramTypeShow ? 1 : 0
        if (dialogType.value === 'add') {
          fetchSaveParams(formData).then(() => {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            emit('submit')
          })
        } else {
          fetchUpdateParams(formData).then(() => {
            ElMessage.success('更新成功')
            dialogVisible.value = false
            emit('submit')
          })
        }
      }
    })
  }
</script>
