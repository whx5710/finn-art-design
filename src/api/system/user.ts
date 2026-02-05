import request from '@/utils/http'

/*********************** 用户接口 **********************/
// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/sysApi/sys/user/page',
    params
  })
}

/**
 * 新增用户
 * @param data 用户数据
 */
export async function addUser(params: any) {
  return request.post({
    url: `/sysApi/sys/user`,
    params
  })
}

/**
 * 根据用户id获取信息
 * @param data 用户数据
 */
export async function getUserById(userId: number | string) {
  return request.get({
    url: `/sysApi/sys/user/${userId}`
  })
}

/**
 * 修改用户
 * @param data 用户数据
 */
export async function fetchUpdateUser(params: any) {
  return request.post({
    url: `/sysApi/sys/user/update`,
    params
  })
}

/**
 * 删除用户
 * @param idList 用户ID集合
 */
export async function fetchDeleteUser(idList: any[string | number]) {
  return request.post({
    url: `/sysApi/sys/user/del`,
    params: idList
  })
}

/*********************** 租户相关 **********************/
// 获取列表
export function fetchGetTenantList(params: Api.SystemManage.TenantInfo) {
  return request.get<Api.SystemManage.TenantInfo>({
    url: '/sysApi/tenant/member/page',
    params
  })
}

// 新增租户
export function fetchSaveTenant(params: any) {
  return request.post({
    url: '/sysApi/tenant/member/save',
    params
  })
}

// 修改租户
export function fetchUpdateTenant(params: any) {
  return request.post({
    url: '/sysApi/tenant/member/update',
    params
  })
}

/**
 * 绑定租户用户
 * @param tenantId 租户ID
 * @param userIdList 用户ID列表
 * @returns void
 */
export function bindTenantUser(tenantId: string, userIdList: string[]) {
  return request.post({
    url: `/sysApi/sys/user/bindTenantUser/${tenantId}`,
    params: userIdList
  })
}

/**
 * 解除租户用户
 * @param tenantId 租户ID
 * @param userIdList 用户ID列表
 * @returns void
 */
export function unBindTenantUser(tenantId: string, userIdList: string[]) {
  return request.post({
    url: `/sysApi/sys/user/unBindTenantUser/${tenantId}`,
    params: userIdList
  })
}

/**
 * 删除租户
 * @param id 租户ID
 * @returns void
 */
export function deleteTenant(id: string) {
  return request.post({
    url: `/sysApi/tenant/member/delById/${id}`
  })
}
