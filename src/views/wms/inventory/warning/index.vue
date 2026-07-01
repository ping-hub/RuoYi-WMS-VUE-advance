<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" label-width="88px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="规则名称" prop="ruleName">
              <el-input v-model="queryParams.ruleName" placeholder="请输入规则名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="规则类型" prop="ruleType">
              <el-select v-model="queryParams.ruleType" placeholder="全部" clearable style="width: 100%" @change="handleQuery">
                <el-option label="器材维度" value="item" />
                <el-option label="分类维度" value="category" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="启用状态" prop="enabled">
              <el-select v-model="queryParams.enabled" placeholder="全部" clearable style="width: 100%" @change="handleQuery">
                <el-option label="启用" value="1" />
                <el-option label="停用" value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <div class="query-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <div class="table-panel">
        <div class="panel-header">
          <span class="panel-title">库存预警规则</span>
          <div>
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wms:inventoryWarning:list']">新增</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['wms:inventoryWarning:list']">删除</el-button>
          </div>
        </div>

        <el-table
          v-loading="loading"
          :data="ruleList"
          border
          empty-text="暂无预警规则"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="规则名称" prop="ruleName" min-width="140" show-overflow-tooltip />
          <el-table-column label="规则类型" min-width="90" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.ruleType === 'item'" type="primary" effect="plain" size="small">器材</el-tag>
              <el-tag v-else type="success" effect="plain" size="small">分类</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="关联对象" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <template v-if="row.ruleType === 'category'">
                {{ row.itemCategoryName || '—' }}
              </template>
              <template v-else>
                {{ row.itemName }}（{{ row.itemCode }}）
              </template>
            </template>
          </el-table-column>
          <el-table-column label="严重不足" prop="criticalStock" min-width="100" align="right">
            <template #default="{ row }">
              <span class="threshold-critical">{{ row.criticalStock }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库存偏低" prop="safetyStock" min-width="100" align="right">
            <template #default="{ row }">
              <span class="threshold-warning">{{ row.safetyStock }}</span>
            </template>
          </el-table-column>
          <el-table-column label="关注" prop="noticeStock" min-width="100" align="right">
            <template #default="{ row }">
              <span class="threshold-notice">{{ row.noticeStock }}</span>
            </template>
          </el-table-column>
          <el-table-column label="当前库存" prop="currentStock" min-width="100" align="right">
            <template #default="{ row }">
              <span v-if="row.currentStock !== null && row.currentStock !== undefined">{{ row.currentStock }}</span>
              <span v-else class="text-muted">—</span>
            </template>
          </el-table-column>
          <el-table-column label="预警状态" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.warningLevel === 'critical'" type="danger" effect="plain">严重不足</el-tag>
              <el-tag v-else-if="row.warningLevel === 'warning'" type="warning" effect="plain">库存偏低</el-tag>
              <el-tag v-else-if="row.warningLevel === 'notice'" type="info" effect="plain">关注</el-tag>
              <el-tag v-else type="success" effect="plain">正常</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="启用状态" min-width="90" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.enabled"
                active-value="1"
                inactive-value="0"
                @change="handleStatusChange(row)"
                v-hasPermi="['wms:inventoryWarning:list']"
              />
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
          <el-table-column label="操作" align="right" width="160" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['wms:inventoryWarning:list']">修改</el-button>
              <el-button link type="primary" icon="Delete" @click="handleDelete(row)" v-hasPermi="['wms:inventoryWarning:list']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body :close-on-click-modal="false">
      <el-form ref="ruleFormRef" :model="form" :rules="computedRules" label-width="90px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="form.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则类型" prop="ruleType">
          <el-radio-group v-model="form.ruleType" :disabled="!!form.id" @change="handleRuleTypeChange">
            <el-radio label="item">器材</el-radio>
            <el-radio label="category">分类</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.ruleType === 'item'" label="器材" prop="itemId">
          <el-select
            v-model="form.itemId"
            placeholder="请选择器材"
            filterable
            style="width: 100%"
            @change="handleItemChange"
          >
            <el-option
              v-for="item in itemOptions"
              :key="item.id"
              :label="`${item.itemName}（${item.itemCode}）`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.ruleType === 'category'" label="器材分类" prop="itemCategoryId">
          <el-tree-select
            v-model="form.itemCategoryId"
            :data="categoryTreeOptions"
            :props="{ children: 'children', label: 'label', value: 'id' }"
            placeholder="请选择器材分类"
            check-strictly
            filterable
            style="width: 100%"
            @change="handleCategoryChange"
          />
        </el-form-item>
        <el-form-item label="严重不足" prop="criticalStock">
          <el-input-number
            v-model="form.criticalStock"
            :min="0"
            :precision="0"
            :step="1"
            controls-position="right"
            style="width: 100%"
            placeholder="库存<=此值为严重不足（默认=安全库存×0.5）"
          />
        </el-form-item>
        <el-form-item label="库存偏低" prop="safetyStock">
          <el-input-number
            v-model="form.safetyStock"
            :min="0"
            :precision="0"
            :step="1"
            controls-position="right"
            style="width: 100%"
            placeholder="库存<=此值为偏低（必填）"
          />
        </el-form-item>
        <el-form-item label="关注" prop="noticeStock">
          <el-input-number
            v-model="form.noticeStock"
            :min="0"
            :precision="0"
            :step="1"
            controls-position="right"
            style="width: 100%"
            placeholder="库存<=此值为关注（默认=安全库存×1.5）"
          />
        </el-form-item>
        <el-form-item label="启用状态" prop="enabled">
          <el-radio-group v-model="form.enabled">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="dialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InventoryWarningRule">
import { ref, reactive, computed, toRefs, getCurrentInstance, onMounted } from 'vue'
import {
  listInventoryWarningRule,
  getInventoryWarningRule,
  addInventoryWarningRule,
  updateInventoryWarningRule,
  changeInventoryWarningRuleStatus,
  delInventoryWarningRule
} from '@/api/wms/inventoryWarning'
import { listItem } from '@/api/wms/item'
import { treeSelectItemCategory } from '@/api/wms/itemCategory'

const { proxy } = getCurrentInstance()

const ruleList = ref([])
const loading = ref(true)
const total = ref(0)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const itemOptions = ref([])
const categoryTreeOptions = ref([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ruleName: undefined,
    ruleType: undefined,
    enabled: undefined,
  },
  form: {},
  rules: {
    ruleName: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }],
    ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
    safetyStock: [{ required: true, message: '库存偏低阈值不能为空', trigger: 'blur' }],
  }
})

