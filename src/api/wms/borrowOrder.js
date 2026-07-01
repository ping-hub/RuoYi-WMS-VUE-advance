import request from '@/utils/request';

export function listBorrowOrder(query) {
  return request({
    url: '/wms/borrowOrder/list',
    method: 'get',
    params: query
  });
}

export function getBorrowOrder(id) {
  return request({
    url: '/wms/borrowOrder/' + id,
    method: 'get'
  });
}

export function addBorrowOrder(data) {
  return request({
    url: '/wms/borrowOrder',
    method: 'post',
    data
  });
}

export function updateBorrowOrder(data) {
  return request({
    url: '/wms/borrowOrder',
    method: 'put',
    data
  });
}

export function delBorrowOrder(id) {
  return request({
    url: '/wms/borrowOrder/' + id,
    method: 'delete'
  });
}

export function confirmBorrow(id) {
  return request({
    url: '/wms/borrowOrder/confirm/' + id,
    method: 'put'
  });
}

export function returnBorrowOrder(id) {
  return request({
    url: '/wms/borrowOrder/return/' + id,
    method: 'put'
  });
}

export function voidBorrowOrder(id) {
  return request({
    url: '/wms/borrowOrder/void/' + id,
    method: 'put'
  });
}

export function getBorrowOrderWarningStats() {
  return request({
    url: '/wms/borrowOrder/warning/stats',
    method: 'get'
  });
}
