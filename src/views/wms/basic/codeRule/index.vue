<template>
  <div class="app-container">
    <!-- 主体：左右分栏（3:7） -->
    <el-row :gutter="16">
      <!-- 左侧：编码类型列表 -->
      <el-col :xl="7" :lg="8" :md="24" :sm="24" :xs="24">
        <el-card class="type-list-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">编码类型</span>
            </div>
          </template>
          <div
            v-for="item in codeTypeList"
            :key="item.type"
            :class="['type-item', { 'type-item-active': currentType === item.type }]"
            @click="handleSelectType(item)"
          >
            <div class="type-item-main">
              <div class="type-name">{{ item.name }}</div>
              <div class="type-meta">
                <el-tag size="small" :type="item.enabled ? 'success' : 'info'" effect="plain">
                  {{ item.enabled ? '已启用' : '未启用' }}
                </el-tag>
                <span v-if="item.prefix" class="type-prefix">前缀: {{ item.prefix }}</span>
              </div>
            </div>
            <el-icon class="type-arrow"><ArrowRight /></el-icon>
          </div>
          <el-empty v-if="codeTypeList.length === 0" description="暂无编码类型" />
        </el-card>
      </el-col>

      <!-- 右侧：配置面板 -->
      <el-col :xl="17" :lg="16" :md="24" :sm="24" :xs="24">
        <el-card class="config-card" shadow="never">
          <div v-if="!currentType" class="config-empty">
            <el-empty description="请从左侧选择编码类型" />
          </div>

          <el-form
            v-else
            ref="configFormRef"
            :model="configForm"
            :rules="configRules"
            label-width="130px"
            class="config-form"
          >
            <el-divider content-position="left">编码组成</el-divider>

            <!-- 前缀 + 器材编码前缀开关（仅 item 类型显示右侧开关） -->
            <el-form-item label="前缀" prop="prefix">
              <div style="display: flex; align-items: center; gap: 12px;">
                <el-input
                  v-model="configForm.prefix"
                  :placeholder="currentType === 'item' && configForm.useItemCodeAsPrefix === '0' ? '使用器材编码' : '请输入前缀，如 ZC'"
                  :disabled="currentType === 'item' && configForm.useItemCodeAsPrefix === '0'"
                  clearable maxlength="20" style="width: 200px"
                />
                <template v-if="currentType === 'item'">
                  <el-switch
                    v-model="configForm.useItemCodeAsPrefix"
                    active-value="0"
                    inactive-value="1"
                  />
                  <span class="form-tip">使用器材编码作为前缀</span>
                </template>
              </div>
            </el-form-item>

            <!-- 后缀 -->
            <el-form-item label="后缀" prop="suffixType">
              <el-radio-group v-model="configForm.suffixType">
                <el-radio label="ymd">年月日</el-radio>
                <el-radio label="ym">年月</el-radio>
                <el-radio label="y">年</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 分隔符 -->
            <el-form-item label="分隔符" prop="separator">
              <el-select v-model="configForm.separator" placeholder="选择分隔符" style="width: 200px">
                <el-option label="无" value="" />
                <el-option label="短横线 -" value="-" />
                <el-option label="下划线 _" value="_" />
              </el-select>
            </el-form-item>

            <el-divider content-position="left">序号设置</el-divider>

            <!-- 序号位数 -->
            <el-form-item label="序号位数" prop="seqLength">
              <el-select v-model="configForm.seqLength" placeholder="选择序号位数" style="width: 200px">
                <el-option v-for="n in 8" :key="n" :label="n + ' 位'" :value="n" />
              </el-select>
              <span class="form-tip" style="margin-left: 12px;">{{ seqLengthTip }}</span>
            </el-form-item>

            <!-- 序号生成方式 -->
            <el-form-item label="序号生成方式" prop="seqMethod">
              <el-radio-group v-model="configForm.seqMethod">
                <el-radio label="sequential">按后缀范围顺序生成</el-radio>
                <el-radio label="random">随机数</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 当前序号 -->
            <el-form-item label="当前序号">
              <el-input v-model="configForm.currentSeq" disabled style="width: 200px" />
            </el-form-item>

            <!-- 编码预览 -->
            <el-form-item label="编码预览">
              <div class="preview-code">{{ previewResult }}</div>
            </el-form-item>

            <!-- 操作按钮 -->
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSave">保 存</el-button>
              <el-button @click="handleReset">重 置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="CodeRule">
import { ArrowRight } from '@element-plus/icons-vue'
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue'
import {
  listCodeRule,
  getCodeRuleByType,
  updateCodeRule
} from '@/api/wms/codeRule'

const { proxy } = getCurrentInstance()

// ========== 编码类型列表 ==========
const codeTypeList = ref([])

// 后端 ruleType → 前端 type 映射
const typeFieldMap = {
  ruleType: 'type',
  ruleName: 'name'
}

