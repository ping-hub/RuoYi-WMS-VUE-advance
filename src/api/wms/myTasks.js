import request from '@/utils/request'

// 查询我的待办列表
export function listMyTasks(query) {
  return request({
    url: '/wms/myTasks/list',
    method: 'get',
    params: query
  })
}
