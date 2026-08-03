import request from '@/utils/request';

export function listItemInstance(query) {
  return request({
    url: '/wms/itemInstance/list',
    method: 'get',
    params: query
  });
}

export function listItemInstanceNoPage(query) {
  return request({
    url: '/wms/itemInstance/listNoPage',
    method: 'get',
    params: query
  });
}

export function getItemInstance(id, query) {
  return request({
    url: '/wms/itemInstance/' + id,
    method: 'get',
    params: query
  });
}

export function getItemInstanceByCode(instanceCode, query) {
  return request({
    url: '/wms/itemInstance/code/' + instanceCode,
    method: 'get',
    params: query
  });
}

export function addItemInstance(data) {
  return request({
    url: '/wms/itemInstance',
    method: 'post',
    data
  });
}

export function updateItemInstance(data) {
  return request({
    url: '/wms/itemInstance',
    method: 'put',
    data
  });
}

export function updateItemInstanceStatus(data) {
  return request({
    url: '/wms/itemInstance/status',
    method: 'put',
    data
  });
}

export function updateItemInstanceLocation(data) {
  return request({
    url: '/wms/itemInstance/location',
    method: 'put',
    data
  });
}

export function delItemInstance(id) {
  return request({
    url: '/wms/itemInstance/' + id,
    method: 'delete'
  });
}

// 批量重置质保期（到期日期向后延长质保月数）
export function batchResetWarranty(ids) {
  return request({
    url: '/wms/itemInstance/batchResetWarranty',
    method: 'put',
    data: ids
  });
}

/**
 * 散件批量移位：将多个在库散件器材移动到新的货位
 * @param {object} data { ids: [], warehouseId, areaId, rackId, locationId }
 */
export function batchRelocateItemInstances(data) {
  return request({
    url: '/wms/itemInstance/batchRelocate',
    method: 'put',
    data
  });
}
