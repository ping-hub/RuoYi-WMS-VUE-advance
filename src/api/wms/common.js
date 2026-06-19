import request from '@/utils/request'

// 获取用户下拉列表（轻量级，仅需登录，无需系统管理权限）
export function getUserSelectList() {
  return request({
    url: '/wms/shipmentOrder/userSelectList',
    method: 'get'
  })
}
