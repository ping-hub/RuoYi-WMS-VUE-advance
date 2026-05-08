import request from '@/utils/request'

export function getStorageLayoutTree(query) {
  return request({
    url: '/wms/layout/tree',
    method: 'get',
    params: query
  })
}

export function getRackGrid(rackId) {
  return request({
    url: '/wms/layout/rack/' + rackId + '/grid',
    method: 'get'
  })
}

export function getLocationSummary(locationId) {
  return request({
    url: '/wms/layout/location/' + locationId + '/summary',
    method: 'get'
  })
}

export function listReceiptTargets(query) {
  return request({
    url: '/wms/layout/internal/receiptTargets',
    method: 'get',
    params: query
  })
}
