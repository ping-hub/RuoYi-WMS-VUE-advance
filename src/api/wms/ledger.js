import request from '@/utils/request'

// 查询器材总账列表
export function listLedger(query) {
  return request({
    url: '/wms/ledger/list',
    method: 'get',
    params: query
  })
}
