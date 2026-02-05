/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      pageNum: number
      /** 每页条数 */
      pageSize: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'pageNum' | 'pageSize'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      pageNum: number
      pageSize: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      username: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      accessToken: string
      refreshToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      email: string
      avatar?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: string
      avatar: string
      status: number
      username: string
      gender: number
      realName: string
      mobile: string
      email: string
      tenantId: string
      tenantName: string
      deptId: string
      note: string
      userKey: string
      deptName: string
      creator: string
      createTime: string
      updater: string
      updateTime: string
      roleIdList: []
      tenantRole: boolean
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<
        UserListItem,
        | 'id'
        | 'userName'
        | 'userGender'
        | 'userPhone'
        | 'userEmail'
        | 'status'
        | 'tenantRole'
        | 'tenantId'
        | 'tenantFlag'
        | 'deptId'
      > &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      id: number
      code: string
      name: string
      remark: string
      isSystem: number
      createTime: string
      menuIdList: any[]
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'name' | 'code' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams
    >

    /** 部门列表 */
    type DeptList = Api.Common.PaginatedResponse<DeptListItem>

    /** 部门列表项 */
    interface DeptListItem {
      id: string
      name: string
      parentId: string
      parentName: string
      roleCode: string
      remark: string
      createTime: string
      isSystem: number
      // menuIdList: number[]
    }
    /** 部门搜索参数 */
    type DeptSearchParams = Partial<
      Pick<RoleListItem, 'id' | 'name' | 'note' | 'parentId'> & Api.Common.CommonSearchParams
    >
    /**
     * 版本信息
     */
    interface VersionInfo {
      id: string // 主键ID
      versionNum: string // 版本号
      title: string // 标题
      releaseTime: string // 发布日期
      content?: string // 内容
      reLogin?: boolean // 是否需要重新登录
      remark?: string // 备注
    }

    /**
     * 系统参数
     */
    interface ParamsInfo {
      id: number // 主键ID
      paramName: string // 参数名称
      paramType: number // 参数类型：系统参数   0：否   1：是
      paramKey: string // 参数键
      paramValue?: string // 参数值
      remark?: string // 备注
      createTime: string // 创建时间
      keyWord?: string // 搜索关键字
      idList?: number[] // 主键ID列表
    }
    /**
     * 租户信息
     */
    interface TenantInfo {
      id: string // 主键ID
      tenantId: string // 租户ID
      tenantName: string // 租户名称
      note: string // 备注
      sort: number // 排序
      status: number // 状态  0：停用   1：正常
    }

    /**
     * 字典
     */
    interface Dict {
      id: string // 主键ID
      dictName: string // 字典名词
      dictType: string // 字典类型
      dictSource: number // 来源
      sort: number // 排序
      dictSql: string // sql脚本
      remark: string // 备注
      dictTypeId: string // 字典类型ID
    }
    /**
     * 字典
     */
    interface DictData {
      id: string // 主键ID
      sort: number // 排序
      dictType: string // 字典类型
      dictLabel: string // 字典标签
      remark: string // 备注
      dictTypeId: string // 字典类型ID
      labelClass: string // 标签样式
      dictValue: string // 字典值
    }
  }
}
