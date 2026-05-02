import request from '@/utils/request';

export function listBorrowRecord(query) {
  return request({
    url: '/wms/borrowRecord/list',
    method: 'get',
    params: query
  });
}

export function listBorrowRecordNoPage(query) {
  return request({
    url: '/wms/borrowRecord/listNoPage',
    method: 'get',
    params: query
  });
}

export function getBorrowRecord(id) {
  return request({
    url: '/wms/borrowRecord/' + id,
    method: 'get'
  });
}

export function getCurrentBorrowRecord(itemInstanceId) {
  return request({
    url: '/wms/borrowRecord/current/' + itemInstanceId,
    method: 'get'
  });
}

export function borrowItem(data) {
  return request({
    url: '/wms/borrowRecord/borrow',
    method: 'post',
    data
  });
}

export function returnBorrowItem(data) {
  return request({
    url: '/wms/borrowRecord/return',
    method: 'post',
    data
  });
}
