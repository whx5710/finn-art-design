import request from '@/utils/http'

/*********************** 部门接口 **********************/
// 获取列表
export function fetchGetDeptList(params: Api.SystemManage.DeptSearchParams) {
  return request.post<Api.SystemManage.DeptList>({
    url: '/sysApi/sys/dept/list',
    params
  })
}

// 获取列表-分页
export function fetchGetDeptPage(params: Api.SystemManage.DeptSearchParams) {
  return request.get<Api.SystemManage.DeptList>({
    url: '/sysApi/sys/dept/page',
    params
  })
}

// 保存部门
export function fetchSaveDept(params: any) {
  return request.post({
    url: '/sysApi/sys/dept',
    params
  })
}

// 修改部门
export function fetchUpdateDept(params: any) {
  return request.post({
    url: '/sysApi/sys/dept/update',
    params
  })
}

// 删除部门
export function fetchDeleteDept(id: string) {
  return request.post({
    url: '/sysApi/sys/dept/delById/' + id
  })
}
