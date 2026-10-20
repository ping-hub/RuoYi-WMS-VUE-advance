import request from '@/utils/request'

/**
 * 温湿度监控-设备配置维护接口
 * 设备清单作为维度表维护，定时任务按启用设备轮询
 */

// 查询设备配置列表
export function listEnvDevice(query) {
  return request({
    url: '/wms/envDevice/list',
    method: 'get',
    params: query
  })
}

// 查询设备配置列表（不分页）
export function listEnvDeviceNoPage(query) {
  return request({
    url: '/wms/envDevice/listNoPage',
    method: 'get',
    params: query
  })
}

// 获取设备配置详细信息
export function getEnvDevice(id) {
  return request({
    url: '/wms/envDevice/' + id,
    method: 'get'
  })
}

// 新增设备配置
export function addEnvDevice(data) {
  return request({
    url: '/wms/envDevice',
    method: 'post',
    data: data
  })
}

// 修改设备配置
export function updateEnvDevice(data) {
  return request({
    url: '/wms/envDevice',
    method: 'put',
    data: data
  })
}

// 启用/停用设备
export function changeEnvDeviceStatus(id, enabled) {
  return request({
    url: '/wms/envDevice/changeStatus',
    method: 'put',
    params: { id, enabled }
  })
}

// 批量删除设备配置
export function delEnvDevice(ids) {
  return request({
    url: '/wms/envDevice/' + ids,
    method: 'delete'
  })
}
