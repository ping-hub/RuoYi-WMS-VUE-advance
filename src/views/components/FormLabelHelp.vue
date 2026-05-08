<template>
  <span class="form-label-help">
    <span>{{ label }}</span>
    <el-tooltip :content="content" placement="top" effect="dark">
      <el-icon class="help-icon"><QuestionFilled /></el-icon>
    </el-tooltip>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  example: {
    type: String,
    required: true
  }
})

const content = computed(() => `作用：${props.purpose}；示例：${props.example}`)
</script>

<style scoped lang="scss">
.form-label-help {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.help-icon {
  color: var(--el-color-primary);
  cursor: help;
}
</style>
