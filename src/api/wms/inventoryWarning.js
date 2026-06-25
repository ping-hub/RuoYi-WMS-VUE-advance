import request from '@/utils/request'

// 查询预警规则列表
export function listInventoryWarningRule(query) {
  return request({
    url: '/wms/inventoryWarning/rule/list',
    method: 'get',
    params: query
  })
}

// 查询预警规则详细
export function getInventoryWarningRule(id) {
  return request({
    url: '/wms/inventoryWarning/rule/' + id,
    method: 'get'
  })
}

// 新增预警规则
export function addInventoryWarningRule(data) {
  return request({
    url: '/wms/inventoryWarning/rule',
    method: 'post',
    data: data
  })
}

// 修改预警规则
export function updateInventoryWarningRule(data) {
  return request({
    url: '/wms/inventoryWarning/rule',
    method: 'put',
    data: data
  })
}

// 修改预警规则状态
export function changeInventoryWarningRuleStatus(id, enabled) {
  return request({
    url: '/wms/inventoryWarning/rule/changeStatus',
    method: 'put',
    data: { id, enabled }
  })
}

// 删除预警规则
export function delInventoryWarningRule(id) {
  return request({
    url: '/wms/inventoryWarning/rule/' + id,
    method: 'delete'
  })
}

// 预警汇总数据（供仪表盘使用）
export function getWarningSummary() {
  return request({
    url: '/wms/inventoryWarning/summary',
    method: 'get'
  })
}
