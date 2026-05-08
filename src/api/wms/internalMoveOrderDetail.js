import request from '@/utils/request'

// 查询库内移库明细列表
export function listInternalMoveOrderDetail(query) {
  return request({
    url: '/wms/internalMoveOrderDetail/list',
    method: 'get',
    params: query
  })
}

// 查询库内移库明细列表
export function listInternalMoveOrderDetailNoPage(query) {
  return request({
    url: '/wms/internalMoveOrderDetail/listNoPage',
    method: 'get',
    params: query
  })
}

// 查询库内移库明细详情
export function getInternalMoveOrderDetail(id) {
  return request({
    url: '/wms/internalMoveOrderDetail/' + id,
    method: 'get'
  })
}

// 删除库内移库明细
export function delInternalMoveOrderDetail(ids) {
  return request({
    url: '/wms/internalMoveOrderDetail/' + ids,
    method: 'delete'
  })
}
