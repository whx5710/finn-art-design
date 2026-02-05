import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/sysApi/sys/auth/login',
    params
    // showSuccessMessage: true // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}

/**
 * 退出
 * @param refreshToken 刷新token
 * @returns 登录响应
 */
export function fetchLogout(refreshToken: string) {
  return request.post<Api.Auth.LoginResponse>({
    url: `/sysApi/sys/auth/logout?refreshToken=${refreshToken}`
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/sysApi/sys/user/info'
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}

// 角色权限列表
export function fetchGetAuthorityList() {
  return request.get<string[]>({
    url: `/sysApi/sys/menu/authority`
  })
}
