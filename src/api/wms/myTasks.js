import request from '@/utils/request'

// 查询我的待办列表
export function listMyTasks(query) {
  return request({
    url: '/wms/myTasks/list',
    method: 'get',
    params: query
  })
}

// 我的待办统计（看板用）
export function getMyTasksSummary() {
  return request({
    url: '/wms/myTasks/summary',
    method: 'get'
  })
}

// 三类预警统计汇总（供我的待办页 Tab 角标使用）
export function getWarningCategoryStats() {
  return request({
    url: '/wms/myTasks/warningCategoryStats',
    method: 'get'
  })
}
