import request from '@/utils/request'

// 查询单据SN关联列表
export function listOrderSn(query) {
  return request({
    url: '/wms/orderSn/list',
    method: 'get',
    params: query
  })
}

// 查询单据SN关联列表（不分页）
export function listOrderSnNoPage(query) {
  return request({
    url: '/wms/orderSn/listNoPage',
    method: 'get',
    params: query
  })
}

// 导出单据SN关联
export function exportOrderSn(query) {
  return request({
    url: '/wms/orderSn/export',
    method: 'post',
    params: query
  })
}

// 查询单据SN关联详细
export function getOrderSn(id) {
  return request({
    url: '/wms/orderSn/' + id,
    method: 'get'
  })
}

// 根据单据类型和单据ID查询SN列表
export function listOrderSnByOrder(orderType, orderId) {
  return request({
    url: '/wms/orderSn/order/' + orderType + '/' + orderId,
    method: 'get'
  })
}

// 根据单据明细ID查询SN列表
export function listOrderSnByOrderDetail(orderType, orderDetailId) {
  return request({
    url: '/wms/orderSn/detail/' + orderType + '/' + orderDetailId,
    method: 'get'
  })
}

// 根据SN ID查询关联记录
export function listOrderSnBySnId(snId) {
  return request({
    url: '/wms/orderSn/sn/' + snId,
    method: 'get'
  })
}

// 新增单据SN关联
export function addOrderSn(data) {
  return request({
    url: '/wms/orderSn',
    method: 'post',
    data: data
  })
}

// 批量新增单据SN关联
export function batchAddOrderSn(dataList) {
  return request({
    url: '/wms/orderSn/batch',
    method: 'post',
    data: dataList
  })
}

// 修改单据SN关联
export function updateOrderSn(data) {
  return request({
    url: '/wms/orderSn',
    method: 'put',
    data: data
  })
}

// 删除单据SN关联
export function delOrderSn(id) {
  return request({
    url: '/wms/orderSn/' + id,
    method: 'delete'
  })
}

// 批量删除单据SN关联
export function delOrderSnBatch(ids) {
  return request({
    url: '/wms/orderSn/' + ids.join(','),
    method: 'delete'
  })
}