const dialog = reactive({
  visible: false,
  title: ''
})

const { queryParams, form, rules } = toRefs(data)

/** 根据规则类型动态计算校验规则 */
const computedRules = computed(() => {
  const base = { ...rules.value }
  if (form.value.ruleType === 'item') {
    base.itemId = [{ required: true, message: '请选择器材', trigger: 'change' }]
  } else if (form.value.ruleType === 'category') {
    base.itemCategoryId = [{ required: true, message: '请选择器材分类', trigger: 'change' }]
  }
  return base
})

/** 查询规则列表 */
function getList() {
  loading.value = true
  listInventoryWarningRule(queryParams.value).then(res => {
    ruleList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

/** 加载器材选项 */
function loadItemOptions() {
  listItem({ status: '1' }).then(res => {
    itemOptions.value = res.data || []
  })
}

/** 加载器材分类树 */
function loadCategoryTree() {
  treeSelectItemCategory().then(res => {
    categoryTreeOptions.value = res.data || []
  })
}

/** 搜索 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 多选 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    ruleName: undefined,
    ruleType: 'item',
    itemId: undefined,
    itemCategoryId: undefined,
    criticalStock: undefined,
    safetyStock: undefined,
    noticeStock: undefined,
    enabled: '1',
    remark: undefined,
  }
  proxy.resetForm('ruleFormRef')
}

/** 规则类型切换 */
function handleRuleTypeChange() {
  form.value.itemId = undefined
  form.value.itemCategoryId = undefined
  form.value.ruleName = undefined
}

/** 器材变更时自动生成规则名称 */
function handleItemChange(itemId) {
  const item = itemOptions.value.find(i => i.id === itemId)
  if (item && !form.value.ruleName) {
    form.value.ruleName = `${item.itemName} 预警规则`
  }
}

/** 分类变更时自动生成规则名称 */
function handleCategoryChange(categoryId) {
  const node = findCategoryNode(categoryTreeOptions.value, categoryId)
  if (node && !form.value.ruleName) {
    form.value.ruleName = `${node.label} 预警规则`
  }
}

/** 在树中递归查找节点 */
function findCategoryNode(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children) {
      const found = findCategoryNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

/** 新增 */
function handleAdd() {
  reset()
  loadItemOptions()
  loadCategoryTree()
  dialog.title = '新增预警规则'
  dialog.visible = true
}

/** 修改 */
function handleUpdate(row) {
  reset()
  loadItemOptions()
  loadCategoryTree()
  const id = row.id || ids.value[0]
  getInventoryWarningRule(id).then(res => {
    form.value = { ...res.data, ruleType: res.data.ruleType || 'item' }
    dialog.title = '修改预警规则'
    dialog.visible = true
  })
}

/** 提交 */
function submitForm() {
  proxy.$refs.ruleFormRef.validate(valid => {
    if (!valid) return
    if (form.value.id) {
      updateInventoryWarningRule(form.value).then(() => {
        proxy.$modal.msgSuccess('修改成功')
        dialog.visible = false
        getList()
      })
    } else {
      addInventoryWarningRule(form.value).then(() => {
        proxy.$modal.msgSuccess('新增成功')
        dialog.visible = false
        getList()
      })
    }
  })
}

/** 删除 */
function handleDelete(row) {
  const delIds = row.id ? [row.id] : ids.value
  proxy.$modal.confirm('确认删除所选预警规则？').then(() => {
    return delInventoryWarningRule(delIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 启用/停用状态切换 */
function handleStatusChange(row) {
  const text = row.enabled === '1' ? '启用' : '停用'
  proxy.$modal.confirm(`确认${text}该规则？`).then(() => {
    return changeInventoryWarningRuleStatus(row.id, row.enabled)
  }).then(() => {
    proxy.$modal.msgSuccess(`${text}成功`)
  }).catch(() => {
    row.enabled = row.enabled === '1' ? '0' : '1'
  })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.mt20 { margin-top: 20px; }

.query-form {
  margin-bottom: 0;
}

.query-actions {
  display: flex;
  gap: 8px;
  padding-top: 30px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.threshold-critical {
  font-weight: 600;
  color: #f56c6c;
}

.threshold-warning {
  font-weight: 600;
  color: #e6a23c;
}

.threshold-notice {
  font-weight: 600;
  color: #909399;
}

.text-muted {
  color: #c0c4cc;
}
</style>
