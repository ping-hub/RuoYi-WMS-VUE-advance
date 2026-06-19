import request from '@/utils/request'

// 获取机器码
export function getMachineCode() {
  return request({
    url: '/license/machineCode',
    method: 'get'
  })
}

// 获取 License 状态
export function getLicenseStatus() {
  return request({
    url: '/license/status',
    method: 'get'
  })
}

// 激活 License
export function activateLicense(licenseContent) {
  return request({
    url: '/license/activate',
    method: 'post',
    data: { licenseContent }
  })
}
