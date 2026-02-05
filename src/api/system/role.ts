import request from '@/utils/http'
/*********************** 角色接口 **********************/
/**
 * 获取角色列表
 * @param params 请求参数
 * @returns 角色列表
 */
export function fetchGetRolePage(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/sysApi/sys/role/page',
    params
  })
}

/**
 * 获取角色列表
 * @param params 请求参数
 * @returns 角色列表
 */
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList[]>({
    url: '/sysApi/sys/role/list',
    params
  })
}

/**
 * 保存角色和权限
 */
export function fetchSaveRole(params: Api.SystemManage.RoleSearchParams) {
  return request.post({
    url: '/sysApi/sys/role',
    params
  })
}

// 修改角色和权限
export function fetchUpdateRole(params: Api.SystemManage.RoleSearchParams) {
  return request.post({
    url: '/sysApi/sys/role/update',
    params
  })
}

// 删除角色
export function fetchDeleteRole(params: number[]) {
  return request.post({
    url: '/sysApi/sys/role/del',
    params
  })
}
