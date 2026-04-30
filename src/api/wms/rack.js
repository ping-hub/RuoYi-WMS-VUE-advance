import request from '@/utils/request';

export function listRack(query) {
  return request({
    url: '/wms/rack/list',
    method: 'get',
    params: query
  });
}

export function listRackNoPage(query) {
  return request({
    url: '/wms/rack/listNoPage',
    method: 'get',
    params: query
  });
}

export function getRack(id) {
  return request({
    url: '/wms/rack/' + id,
    method: 'get'
  });
}

export function addRack(data) {
  return request({
    url: '/wms/rack',
    method: 'post',
    data
  });
}

export function updateRack(data) {
  return request({
    url: '/wms/rack',
    method: 'put',
    data
  });
}

export function delRack(id) {
  return request({
    url: '/wms/rack/' + id,
    method: 'delete'
  });
}
