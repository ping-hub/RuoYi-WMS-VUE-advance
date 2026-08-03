import request from '@/utils/request';

export function listBox(query) {
  return request({
    url: '/wms/box/list',
    method: 'get',
    params: query
  });
}

export function listBoxNoPage(query) {
  return request({
    url: '/wms/box/listNoPage',
    method: 'get',
    params: query
  });
}

export function getBox(id) {
  return request({
    url: '/wms/box/' + id,
    method: 'get'
  });
}

export function getBoxByCode(boxCode) {
  return request({
    url: '/wms/box/code/' + boxCode,
    method: 'get'
  });
}

export function addBox(data) {
  return request({
    url: '/wms/box',
    method: 'post',
    data
  });
}

export function updateBox(data) {
  return request({
    url: '/wms/box',
    method: 'put',
    data
  });
}

export function delBox(id) {
  return request({
    url: '/wms/box/' + id,
    method: 'delete'
  });
}

/**
 * 库内移位：移动箱子（可同步移动箱内器材）
 * @param {number} id 箱体ID
 * @param {object} data { rackId, locationId, syncItems }
 */
export function relocateBox(id, data) {
  return request({
    url: '/wms/box/' + id + '/relocate',
    method: 'put',
    data
  });
}

/**
 * 获取箱体流转日志
 * @param {number} id 箱体ID
 */
export function getBoxLogs(id) {
  return request({
    url: '/wms/box/' + id + '/logs',
    method: 'get'
  });
}
