import request from '@/utils/request'

// 查询商品序列号列表
export function listItemSn(query) {
  return request({
    url: '/wms/itemSn/list',
    method: 'get',
    params: query
  })
}

// 查询商品序列号列表（不分页）
export function listItemSnNoPage(query) {
  return request({
    url: '/wms/itemSn/listNoPage',
    method: 'get',
    params: query
  })
}

// 导出商品序列号
export function exportItemSn(query) {
  return request({
    url: '/wms/itemSn/export',
    method: 'post',
    params: query
  })
}

// 查询商品序列号详细
export function getItemSn(id) {
  return request({
    url: '/wms/itemSn/' + id,
    method: 'get'
  })
}

// 根据SN码查询详细信息
export function getItemSnBySnCode(snCode) {
  return request({
    url: '/wms/itemSn/sn/' + snCode,
    method: 'get'
  })
}

// 根据SKU ID查询在库SN列表
export function listItemSnBySkuId(skuId) {
  return request({
    url: '/wms/itemSn/sku/' + skuId,
    method: 'get'
  })
}

// 根据仓库和库区查询在库SN列表
export function listItemSnByWarehouseAndArea(warehouseId, areaId) {
  return request({
    url: '/wms/itemSn/warehouse/' + warehouseId,
    method: 'get',
    params: { areaId: areaId }
  })
}

// 新增商品序列号
export function addItemSn(data) {
  return request({
    url: '/wms/itemSn',
    method: 'post',
    data: data
  })
}

// 批量新增商品序列号
export function batchAddItemSn(dataList) {
  return request({
    url: '/wms/itemSn/batch',
    method: 'post',
    data: dataList
  })
}

// 修改商品序列号
export function updateItemSn(data) {
  return request({
    url: '/wms/itemSn',
    method: 'put',
    data: data
  })
}

// 删除商品序列号
export function delItemSn(id) {
  return request({
    url: '/wms/itemSn/' + id,
    method: 'delete'
  })
}

// 批量删除商品序列号
export function delItemSnBatch(ids) {
  return request({
    url: '/wms/itemSn/' + ids.join(','),
    method: 'delete'
  })
}

// 批量更新SN状态
export function batchUpdateItemSnStatus(data) {
  return request({
    url: '/wms/itemSn/batchStatus',
    method: 'put',
    data: data
  })
}

// 批量更新SN库位
export function batchUpdateItemSnWarehouse(data) {
  return request({
    url: '/wms/itemSn/batchWarehouse',
    method: 'put',
    data: data
  })
}
