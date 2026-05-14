import request from '@/utils/request';

export function listLocation(query) {
  return request({
    url: '/wms/location/list',
    method: 'get',
    params: query
  });
}

export function listLocationNoPage(query) {
  return request({
    url: '/wms/location/listNoPage',
    method: 'get',
    params: query
  });
}

export function getLocation(id) {
  return request({
    url: '/wms/location/' + id,
    method: 'get'
  });
}

export function rebuildByRack(rackId) {
  return request({
    url: '/wms/location/rebuildByRack/' + rackId,
    method: 'post'
  });
}

export function healthCheckByRack(rackId) {
  return request({
    url: '/wms/location/healthCheckByRack/' + rackId,
    method: 'get'
  });
}

export function addLocation(data) {
  return request({
    url: '/wms/location',
    method: 'post',
    data
  });
}

export function updateLocation(data) {
  return request({
    url: '/wms/location',
    method: 'put',
    data
  });
}

export function delLocation(id) {
  return request({
    url: '/wms/location/' + id,
    method: 'delete'
  });
}
