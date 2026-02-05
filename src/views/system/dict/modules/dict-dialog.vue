<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加字典' : '编辑字典'"
    width="30%"
    :draggable="true"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="ID" prop="id" v-show="false">
        <ElInput v-model="formData.id" />
      </ElFormItem>
      <ElFormItem label="字典类型" prop="dictType">
        <ElInput v-if="isEdit" v-model="formData.dictType" disabled />
        <ElInput v-else v-model="formData.dictType" />
      </ElFormItem>
      <ElFormItem label="字典名称" prop="dictName">
        <ElInput v-model="formData.dictName" />
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formData.remark" />
      </ElFormItem>
      <ElFormItem label="排序" prop="sort">
        <ElInputNumber v-model="formData.sort" :min="1" />
      </ElFormItem>
      <ElFormItem prop="dictSource" label="字典来源">
        <ElRadioGroup v-model="formData.dictSource">
          <ElRadioButton value="0">字典数据</ElRadioButton>
          <ElRadioButton value="1">动态SQL</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="SQL脚本" prop="dictSql" v-show="formData.dictSource === '1'">
        <ElInput v-model="formData.dictSql" type="textarea" :rows="3" />
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
    dictName: '',
    dictType: '',
    sort: '',
    dictSource: '0',
    dictSql: '',
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
      dictName: isEdit ? row.dictName || '' : '',
      dictType: isEdit ? row.dictType || '' : '',
      dictSource: isEdit ? row.dictSource + '' : '0',
      sort: isEdit ? row.sort : 1,
      dictSql: isEdit ? row.dictSql : '',
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
        // formData.paramType = formData.paramTypeShow ? 1 : 0
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
