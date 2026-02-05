import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

/*********************** 菜单接口 **********************/
// 获取菜单数据
// 当前使用本地模拟路由数据，实际项目中请求接口返回 asyncRoutes.ts 文件的数据
export function fetchGetMenuList(params: any) {
  return request.post<AppRouteRecord[]>({
    url: `/sysApi/sys/menu/route`,
    params
  })
}

// 保存菜单数据
export function fetchSaveMenu(params: any) {
  return request.post<string>({
    url: `/sysApi/sys/menu`,
    params
  })
}

// 修改菜单数据
export function fetchUpdateMenu(params: any) {
  return request.post<string>({
    url: `/sysApi/sys/menu/update`,
    params
  })
}

// 删除菜单数据
export function fetchDeleteMenu(menuId: number) {
  return request.post<string>({
    url: `/sysApi/sys/menu/delById/${menuId}`
  })
}

/*********************** 系统相关 **********************/
// 获取版本信息
export function fetchVersion() {
  return request.get<Api.SystemManage.VersionInfo>({
    url: '/sysApi/sys/info/latestVersion'
  })
}

// 获取系统参数列表
export function fetchGetParamsList(params: Api.SystemManage.ParamsInfo) {
  return request.get<Api.SystemManage.ParamsInfo>({
    url: '/sysApi/sys/params/page',
    params
  })
}

// 修改参数
export function fetchUpdateParams(params: any) {
  return request.post({
    url: '/sysApi/sys/params/update',
    params
  })
}

// 修改参数
export function fetchSaveParams(params: any) {
  return request.post({
    url: '/sysApi/sys/params',
    params
  })
}

// 删除参数
export function fetchDeleteParams(params: number[]) {
  return request.post({
    url: '/sysApi/sys/params/del',
    params
  })
}
