import request from '@/utils/request'

/**
 * 智慧仓储可视化看板统计接口
 */

// 安全运行天数
export function getSafeDays() {
  return request({
    url: '/wms/dashboard/safeDays',
    method: 'get'
  })
}

// 物资来源统计（按入库类型分组）
export function getSourceStats() {
  return request({
    url: '/wms/dashboard/sourceStats',
    method: 'get'
  })
}

// 物资种类统计（含核心指标：总类/总数量/总价值）
export function getCategoryStats() {
  return request({
    url: '/wms/dashboard/categoryStats',
    method: 'get'
  })
}

// 仓储资源统计（仓库总数 / 货位数量）
export function getStorageStats() {
  return request({
    url: '/wms/dashboard/storageStats',
    method: 'get'
  })
}

// 出入库趋势（granularity: day-日/week-周/month-月；days 在周/月粒度下表示周数/月份数）
export function getInoutTrend(days = 7, granularity = 'day') {
  return request({
    url: '/wms/dashboard/inoutTrend',
    method: 'get',
    params: { days, granularity }
  })
}

// 质量等级统计
export function getQualityStats() {
  return request({
    url: '/wms/dashboard/qualityStats',
    method: 'get'
  })
}

// 环境监测最新数据（温湿度）
export function getEnvLatest() {
  return request({
    url: '/wms/envMonitor/latest',
    method: 'get'
  })
}

// 质保期预警统计（已到期 / 本月到期 / 下月到期）
export function getWarrantyStats() {
  return request({
    url: '/wms/dashboard/warrantyStats',
    method: 'get'
  })
}

// 质保期预警明细列表
export function getWarrantyWarningList(query) {
  return request({
    url: '/wms/dashboard/warrantyWarningList',
    method: 'get',
    params: query
  })
}
