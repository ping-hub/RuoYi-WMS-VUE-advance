import request from '@/utils/request';

export function getItemTrace(instanceCode) {
  return request({
    url: '/wms/trace/item/' + instanceCode,
    method: 'get'
  });
}

export function getBoxTrace(boxCode) {
  return request({
    url: '/wms/trace/box/' + boxCode,
    method: 'get'
  });
}
