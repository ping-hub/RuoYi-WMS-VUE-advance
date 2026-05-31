<template>
  <div class="app-container inventory-board-page">
    <div class="board-shell">
      <div class="board-banner">库存统计看板</div>

      <div class="board-panel">
        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-title">器材可用库存</div>
            <div class="chart-area">
              <div class="y-axis">
                <span v-for="tick in yAxisTicks" :key="tick">{{ tick }}</span>
              </div>
              <div class="chart-plot">
                <div class="grid-lines">
                  <span v-for="index in 5" :key="index"></span>
                </div>
                <div class="bar-list">
                  <div v-for="(item, index) in chartList" :key="`${item.label}-${index}`" class="bar-item">
                    <div class="bar-value">{{ formatInteger(item.quantity) }}</div>
                    <div class="bar-track">
                      <div class="bar-column" :class="barClass(index)" :style="{ height: `${calcBarHeight(item.quantity)}%` }"></div>
                    </div>
                    <div class="bar-label">{{ item.label }}</div>
                  </div>
                  <div v-if="!chartList.length" class="chart-empty">暂无库存数据</div>
                </div>
              </div>
            </div>
          </div>

          <div class="filter-card">
            <div class="filter-grid">
              <div class="filter-item">
                <label>仓库</label>
                <el-select
                  v-model="queryParams.warehouseId"
                  clearable
                  placeholder="请选择仓库"
                  class="filter-control"
                  @change="handleQuery"
                  @clear="handleQuery"
                >
                  <el-option
                    v-for="item in warehouseOptions"
                    :key="item.id"
                    :label="item.warehouseName"
                    :value="item.id"
                  />
                </el-select>
              </div>

              <div class="filter-item">
                <label>器材名称</label>
                <el-input
                  v-model.trim="queryParams.itemName"
                  clearable
                  placeholder="请输入器材名称"
                  class="filter-control"
                  @keyup.enter="handleQuery"
                  @clear="handleQuery"
                />
              </div>

              <div class="filter-item">
                <label>规格型号</label>
                <el-input
                  v-model.trim="queryParams.skuName"
                  clearable
                  placeholder="请输入规格型号"
                  class="filter-control"
                  @keyup.enter="handleQuery"
                  @clear="handleQuery"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="metric-card">
            <div class="metric-label">当前库存数</div>
            <div class="metric-value"><strong>{{ formatInteger(summary.currentQuantity) }}</strong> 件</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">可用库存总数</div>
            <div class="metric-value"><strong>{{ formatInteger(summary.availableQuantity) }}</strong> 件</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">在库仓库数</div>
            <div class="metric-value"><strong>{{ formatInteger(summary.warehouseCount) }}</strong> 个</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">在库库区数</div>
            <div class="metric-value"><strong>{{ formatInteger(summary.areaCount) }}</strong> 个</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">异常库存记录</div>
            <div class="metric-value"><strong>{{ formatInteger(summary.abnormalCount) }}</strong> 条</div>
          </div>
        </div>

        <div class="table-card">
          <div class="table-title">库存统计查询</div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>仓库</th>
                  <th>库区</th>
                  <th>器材名称</th>
                  <th>规格型号</th>
                  <th>器材编码</th>
                  <th>产品标识</th>
                  <th>质量等级</th>
                  <th>当前库存数量</th>
                  <th>更新时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableList" :key="row.id">
                  <td>{{ row.warehouseName || '-' }}</td>
                  <td>{{ row.areaName || '-' }}</td>
                  <td class="cell-center">{{ row.itemName || '-' }}</td>
                  <td>{{ row.skuName || '-' }}</td>
                  <td>{{ row.itemCode || '-' }}</td>
                  <td>{{ row.productIdentifier || '-' }}</td>
                  <td>{{ row.qualityGrade || '-' }}</td>
                  <td>{{ formatInteger(row.quantity) }}</td>
                  <td>{{ formatDateTime(row.updateTime) }}</td>
                </tr>
                <tr v-if="!tableList.length">
                  <td colspan="9" class="empty-row">暂无库存记录</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="InventoryBoard">
import { computed, onMounted, reactive, ref } from 'vue'
import { getInventoryBoardChart, getInventoryBoardSummary, listInventoryBoard } from '@/api/wms/inventoryBoard'
import { useWmsStore } from '@/store/modules/wms'
import { parseTime } from '@/utils/ruoyi'

const wmsStore = useWmsStore()

const queryParams = reactive({
  warehouseId: undefined,
  itemName: '',
  skuName: ''
})

const summary = reactive({
  currentQuantity: 0,
  availableQuantity: 0,
  warehouseCount: 0,
  areaCount: 0,
  abnormalCount: 0
})

const chartList = ref([])
const tableList = ref([])

const warehouseOptions = computed(() => wmsStore.warehouseList || [])

const chartUpperBound = computed(() => {
  const values = chartList.value.map(item => Number(item.quantity || 0))
  const max = Math.max(...values, 0)
  if (max <= 0) {
    return 5
  }
  const baseStep = max / 5
  const magnitude = 10 ** Math.floor(Math.log10(baseStep))
  const normalized = baseStep / magnitude
  let step = 1
  if (normalized > 5) {
    step = 10
  } else if (normalized > 2) {
    step = 5
  } else if (normalized > 1) {
    step = 2
  }
  return step * magnitude * 5
})

