<template>
  <div class="app-container">
    <!-- 顶部三预警 Tab -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane name="borrow">
        <template #label>
          <span class="tab-label">借用单预警
            <el-badge :value="borrowCount" class="tab-badge" type="warning" />
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane name="inventory">
        <template #label>
          <span class="tab-label">库存预警
            <el-badge :value="inventoryCount" class="tab-badge" type="danger" />
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane name="warranty">
        <template #label>
          <span class="tab-label">质保期预警
            <el-badge :value="warrantyCount" class="tab-badge" type="success" />
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 借用单预警 -->
    <div v-if="activeTab === 'borrow'">
      <el-card>
        <el-form :model="borrowQuery" ref="borrowQueryRef" label-width="88px" class="query-form" inline>
          <el-form-item label="借用人" prop="borrower">
            <el-input v-model="borrowQuery.borrower" placeholder="请输入借用人" clearable @keyup.enter="loadBorrowList" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="loadBorrowList">搜索</el-button>
            <el-button icon="Refresh" @click="resetBorrowQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="mt20">
        <el-table v-loading="borrowLoading" :data="borrowList" border empty-text="暂无借用单预警数据">
          <el-table-column label="借用单号" prop="borrowOrderNo" min-width="130" show-overflow-tooltip />
          <el-table-column label="借用人" prop="borrower" min-width="80" show-overflow-tooltip />
          <el-table-column label="借用时间" min-width="100">
            <template #default="{ row }">
              {{ row.borrowTime ? parseTime(row.borrowTime, '{y}-{m}-{d}') : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="计划归还" min-width="100">
            <template #default="{ row }">
              {{ row.planReturnDate ? row.planReturnDate : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="剩余天数" width="90" align="center">
            <template #default="{ row }">
              <span :style="{ color: getDaysColor(row) }">{{ getRemainingDays(row) }}天</span>
            </template>
          </el-table-column>
          <el-table-column label="预警状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.warningFlag === 2" type="danger">超期{{ row.overdueDays || 0 }}天</el-tag>
              <el-tag v-else-if="row.warningFlag === 1" type="warning">即将到期</el-tag>
              <el-tag v-else type="success">正常</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="goBorrowDetail(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="borrowTotal > 0"
          :total="borrowTotal"
          v-model:page="borrowQuery.pageNum"
          v-model:limit="borrowQuery.pageSize"
          @pagination="loadBorrowList"
        />
      </el-card>
    </div>

    <!-- 库存预警 -->
    <div v-if="activeTab === 'inventory'">
      <el-card>
        <el-table v-loading="inventoryLoading" :data="inventoryList" border empty-text="暂无库存预警数据">
          <el-table-column label="器材/分类" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.itemName || row.itemCategoryName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="当前库存" prop="currentStock" width="100" align="right" />
          <el-table-column label="安全库存" prop="safetyStock" width="100" align="right" />
          <el-table-column label="预警库存" prop="criticalStock" width="100" align="right" />
          <el-table-column label="预警等级" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.warningLevel === 'critical'" type="danger">严重</el-tag>
              <el-tag v-else-if="row.warningLevel === 'warning'" type="warning">偏低</el-tag>
              <el-tag v-else type="info">关注</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 质保期预警 -->
    <div v-if="activeTab === 'warranty'">
      <el-card>
        <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
          <el-button
            type="primary"
            icon="Refresh"
            :disabled="warrantySelectedIds.length === 0"
            @click="handleBatchResetWarranty"
          >批量重置质保期</el-button>
          <span v-if="warrantySelectedIds.length > 0" style="color: #909399; font-size: 13px;">已选 {{ warrantySelectedIds.length }} 条</span>
        </div>
        <el-table
          v-loading="warrantyLoading"
          :data="warrantyList"
          border
          empty-text="暂无质保期预警数据"
          @selection-change="handleWarrantySelectionChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="器材名称" prop="itemName" min-width="120" show-overflow-tooltip />
          <el-table-column label="器材识别码" prop="instanceCode" min-width="130" show-overflow-tooltip />
          <el-table-column label="质保月数" prop="warrantyPeriodMonths" width="90" align="center">
            <template #default="{ row }">
              <span>{{ row.warrantyPeriodMonths != null ? row.warrantyPeriodMonths + '个月' : '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="到期日期" prop="warrantyPeriod" min-width="100" />
          <el-table-column label="剩余天数" width="100" align="center">
            <template #default="{ row }">
              <span :style="{ color: row.remainingDays < 0 ? '#ff4d4f' : (row.remainingDays <= 30 ? '#faad14' : '#52c41a') }">
                {{ row.remainingDays < 0 ? '已超' + Math.abs(row.remainingDays) + '天' : row.remainingDays + '天' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.remainingDays < 0" type="danger">已到期</el-tag>
              <el-tag v-else-if="row.warrantyLabel === '本月到期'" type="warning">本月到期</el-tag>
              <el-tag v-else type="success">下月到期</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="warrantyTotal > 0"
          :total="warrantyTotal"
          v-model:page="warrantyQuery.pageNum"
          v-model:limit="warrantyQuery.pageSize"
          @pagination="loadWarrantyList"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup name="MyTasks">
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listBorrowOrderWarning, getBorrowOrderWarningStats } from '@/api/wms/borrowOrder'
import { getWarningSummary } from '@/api/wms/inventoryWarning'
import { getWarrantyWarningList } from '@/api/wms/dashboard'
import { batchResetWarranty } from '@/api/wms/itemInstance'
import { resolveRoutePath } from '@/utils/routeResolver'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const activeTab = ref('borrow')

// ========== 借用单预警 ==========
const borrowList = ref([])
const borrowLoading = ref(false)
const borrowTotal = ref(0)
const borrowCount = ref(0)
const borrowQuery = reactive({ pageNum: 1, pageSize: 10, borrower: undefined })

// ========== 库存预警 ==========
const inventoryList = ref([])
const inventoryLoading = ref(false)
const inventoryCount = ref(0)

// ========== 质保期预警 ==========
const warrantyList = ref([])
const warrantyLoading = ref(false)
const warrantyTotal = ref(0)
const warrantyCount = ref(0)
const warrantyQuery = reactive({ pageNum: 1, pageSize: 10 })
const warrantySelectedIds = ref([])

// ========== 借用单预警：计算剩余天数 ==========
const getRemainingDays = (row) => {
  if (!row.planReturnDate) return '-'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const planDate = new Date(row.planReturnDate)
  planDate.setHours(0, 0, 0, 0)
  const diff = Math.round((planDate - today) / (1000 * 60 * 60 * 24))
  return diff
}

const getDaysColor = (row) => {
  if (row.warningFlag === 2) return '#ff4d4f'
  if (row.warningFlag === 1) return '#faad14'
  return '#52c41a'
}

// ========== 加载借用单预警列表 ==========
const loadBorrowList = async () => {
  borrowLoading.value = true
  try {
    const query = { ...borrowQuery }
    Object.keys(query).forEach(k => { if (!query[k]) delete query[k] })
    const res = await listBorrowOrderWarning(query)
    borrowList.value = res.rows || []
    borrowTotal.value = res.total || 0
  } catch (e) {
    console.warn('加载借用单预警列表失败:', e)
  } finally {
    borrowLoading.value = false
  }
}

const resetBorrowQuery = () => {
  borrowQuery.borrower = undefined
  borrowQuery.pageNum = 1
  loadBorrowList()
}

const loadBorrowStats = async () => {
  try {
    const res = await getBorrowOrderWarningStats()
    const data = res.data || {}
    borrowCount.value = Number(data.warningCount || 0) + Number(data.overdueCount || 0)
  } catch (e) {
    console.warn('加载借用单预警统计失败:', e)
  }
}

const goBorrowDetail = (row) => {
  const path = resolveRoutePath(router, {
    preferredPaths: ['/borrowOrderEdit'],
    titleKeywords: ['借用单']
  }) || '/borrowOrderEdit'
  router.push({ path, query: { id: row.id, mode: 'view', returnFullPath: route.fullPath } })
}

// ========== 加载库存预警列表 ==========
const loadInventoryList = async () => {
  inventoryLoading.value = true
  try {
    const res = await getWarningSummary()
    const data = res.data || {}
    inventoryList.value = data.items || []
    inventoryCount.value = Number(data.total || 0)
  } catch (e) {
    console.warn('加载库存预警列表失败:', e)
  } finally {
    inventoryLoading.value = false
  }
}

// ========== 加载质保期预警列表 ==========
const loadWarrantyList = async () => {
  warrantyLoading.value = true
  try {
    const res = await getWarrantyWarningList(warrantyQuery)
    const data = res.data || {}
    warrantyList.value = data.rows || data.list || []
    warrantyTotal.value = data.total || 0
    warrantyCount.value = data.total || 0
  } catch (e) {
    console.warn('加载质保期预警列表失败:', e)
  } finally {
    warrantyLoading.value = false
  }
}

// ========== 质保期多选 ==========
const handleWarrantySelectionChange = (selection) => {
  warrantySelectedIds.value = selection.map(r => r.id).filter(Boolean)
}

// ========== 批量重置质保期 ==========
const handleBatchResetWarranty = async () => {
  if (warrantySelectedIds.value.length === 0) return
  try {
    await proxy.$modal.confirm(`确认将选中的 ${warrantySelectedIds.value.length} 条器材的质保期向后延长一个质保周期吗？`)
  } catch { return }
  try {
    await batchResetWarranty(warrantySelectedIds.value)
    proxy.$modal.msgSuccess('质保期重置成功')
    warrantySelectedIds.value = []
    loadWarrantyList()
  } catch (e) {
    console.warn('质保期重置失败:', e)
  }
}

// ========== Tab 切换 ==========
const handleTabChange = (tab) => {
  activeTab.value = tab
  if (tab === 'borrow') {
    loadBorrowList()
  } else if (tab === 'inventory') {
    loadInventoryList()
  } else if (tab === 'warranty') {
    loadWarrantyList()
  }
}

// ========== 库存预警数量（仅拉取总数，不加载列表） ==========
const loadInventoryCount = async () => {
  try {
    const res = await getWarningSummary()
    const data = res.data || {}
    inventoryCount.value = Number(data.total || 0)
  } catch (e) {
    console.warn('加载库存预警数量失败:', e)
  }
}

// ========== 质保期预警数量（仅拉取总数，不加载列表） ==========
const loadWarrantyCount = async () => {
  try {
    const res = await getWarrantyWarningList({ pageNum: 1, pageSize: 1 })
    const data = res.data || {}
    warrantyCount.value = data.total || 0
  } catch (e) {
    console.warn('加载质保期预警数量失败:', e)
  }
}

// ========== 初始化 ==========
onMounted(() => {
  const tabParam = route.query.tab
  if (tabParam && ['borrow', 'inventory', 'warranty'].includes(tabParam)) {
    activeTab.value = tabParam
  }
  // 同时加载三个Tab的徽标数字
  loadBorrowStats()
  loadInventoryCount()
  loadWarrantyCount()
  // 加载当前激活Tab的列表数据
  handleTabChange(activeTab.value)
})
</script>

<style lang="scss" scoped>
.mt20 { margin-top: 20px; }

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tab-badge :deep(.el-badge__content) {
  font-size: 11px;
}
</style>
