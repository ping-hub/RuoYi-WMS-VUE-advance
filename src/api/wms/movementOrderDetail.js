import request from '@/utils/request'

// 查询调拨明细列表
export function listMovementOrderDetail(query) {
  return request({
    url: '/wms/movementOrderDetail/list',
    method: 'get',
    params: query
  })
}

// 查询调拨明细详情
export function getMovementOrderDetail(id) {
  return request({
    url: '/wms/movementOrderDetail/' + id,
    method: 'get'
  })
}

// 新增调拨明细
export function addMovementOrderDetail(data) {
  return request({
    url: '/wms/movementOrderDetail',
    method: 'post',
    data: data
  })
}

// 修改调拨明细
export function updateMovementOrderDetail(data) {
  return request({
    url: '/wms/movementOrderDetail',
    method: 'put',
    data: data
  })
}

// 查询调拨单明细列表
export function listByMovementOrderId(movementOrderId) {
  return request({
    url: '/wms/movementOrderDetail/list/' + movementOrderId,
    method: 'get'
  })
}

// 删除调拨明细
export function delMovementOrderDetail(id) {
  return request({
    url: '/wms/movementOrderDetail/' + id,
    method: 'delete'
  })
}
