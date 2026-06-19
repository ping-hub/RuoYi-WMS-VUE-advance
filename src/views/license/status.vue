<template>
  <div class="license-status">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>License 授权信息</span>
          <el-button type="primary" size="small" @click="goActivate">激活新 License</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border v-loading="loading">
        <el-descriptions-item label="授权状态">
          <el-tag :type="status.valid ? 'success' : 'danger'" size="large">
            {{ status.statusDesc || '未知' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="授权类型">
          {{ status.type || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="颁发对象">
          {{ status.issuedTo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="绑定机器码">
          {{ status.machineBound ? '是' : '否' }}
        </el-descriptions-item>
        <el-descriptions-item label="颁发时间">
          {{ status.issuedAt || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="到期时间">
          {{ status.expiresAt || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="剩余天数" :span="2">
          <span :class="{ 'text-danger': status.remainingDays < 0, 'text-warning': status.remainingDays >= 0 && status.remainingDays <= 30 }">
            {{ status.remainingDays !== undefined ? status.remainingDays + ' 天' : '-' }}
          </span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 机器码信息 -->
      <div class="machine-section">
        <h4>服务器机器码</h4>
        <el-input v-model="machineCode" readonly>
          <template #append>
            <el-button @click="copyMachineCode">复制</el-button>
          </template>
        </el-input>
        <p class="hint">如需重新颁发 License，请将此机器码告知管理员</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getLicenseStatus, getMachineCode } from '@/api/license'

const router = useRouter()
const loading = ref(false)
const status = ref({})
const machineCode = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const [statusRes, machineRes] = await Promise.all([getLicenseStatus(), getMachineCode()])
    status.value = statusRes.data || {}
    machineCode.value = machineRes.machineCode || ''
  } catch (e) {
    console.error('获取 License 信息失败', e)
  } finally {
    loading.value = false
  }
})

const goActivate = () => {
  router.push('/license/activate')
}

const copyMachineCode = () => {
  navigator.clipboard.writeText(machineCode.value).then(() => {
    ElMessage.success('机器码已复制')
  })
}
</script>

<style scoped>
.license-status {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.machine-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.machine-section h4 {
  margin-bottom: 10px;
  color: #303133;
}

.hint {
  color: #909399;
  font-size: 12px;
  margin-top: 6px;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}

.text-warning {
  color: #e6a23c;
  font-weight: bold;
}
</style>
