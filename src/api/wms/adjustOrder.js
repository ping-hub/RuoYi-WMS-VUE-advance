import request from '@/utils/request'

export function listAdjustOrder(query) {
  return request({
    url: '/wms/adjustOrder/list',
    method: 'get',
    params: query
  })
}

export function getAdjustOrder(id) {
  return request({
    url: '/wms/adjustOrder/' + id,
    method: 'get'
  })
}

export function addAdjustOrder(data) {
  return request({
    url: '/wms/adjustOrder',
    method: 'post',
    data
  })
}

export function updateAdjustOrder(data) {
  return request({
    url: '/wms/adjustOrder',
    method: 'put',
    data
  })
}

export function executeAdjustOrder(data) {
  return request({
    url: '/wms/adjustOrder/adjust',
    method: 'post',
    data
  })
}

export function delAdjustOrder(id) {
  return request({
    url: '/wms/adjustOrder/' + id,
    method: 'delete'
  })
}