function mapRuleToItem(rule) {
  return {
    type: rule.ruleType,
    name: rule.ruleName,
    enabled: rule.enabled === '0',
    prefix: rule.prefix || '',
    id: rule.id
  }
}

// ========== 当前选中类型 ==========
const currentType = ref('')
const currentTypeName = computed(() => {
  const found = codeTypeList.value.find(item => item.type === currentType.value)
  return found ? found.name : ''
})

// ========== 配置表单 ==========
const configFormRef = ref()
const saving = ref(false)

const initConfigForm = {
  id: undefined,
  prefix: '',
  suffixType: 'y',
  separator: '-',
  seqLength: 4,
  seqMethod: 'sequential',
  currentSeq: '0',
  useItemCodeAsPrefix: '1'
}

const configForm = reactive({ ...initConfigForm })

const configRules = {
  prefix: [
    { max: 20, message: '前缀长度不能超过20个字符', trigger: 'blur' }
  ],
  suffixType: [
    { required: true, message: '请选择后缀格式', trigger: 'change' }
  ],
  seqLength: [
    { required: true, message: '请选择序号位数', trigger: 'change' }
  ],
  seqMethod: [
    { required: true, message: '请选择序号生成方式', trigger: 'change' }
  ]
}

// ========== 计算属性 ==========
const seqLengthTip = computed(() => {
  const n = configForm.seqLength
  const max = Math.pow(10, n) - 1
  return `最大序号 ${String(max).padStart(n, '0')}`
})

const previewResult = computed(() => {
  const parts = []

  // 前缀：item 类型且开关开启时，用示例器材编码展示
  if (currentType.value === 'item' && configForm.useItemCodeAsPrefix === '0') {
    parts.push('{器材编码}')
  } else if (configForm.prefix) {
    parts.push(configForm.prefix)
  }

  const now = new Date()
  if (configForm.suffixType === 'ymd') {
    parts.push(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`)
  } else if (configForm.suffixType === 'ym') {
    parts.push(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`)
  } else {
    parts.push(`${now.getFullYear()}`)
  }

  const seq = String(parseInt(configForm.currentSeq || '0') + 1).padStart(configForm.seqLength, '0')
  parts.push(seq)

  return parts.join(configForm.separator || '')
})

// ========== 方法 ==========
function handleSelectType(item) {
  currentType.value = item.type
  loadConfigForType(item.type)
}

/** 加载指定类型的配置 */
async function loadConfigForType(type) {
  try {
    const res = await getCodeRuleByType(type)
    if (res.data) {
      Object.assign(configForm, {
        prefix: res.data.prefix || '',
        suffixType: res.data.suffixType || 'y',
        separator: res.data.separator || '-',
        seqLength: res.data.seqLength || 4,
        seqMethod: res.data.seqMethod || 'sequential',
        currentSeq: String(res.data.currentSeq || 0),
        id: res.data.id,
        useItemCodeAsPrefix: res.data.useItemCodeAsPrefix || '1'
      })
    }
  } catch (e) {
    console.warn('加载编码规则配置失败：', e)
  }
}

async function handleSave() {
  await configFormRef.value?.validate()
  saving.value = true
  try {
    await updateCodeRule({
      id: configForm.id,
      enabled: '0',
      prefix: configForm.prefix,
      suffixType: configForm.suffixType,
      separator: configForm.separator,
      seqLength: configForm.seqLength,
      seqMethod: configForm.seqMethod,
      useItemCodeAsPrefix: configForm.useItemCodeAsPrefix
    })
    proxy.$modal.msgSuccess('保存成功')
    // 刷新列表
    await loadCodeRuleList()
    // 更新当前选中项的状态
    const item = codeTypeList.value.find(t => t.type === currentType.value)
    if (item) {
      item.enabled = true
      item.prefix = configForm.prefix
    }
  } catch (e) {
    proxy.$modal.msgError('保存失败')
  } finally {
    saving.value = false
  }
}

function handleReset() {
  Object.assign(configForm, { ...initConfigForm })
}

/** 加载编码规则列表 */
async function loadCodeRuleList() {
  try {
    const res = await listCodeRule()
    if (res.data) {
      codeTypeList.value = res.data.map(mapRuleToItem)
    }
  } catch (e) {
    console.warn('加载编码规则列表失败：', e)
  }
}

onMounted(() => {
  loadCodeRuleList()
})
</script>

<style scoped lang="scss">
.type-list-card {
  height: 100%;
  :deep(.el-card__body) {
    padding: 0;
  }
}

.type-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: all 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.type-item-active {
    background: var(--el-color-primary-light-9);
    border-left: 3px solid var(--el-color-primary);
  }
}

.type-item-main {
  flex: 1;
}

.type-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.type-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-prefix {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.type-arrow {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.config-card {
  height: 100%;
}

.config-empty {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.config-form {
  max-width: 640px;
  margin-top: 4px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
}

.preview-code {
  padding: 8px 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
  letter-spacing: 1px;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
