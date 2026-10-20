import request from '@/utils/request'

/**
 * 温湿度监控 V2 查询接口（数据与告警分表存储、分接口取值）
 */

// 查询每个设备的最新温湿度数据
export function getEnvV2Latest() {
  return request({
    url: '/wms/envMonitor/v2/latest',
    method: 'get'
  })
}

// 温湿度历史数据分页查询
export function getEnvV2DataList(query) {
  return request({
    url: '/wms/envMonitor/v2/data/list',
    method: 'get',
    params: query
  })
}

// 告警分页查询
export function getEnvV2AlarmList(query) {
  return request({
    url: '/wms/envMonitor/v2/alarm/list',
    method: 'get',
    params: query
  })
}