const yAxisTicks = computed(() => {
  const upperBound = chartUpperBound.value
  const step = upperBound / 5
  return [5, 4, 3, 2, 1].map(index => formatInteger(step * index))
})

const buildQuery = () => {
  const query = { ...queryParams }
  Object.keys(query).forEach(key => {
    if (query[key] === '' || query[key] === null || typeof query[key] === 'undefined') {
      delete query[key]
    }
  })
  return query
}

const formatInteger = (value) => {
  const number = Number(value || 0)
  return Number.isNaN(number) ? '0' : `${Math.round(number)}`
}

const formatDateTime = (value) => parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}') || '-'

const calcBarHeight = (value) => {
  const number = Number(value || 0)
  if (!number || chartUpperBound.value <= 0) {
    return 0
  }
  return Math.max(10, (number / chartUpperBound.value) * 100)
}

const barClass = (index) => {
  const classNames = ['bar-primary', 'bar-secondary', 'bar-light', 'bar-accent', 'bar-light', 'bar-light']
  return classNames[index] || 'bar-light'
}

const loadBoard = async () => {
  const query = buildQuery()
  const [summaryRes, chartRes, listRes] = await Promise.all([
    getInventoryBoardSummary(query),
    getInventoryBoardChart(query),
    listInventoryBoard({
      ...query,
      pageNum: 1,
      pageSize: 100
    })
  ])

  Object.assign(summary, summaryRes.data || {})
  chartList.value = chartRes.data || []
  tableList.value = listRes.rows || []
}

const handleQuery = () => {
  loadBoard()
}

onMounted(async () => {
  await wmsStore.getWarehouseList()
  await loadBoard()
})
</script>

<style scoped>
.inventory-board-page {
  background: #f3f5f8;
}

.board-shell {
  min-height: calc(100vh - 84px);
}

.board-banner {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  border-radius: 2px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.1) 18%, transparent 18%) 0 0 / 120px 54px,
    linear-gradient(315deg, rgba(255, 255, 255, 0.08) 14%, transparent 14%) 0 0 / 160px 54px,
    linear-gradient(90deg, #1579ef 0%, #26a0fb 100%);
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.16);
}

.board-panel {
  background: #f3f5f8;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1.42fr 0.58fr;
  gap: 12px;
  align-items: stretch;
}

.chart-card,
.filter-card,
.metric-card,
.table-card {
  border: 1px solid #e6ebf2;
  border-radius: 2px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 63, 0.04);
}

.chart-card {
  padding: 0 10px 10px;
}

.chart-title,
.table-title {
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 6px;
  color: #53657d;
  font-size: 13px;
  font-weight: 600;
}

.chart-area {
  display: grid;
  grid-template-columns: 46px 1fr;
  height: 218px;
  padding: 0;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 6px 30px 0;
  color: #6b7280;
  font-size: 12px;
  text-align: right;
}

.chart-plot {
  position: relative;
  padding: 0 8px 4px 0;
}

.grid-lines {
  position: absolute;
  inset: 10px 0 28px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-lines span {
  width: 100%;
  border-top: 1px solid #e8edf4;
}

.bar-list {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 0 0;
}

.bar-item {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.bar-value {
  height: 20px;
  color: #4b5563;
  font-size: 12px;
  font-weight: 700;
  line-height: 20px;
}

.bar-track {
  width: 100%;
  height: 146px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar-column {
  width: min(82px, 100%);
  min-height: 0;
}

.bar-primary {
  background: #1664d9;
}

.bar-secondary {
  background: #5494d8;
}

.bar-accent {
  background: #2f7fe8;
}

.bar-light {
  background: #a8d7ea;
}

.bar-label {
  width: 100%;
  margin-top: 8px;
  color: #506070;
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-empty {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 13px;
}

.filter-card {
  display: flex;
  align-items: stretch;
  padding: 12px 14px;
}

.filter-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.filter-item label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  color: #5a6578;
  font-size: 12px;
  font-weight: 600;
}

.filter-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.filter-control :deep(.el-input__wrapper),
.filter-control :deep(.el-select__wrapper) {
  min-height: 34px;
  border-radius: 2px;
  box-shadow: 0 0 0 1px #dfe5ef inset;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.metric-card {
  padding: 18px 12px;
  text-align: center;
}

.metric-label {
  color: #7d8ba1;
  font-size: 12px;
  line-height: 1;
}

.metric-value {
  margin-top: 28px;
  color: #5893f8;
  font-size: 18px;
  line-height: 1;
}

.metric-value strong {
  margin-right: 4px;
  font-size: 22px;
  font-weight: 500;
}

.table-card {
  margin-top: 12px;
}

.table-wrap {
  padding: 0 14px 14px;
  background: #fff;
}

.table-wrap table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.table-wrap thead th {
  height: 34px;
  padding: 0 8px;
  border: 1px solid #b6d2f1;
  background: #8fc1f2;
  color: #36536d;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.table-wrap tbody td {
  height: 38px;
  padding: 0 8px;
  border: 1px solid #d7e7f7;
  color: #4b5b6f;
  font-size: 12px;
  text-align: center;
  background: #f8fbff;
}

.table-wrap tbody tr:nth-child(even) td {
  background: #edf5fe;
}

.table-wrap tbody .cell-center {
  text-align: center;
}

.empty-row {
  color: #909399;
}

@media (max-width: 1366px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
