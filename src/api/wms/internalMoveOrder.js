import request from '@/utils/request'

// 查询库内移库单列表
export function listInternalMoveOrder(query) {
  return request({
    url: '/wms/internalMoveOrder/list',
    method: 'get',
    params: query
  })
}

// 查询库内移库单详情
export function getInternalMoveOrder(id) {
  return request({
    url: '/wms/internalMoveOrder/' + id,
    method: 'get'
  })
}

// 新增库内移库单
export function addInternalMoveOrder(data) {
  return request({
    url: '/wms/internalMoveOrder',
    method: 'post',
    data
  })
}

// 修改库内移库单
export function updateInternalMoveOrder(data) {
  return request({
    url: '/wms/internalMoveOrder',
    method: 'put',
    data
  })
}

// 执行库内移库单
export function moveInternalMoveOrder(data) {
  return request({
    url: '/wms/internalMoveOrder/move',
    method: 'post',
    data
  })
}

// 删除库内移库单
export function delInternalMoveOrder(id) {
  return request({
    url: '/wms/internalMoveOrder/' + id,
    method: 'delete'
  })
}
