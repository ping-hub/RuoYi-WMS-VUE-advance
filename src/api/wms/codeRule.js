import request from '@/utils/request'

// 查询编码规则列表
export function listCodeRule() {
  return request({
    url: '/wms/codeRule/list',
    method: 'get'
  })
}

// 查询编码规则详细
export function getCodeRule(id) {
  return request({
    url: '/wms/codeRule/' + id,
    method: 'get'
  })
}

// 根据编码类型查询规则
export function getCodeRuleByType(ruleType) {
  return request({
    url: '/wms/codeRule/type/' + ruleType,
    method: 'get'
  })
}

// 修改编码规则
export function updateCodeRule(data) {
  return request({
    url: '/wms/codeRule',
    method: 'put',
    data: data
  })
}

// 预览编码效果
export function previewCode(ruleType) {
  return request({
    url: '/wms/codeRule/preview/' + ruleType,
    method: 'get'
  })
}
