<template>
  <div class="license-activate">
    <div class="activate-card">
      <div class="card-header">
        <h2>License 激活</h2>
        <p class="subtitle">请上传 License 文件或粘贴激活码以激活系统</p>
      </div>

      <!-- 机器码展示 -->
      <div class="machine-code-section">
        <label>当前服务器机器码</label>
        <div class="machine-code-box">
          <el-input v-model="machineCode" readonly placeholder="加载中...">
            <template #append>
              <el-button @click="copyMachineCode">复制</el-button>
            </template>
          </el-input>
        </div>
        <p class="hint">将机器码告知管理员以获取 License 文件</p>
      </div>

      <!-- 激活方式切换 -->
      <el-tabs v-model="activeTab" class="activate-tabs">
        <el-tab-pane label="上传 License 文件" name="file">
          <el-upload
            class="license-upload"
            drag
            :auto-upload="false"
            :limit="1"
            accept=".lic"
            :on-change="handleFileChange"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">只支持 .lic 格式文件</div>
            </template>
          </el-upload>
        </el-tab-pane>

        <el-tab-pane label="粘贴激活码" name="code">
          <el-input
            v-model="licenseCode"
            type="textarea"
            :rows="6"
            placeholder="请粘贴完整的激活码内容..."
          />
        </el-tab-pane>
      </el-tabs>

      <!-- 激活按钮 -->
      <div class="activate-action">
        <el-button type="primary" size="large" :loading="activating" @click="doActivate">
          激活 License
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getMachineCode, activateLicense } from '@/api/license'

const machineCode = ref('')
const activeTab = ref('file')
const licenseCode = ref('')
const fileContent = ref('')
const activating = ref(false)

onMounted(async () => {
  try {
    const res = await getMachineCode()
    machineCode.value = res.machineCode || ''
  } catch (e) {
    console.error('获取机器码失败', e)
  }
})

const copyMachineCode = () => {
  navigator.clipboard.writeText(machineCode.value).then(() => {
    ElMessage.success('机器码已复制到剪贴板')
  }).catch(() => {
    ElMessage.warning('复制失败，请手动选择复制')
  })
}

const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    fileContent.value = e.target.result
  }
  reader.readAsText(file.raw)
}

const doActivate = async () => {
  const content = activeTab.value === 'file' ? fileContent.value : licenseCode.value
  if (!content || !content.trim()) {
    ElMessage.warning(activeTab.value === 'file' ? '请先上传 License 文件' : '请粘贴激活码')
    return
  }
  activating.value = true
  try {
    const res = await activateLicense(content.trim())
    if (res.code === 200) {
      ElMessage.success('License 激活成功！即将刷新页面...')
      setTimeout(() => { location.reload() }, 1500)
    } else {
      ElMessage.error(res.msg || '激活失败')
    }
  } catch (e) {
    ElMessage.error('激活请求失败：' + (e.message || '未知错误'))
  } finally {
    activating.value = false
  }
}
</script>

<style scoped>
.license-activate {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

.activate-card {
  width: 600px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.card-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #303133;
}

.subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.machine-code-section {
  margin-bottom: 30px;
}

.machine-code-section label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #606266;
}

.hint {
  color: #909399;
  font-size: 12px;
  margin-top: 6px;
}

.activate-tabs {
  margin-bottom: 20px;
}

.license-upload {
  width: 100%;
}

.activate-action {
  text-align: center;
  padding-top: 10px;
}
</style>
