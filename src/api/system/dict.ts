import request from '@/utils/http'

/*********************** 字典接口 **********************/
// 获取字典列表
export function fetchGetDictList(params: Api.SystemManage.Dict) {
  return request.get<Api.SystemManage.Dict>({
    url: '/sysApi/sys/dict/type/page',
    params
  })
}

// 获取字典数据列表
export function fetchGetDictDataList(params: Api.SystemManage.Dict) {
  return request.get<Api.SystemManage.Dict>({
    url: '/sysApi/sys/dict/data/page',
    params
  })
}

// 获取列表
export function fetchDeleteDict(params: string[]) {
  return request.post({
    url: '/sysApi/sys/dict/type/del',
    params
  })
}
