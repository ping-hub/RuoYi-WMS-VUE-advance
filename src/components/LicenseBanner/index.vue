<template>
  <div v-if="showBanner" class="license-banner">
    <el-alert
      :title="bannerMessage"
      type="error"
      :closable="false"
      show-icon
    >
      <template #default>
        <span>当前系统 License {{ statusDesc }}，写操作已被禁用。</span>
        <router-link to="/license/activate" class="activate-link">立即激活</router-link>
      </template>
    </el-alert>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getLicenseStatus } from '@/api/license'

const showBanner = ref(false)
const statusDesc = ref('')
const bannerMessage = ref('')

let pollTimer = null

async function checkStatus() {
  try {
    const res = await getLicenseStatus()
    const data = res.data
    if (data && !data.valid) {
      showBanner.value = true
      statusDesc.value = data.statusDesc || '无效'
      bannerMessage.value = `License ${data.statusDesc || '无效'}`
    } else {
      showBanner.value = false
    }
  } catch (e) {
    // 获取状态失败不显示横幅
  }
}

onMounted(() => {
  checkStatus()
  // 每60秒轮询一次，检测过期后及时提示
  pollTimer = setInterval(checkStatus, 60000)
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
})
</script>

<style scoped>
.license-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

.license-banner :deep(.el-alert) {
  border-radius: 0;
}

.activate-link {
  color: #409eff;
  text-decoration: underline;
  margin-left: 8px;
  font-weight: bold;
}
</style>
