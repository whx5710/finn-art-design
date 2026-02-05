<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="50%"
    align-center
    :draggable="true"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-row>
        <el-col :span="12">
          <el-form-item prop="username" label="用户名">
            <el-input
              v-if="dialogType === 'add'"
              v-model="formData.username"
              placeholder="用户名"
            ></el-input>
            <el-input v-else v-model="formData.username" placeholder="用户名" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="realName" label="姓名">
            <el-input v-model="formData.realName" placeholder="姓名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="deptId" label="所属部门">
            <el-tree-select
              v-model="formData.deptId"
              :data="deptList"
              value-key="id"
              check-strictly
              :render-after-expand="false"
              :props="{ label: 'name', children: 'children' }"
              style="width: 100%"
              filterable
              clearable
              :default-expanded-keys="expandedKeys"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="gender" label="性别">
            <el-radio-group v-model="formData.gender">
              <el-radio :value="0">男</el-radio>
              <el-radio :value="1">女</el-radio>
              <el-radio :value="2">未知</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="mobile" label="手机号">
            <el-input v-model="formData.mobile" placeholder="手机号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="email" label="邮箱">
            <el-input v-model="formData.email" placeholder="邮箱"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="password" label="密码">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="密码"
              show-password
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="statusShow" label="状态">
            <el-switch v-model="formData.statusShow" active-text="启用" inactive-text="停用" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="postIdList" label="所属岗位">
            <el-select
              v-model="formData.postIdList"
              multiple
              placeholder="所属岗位"
              style="width: 100%"
            >
              <el-option
                v-for="post in postList"
                :key="post.id"
                :label="post.postName"
                :value="post.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="roleIdList" label="角色">
            <el-select
              v-model="formData.roleIdList"
              multiple
              placeholder="角色"
              style="width: 100%"
            >
              <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="secretKey">
            <template #label>
              <span>
                密钥
                <el-tooltip content="用于第三方登录，不校验验证码" placement="top" effect="dark">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </span>
            </template>
            <el-input v-model="formData.userKey" placeholder="用户密钥">
              <template #append>
                <el-button @click="generateUUID">随机</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="dialogType !== 'add'">
          <el-form-item prop="tenantName" label="租户">
            <el-input v-model="formData.tenantName" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
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
  import { QuestionFilled } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { addUser, fetchUpdateUser, getUserById } from '@/api/system/user'
  import { fetchGetRoleList } from '@/api/system/role'
  import { fetchGetDeptList } from '@/api/system/dept'

  interface Props {
    visible: boolean
    type: string
    userData?: Partial<Api.SystemManage.UserListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const expandedKeys = ref<number[]>([])

  // 角色列表数据
  //   const roleList = ref(ROLE_LIST_DATA)
  const deptList = ref()
  const postList = ref<any[]>([])
  const roleList = ref<any[]>([])

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
    username: '',
    realName: '',
    email: '',
    password: '',
    mobile: '',
    gender: '0',
    roleIdList: [] as string[],
    deptId: null as number | null,
    statusShow: true,
    status: 1,
    postIdList: [] as any[],
    userKey: '',
    tenantId: '',
    tenantName: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    gender: [{ required: true, message: '请选择性别', trigger: 'blur' }],
    roleIdList: [{ required: true, message: '请选择角色', trigger: 'blur' }]
  }

  /**
   * 初始化表单数据
   * 根据对话框类型（新增/编辑）填充表单
   */
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    let row: any = props.userData
    if (isEdit) {
      // 根据ID查询用户信息
      if (row?.id) {
        getUserById(row.id).then((res) => {
          row = res
          Object.assign(formData, {
            id: isEdit && row ? row?.id : null,
            username: isEdit && row ? row.username || '' : '',
            mobile: isEdit && row ? row.mobile || '' : '',
            gender: isEdit && row ? row.gender : '0',
            statusShow: isEdit && row ? row.status === 1 : true,
            email: isEdit && row ? row.email || '' : '',
            realName: isEdit && row ? row.realName || '' : '',
            deptId: isEdit && row ? row.deptId || null : null,
            password: '',
            userKey: isEdit && row ? row.userKey || '' : '',
            roleIdList: isEdit && row ? row.roleIdList || [] : [],
            tenantId: isEdit && row ? row.tenantId || '' : '',
            tenantName: isEdit && row ? row.tenantName || '' : ''
          })
        })
      } else {
        Object.assign(formData, {
          id: null,
          username: '',
          mobile: '',
          gender: '0',
          statusShow: true,
          email: '',
          realName: '',
          deptId: null,
          password: '',
          userKey: '',
          roleIdList: [],
          tenantId: '',
          tenantName: ''
        })
      }
    } else {
      Object.assign(formData, {
        id: null,
        username: '',
        mobile: '',
        gender: '0',
        statusShow: true,
        email: '',
        realName: '',
        deptId: row ? row.deptId || null : null,
        password: '',
        userKey: '',
        roleIdList: []
      })
    }
    // 角色列表
    fetchGetRoleList({}).then((res) => {
      roleList.value = res
    })
    // 部门列表
    fetchGetDeptList({}).then((res) => {
      deptList.value = res
      if (deptList.value) {
        deptList.value.forEach((element: { id: number }) => {
          expandedKeys.value.push(element.id)
        })
      }
    })
  }

  /**
   * 监听对话框状态变化
   * 当对话框打开时初始化表单数据并清除验证状态
   */
  watch(
    () => [props.visible, props.type, props.userData],
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
  /**
   * 生成32位  a52d50373c9543fe9845821a1b1cfc00
   */
  const generateUUID = () => {
    let uuid = Array.prototype.map
      .call(window.crypto.getRandomValues(new Uint8Array(16)), (item) => item.toString(16))
      .join('')
    if (uuid.length < 32) {
      uuid += '0'.repeat(32 - uuid.length) // 添加0补足位数
    }
    formData.userKey = uuid
    ElMessage.success({
      message: '更新密钥后，请告知接入方',
      duration: 2000
    })
  }

  /**
   * 提交表单
   * 验证通过后触发提交事件
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate((valid) => {
      if (valid) {
        // ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
        formData.status = formData.statusShow ? 1 : 0
        if (dialogType.value === 'add') {
          addUser(formData).then(() => {
            ElMessage.success('添加成功')
            dialogVisible.value = false
            emit('submit')
          })
        } else {
          fetchUpdateUser(formData).then(() => {
            ElMessage.success('更新成功')
            dialogVisible.value = false
            emit('submit')
          })
        }
      }
    })
  }
</script>
