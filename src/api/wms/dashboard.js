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

// 出入库趋势（默认近7天）
export function getInoutTrend(days = 7) {
  return request({
    url: '/wms/dashboard/inoutTrend',
    method: 'get',
    params: { days }
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
