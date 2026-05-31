import request from '@/utils/request'

// 查询库存统计看板摘要
export function getInventoryBoardSummary(query) {
  return request({
    url: '/wms/inventoryBoard/summary',
    method: 'get',
    params: query
  })
}

// 查询库存统计看板柱状图
export function getInventoryBoardChart(query) {
  return request({
    url: '/wms/inventoryBoard/chart',
    method: 'get',
    params: query
  })
}

// 查询库存统计看板列表
export function listInventoryBoard(query) {
  return request({
    url: '/wms/inventoryBoard/list',
    method: 'get',
    params: query
  })
}
