import request from '@/utils/request'

// 查询库存盘点单据列表
export function listCheckOrder(query) {
  return request({
    url: '/wms/checkOrder/list',
    method: 'get',
    params: query
  })
}

// 查询库存盘点单据详细
export function getCheckOrder(id) {
  return request({
    url: '/wms/checkOrder/' + id,
    method: 'get'
  })
}

// 新增库存盘点单据
export function addCheckOrder(data) {
  return request({
    url: '/wms/checkOrder',
    method: 'post',
    data: data
  })
}

// 修改库存盘点单据
export function updateCheckOrder(data) {
  return request({
    url: '/wms/checkOrder',
    method: 'put',
    data: data
  })
}

// 删除库存盘点单据
export function delCheckOrder(id) {
  return request({
    url: '/wms/checkOrder/' + id,
    method: 'delete'
  })
}

// 开始盘点：加载SKU级库存明细
export function startCheck(id) {
  return request({
    url: '/wms/checkOrder/startCheck/' + id,
    method: 'post'
  })
}

// 查询盘点单指定SKU的在库器材实例列表（懒加载）
export function getInstancesBySku(checkOrderId, skuId) {
  return request({
    url: '/wms/checkOrder/instances/' + checkOrderId,
    method: 'get',
    params: { skuId }
  })
}

// 完成盘点：保存盘点结果和实例差异明细
export function check(data) {
  return request({
    url: '/wms/checkOrder/check',
    method: 'post',
    data: data
  })
}
