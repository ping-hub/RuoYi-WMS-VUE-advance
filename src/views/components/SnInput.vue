<template>
  <div class="sn-input">
    <el-button type="primary" icon="Plus" @click="handleOpen">添加SN码</el-button>
    <div class="sn-list mt20">
      <el-tag
        v-for="(sn, index) in modelValue"
        :key="index"
        closable
        @close="handleRemove(index)"
        class="mr10 mb10"
      >
        {{ sn }}
      </el-tag>
      <span v-if="modelValue.length === 0" class="text-muted">暂无SN码</span>
    </div>

    <el-dialog title="添加SN码" v-model="open" width="600px" append-to-body>
      <el-form :model="form" label-width="100px">
        <el-form-item label="SN码输入">
          <el-input
            v-model="form.snCode"
            placeholder="请输入或扫描SN码"
            clearable
            @keyup.enter="handleAddSn"
            autofocus
            class="sn-code-input"
          />
        </el-form-item>
        <el-form-item label="批量输入">
          <el-input
            v-model="form.batchSnCodes"
            type="textarea"
            :rows="6"
            placeholder="请输入SN码，每行一个"
          />
        </el-form-item>
        <el-form-item label="生成数量">
          <el-input-number v-model="form.generateCount" :min="1" :max="100" placeholder="自动生成SN数量" />
        </el-form-item>
        <el-form-item label="SN前缀">
          <el-input v-model="form.prefix" placeholder="SN码前缀" clearable />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取 消</el-button>
          <el-button type="primary" @click="handleAddSingle">添加单个</el-button>
          <el-button type="success" @click="handleAddBatch">批量添加</el-button>
          <el-button type="warning" @click="handleGenerate">自动生成</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage, nextTick } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  skuId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const form = reactive({
  snCode: '',
  batchSnCodes: '',
  generateCount: 10,
  prefix: 'SN'
})

/** 打开对话框 */
function handleOpen() {
  open.value = true
  resetForm()
}

/** 关闭对话框 */
function handleCancel() {
  open.value = false
  resetForm()
}

/** 重置表单 */
function resetForm() {
  form.snCode = ''
  form.batchSnCodes = ''
  form.generateCount = 10
  form.prefix = 'SN'
}

/** 添加单个SN码 */
function handleAddSn() {
  if (!form.snCode) {
    ElMessage.warning('请输入SN码')
    return
  }
  if (props.modelValue.includes(form.snCode)) {
    ElMessage.warning('SN码已存在')
    return
  }
  const newValue = [...props.modelValue, form.snCode]
  emit('update:modelValue', newValue)
  form.snCode = ''
  nextTick(() => {
    // 聚焦到SN码输入框
    const input = document.querySelector('.sn-code-input .el-input__inner')
    if (input) input.focus()
  })
}

/** 添加单个SN码（按钮） */
function handleAddSingle() {
  if (!form.snCode) {
    ElMessage.warning('请输入SN码')
    return
  }
  if (props.modelValue.includes(form.snCode)) {
    ElMessage.warning('SN码已存在')
    return
  }
  const newValue = [...props.modelValue, form.snCode]
  emit('update:modelValue', newValue)
  form.snCode = ''
}

/** 批量添加SN码 */
function handleAddBatch() {
  if (!form.batchSnCodes) {
    ElMessage.warning('请输入SN码')
    return
  }
  const lines = form.batchSnCodes.split('\n').filter(line => line.trim())
  if (lines.length === 0) {
    ElMessage.warning('请输入SN码')
    return
  }

  const newSnCodes = []
  const duplicateCodes = []
  lines.forEach(line => {
    const snCode = line.trim()
    if (!snCode) return
    if (props.modelValue.includes(snCode)) {
      duplicateCodes.push(snCode)
    } else if (newSnCodes.includes(snCode)) {
      duplicateCodes.push(snCode)
    } else {
      newSnCodes.push(snCode)
    }
  })

  if (duplicateCodes.length > 0) {
    ElMessage.warning(`以下SN码已存在或重复，已跳过：${duplicateCodes.join('、')}`)
  }

  if (newSnCodes.length > 0) {
    const newValue = [...props.modelValue, ...newSnCodes]
    emit('update:modelValue', newValue)
    ElMessage.success(`成功添加${newSnCodes.length}个SN码`)
  }
  open.value = false
}

/** 自动生成SN码 */
function handleGenerate() {
  const count = form.generateCount || 10
  const prefix = form.prefix || 'SN'
  const newSnCodes = []

  const timestamp = Date.now()
  for (let i = 0; i < count; i++) {
    const snCode = `${prefix}${timestamp}${String(i + 1).padStart(3, '0')}`
    if (!props.modelValue.includes(snCode) && !newSnCodes.includes(snCode)) {
      newSnCodes.push(snCode)
    }
  }

  if (newSnCodes.length > 0) {
    const newValue = [...props.modelValue, ...newSnCodes]
    emit('update:modelValue', newValue)
    ElMessage.success(`成功生成${newSnCodes.length}个SN码`)
  }
  open.value = false
}

/** 删除SN码 */
function handleRemove(index) {
  const newValue = [...props.modelValue]
  newValue.splice(index, 1)
  emit('update:modelValue', newValue)
}
</script>

<style scoped>
.sn-input {
  width: 100%;
}

.sn-list {
  min-height: 60px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.text-muted {
  color: #909399;
  font-size: 14px;
}
</style>
