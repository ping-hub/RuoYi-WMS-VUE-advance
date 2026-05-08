<template>
  <div class="app-container storage-layout-page">
    <el-card shadow="never">
      <el-form :model="queryParams" :inline="true" label-width="84px">
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="queryParams.warehouseId" clearable filterable placeholder="请选择仓库" style="width: 200px">
            <el-option v-for="item in warehouseOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="库区" prop="areaId">
          <el-select v-model="queryParams.areaId" clearable filterable placeholder="请选择库区" style="width: 200px">
            <el-option v-for="item in areaOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="loadLayoutTree">刷新布局</el-button>
          <el-button icon="Refresh" @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="page-tip">
        仓储布局统一浏览仓库、库区、货架、货位；本页用于布局浏览，不替代仓库和库区维护页面。
      </div>
    </el-card>

    <el-row :gutter="16" class="mt16">
      <el-col :xl="7" :lg="8" :md="24" :sm="24" :xs="24">
        <el-card v-loading="treeLoading" shadow="never" class="full-height-card">
          <template #header>
            <div class="card-header">
              <span>仓储树</span>
              <span class="header-sub">{{ treeStats.warehouseCount }} 仓 / {{ treeStats.areaCount }} 区 / {{ treeStats.rackCount }} 架 / {{ treeStats.locationCount }} 位</span>
            </div>
          </template>
          <el-empty v-if="!treeData.length" description="暂无仓储布局数据" />
          <el-tree
            v-else
            :data="treeData"
            node-key="nodeKey"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <div class="tree-node">
                <span>{{ formatNodeLabel(data) }}</span>
                <el-tag size="small" :type="nodeTagType(data)" effect="plain">{{ nodeTypeLabelMap[data.nodeType] || data.nodeType }}</el-tag>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <el-col :xl="17" :lg="16" :md="24" :sm="24" :xs="24">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>货架格子图</span>
              <span class="header-sub">{{ currentRackText }}</span>
            </div>
          </template>
          <div class="toolbar-row">
            <el-select v-model="currentRackId" clearable filterable placeholder="请选择当前货架" style="width: 260px" @change="handleRackChange">
              <el-option v-for="item in rackOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
            <div class="legend-group">
              <span class="legend-item"><i class="legend-block legend-empty" />空位</span>
              <span class="legend-item"><i class="legend-block legend-occupied" />有货</span>
              <span class="legend-item"><i class="legend-block legend-disabled" />停用/异常</span>
            </div>
          </div>

          <el-descriptions v-if="rackGrid" :column="4" border class="mb16">
            <el-descriptions-item label="货架">{{ currentRackInfo?.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="行列">{{ `${rackGrid.rowCount || 0} 行 / ${rackGrid.columnCount || 0} 列` }}</el-descriptions-item>
            <el-descriptions-item label="尺寸">{{ formatDimensionText(rackGrid.length, rackGrid.width, rackGrid.height) }}</el-descriptions-item>
            <el-descriptions-item label="排序号">{{ rackGrid.orderNum ?? '-' }}</el-descriptions-item>
          </el-descriptions>

          <div v-loading="gridLoading" class="grid-panel">
            <el-empty v-if="!currentRackId" description="请先在左侧仓储树或上方下拉框中选择货架" />
            <el-empty v-else-if="!rackGrid" description="当前货架暂无格子图数据" />
            <div
              v-else
              class="rack-grid"
              :style="{ gridTemplateColumns: `repeat(${Math.max(rackGrid.columnCount || 1, 1)}, minmax(92px, 1fr))` }"
            >
              <button
                v-for="cell in normalizedCells"
                :key="cell.gridKey"
                type="button"
                class="grid-cell"
                :class="[`grid-cell--${cell.visualType}`, { 'is-active': selectedLocationId === cell.locationId }]"
                :disabled="!cell.locationId"
                @click="handleCellClick(cell)"
              >
                <span class="grid-cell__title">{{ cell.locationName || `R${cell.rowNo}-C${cell.columnNo}` }}</span>
                <span class="grid-cell__meta">{{ cell.locationCode || '未建货位' }}</span>
                <span class="grid-cell__meta">箱体 {{ cell.boxCount || 0 }} / 明细 {{ cell.itemInstanceCount || 0 }}</span>
              </button>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="mt16" v-loading="summaryLoading">
          <template #header>
            <div class="card-header">
              <span>货位摘要</span>
              <span class="header-sub">{{ summaryTitle }}</span>
            </div>
          </template>
          <el-empty v-if="!locationSummary" description="点击货架格子查看货位摘要" />
          <template v-else>
            <el-descriptions :column="3" border>
              <el-descriptions-item label="货位">{{ locationSummary.locationName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="货位编码">{{ locationSummary.locationCode || '-' }}</el-descriptions-item>
              <el-descriptions-item label="货位状态">{{ locationSummary.locationStatus || '-' }}</el-descriptions-item>
              <el-descriptions-item label="仓库">{{ locationSummary.warehouseName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="库区">{{ locationSummary.areaName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="货架">{{ locationSummary.rackName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="格子坐标">{{ `第 ${locationSummary.rowNo || '-'} 行 / 第 ${locationSummary.columnNo || '-'} 列` }}</el-descriptions-item>
              <el-descriptions-item label="尺寸">{{ formatDimensionText(locationSummary.length, locationSummary.width, locationSummary.height) }}</el-descriptions-item>
              <el-descriptions-item label="容积">{{ locationSummary.volume ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="最大承重">{{ locationSummary.maxWeight ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="占用状态">{{ formatOccupiedText(locationSummary.occupiedFlag) }}</el-descriptions-item>
              <el-descriptions-item label="箱体数">{{ locationSummary.boxCount || 0 }}</el-descriptions-item>
              <el-descriptions-item label="器材数">{{ locationSummary.itemInstanceCount || 0 }}</el-descriptions-item>
            </el-descriptions>

            <div class="summary-subtitle">货位内器材摘要</div>
            <el-table :data="locationSummary.itemSummaries || []" border empty-text="当前货位暂无器材">
              <el-table-column label="器材名称" prop="itemName" min-width="180" />
              <el-table-column label="器材规格" prop="skuName" min-width="180" />
              <el-table-column label="数量" prop="quantity" width="100" align="right" />
            </el-table>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="StorageLayout">
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { getLocationSummary, getRackGrid, getStorageLayoutTree } from '@/api/wms/storageLayout'

const { proxy } = getCurrentInstance()

const queryParams = reactive({
  warehouseId: undefined,
  areaId: undefined
})

const treeLoading = ref(false)
const gridLoading = ref(false)
const summaryLoading = ref(false)
const treeData = ref([])
const currentRackId = ref()
const rackGrid = ref()
const locationSummary = ref()
const selectedLocationId = ref()

const nodeTypeLabelMap = {
  warehouse: '仓库',
  area: '库区',
  rack: '货架',
  location: '货位'
}

const enhanceTreeNodes = (nodes) => {
  return (nodes || []).map(item => ({
    ...item,
    nodeKey: `${item.nodeType}-${item.id}`,
    children: enhanceTreeNodes(item.children)
  }))
}

const collectNodes = (nodes, nodeType, result = []) => {
  ;(nodes || []).forEach(item => {
    if (item.nodeType === nodeType) {
      result.push(item)
    }
    if (item.children?.length) {
      collectNodes(item.children, nodeType, result)
    }
  })
  return result
}

const findFirstNode = (nodes, nodeType) => {
  for (const item of nodes || []) {
    if (item.nodeType === nodeType) {
      return item
    }
    if (item.children?.length) {
      const child = findFirstNode(item.children, nodeType)
      if (child) {
        return child
      }
    }
  }
  return null
}

const warehouseOptions = computed(() => collectNodes(treeData.value, 'warehouse'))

const areaOptions = computed(() => {
  if (!queryParams.warehouseId) {
    return collectNodes(treeData.value, 'area')
  }
  const warehouse = warehouseOptions.value.find(item => item.id === queryParams.warehouseId)
  return collectNodes(warehouse?.children || [], 'area')
})

const rackOptions = computed(() => {
  if (queryParams.areaId) {
    const area = areaOptions.value.find(item => item.id === queryParams.areaId)
    return collectNodes(area?.children || [], 'rack')
  }
  if (queryParams.warehouseId) {
    const warehouse = warehouseOptions.value.find(item => item.id === queryParams.warehouseId)
    return collectNodes(warehouse?.children || [], 'rack')
  }
  return collectNodes(treeData.value, 'rack')
})

const treeStats = computed(() => ({
  warehouseCount: warehouseOptions.value.length,
  areaCount: collectNodes(treeData.value, 'area').length,
  rackCount: collectNodes(treeData.value, 'rack').length,
  locationCount: collectNodes(treeData.value, 'location').length
}))

const currentRackInfo = computed(() => rackOptions.value.find(item => item.id === currentRackId.value))

const currentRackText = computed(() => {
  const rack = rackOptions.value.find(item => item.id === currentRackId.value)
  return rack ? `${rack.name}${rack.code ? ` / ${rack.code}` : ''}` : '未选择货架'
})

const summaryTitle = computed(() => {
  if (!locationSummary.value) {
    return '未选择货位'
  }
  return `${locationSummary.value.locationName || '-'} / ${locationSummary.value.locationCode || '-'}`
})

const normalizedCells = computed(() => {
  if (!rackGrid.value?.rowCount || !rackGrid.value?.columnCount) {
    return []
  }
  const cellMap = new Map()
  ;(rackGrid.value.cells || []).forEach(cell => {
    cellMap.set(`${cell.rowNo}-${cell.columnNo}`, cell)
  })
  const cells = []
  for (let rowNo = 1; rowNo <= rackGrid.value.rowCount; rowNo += 1) {
    for (let columnNo = 1; columnNo <= rackGrid.value.columnCount; columnNo += 1) {
      const current = cellMap.get(`${rowNo}-${columnNo}`) || {}
      cells.push({
        ...current,
        rowNo,
        columnNo,
        gridKey: `${rowNo}-${columnNo}`,
        visualType: getCellVisualType(current)
      })
    }
  }
  return cells
})

function formatNodeLabel(node) {
  return node.code ? `${node.name} (${node.code})` : node.name
}

function nodeTagType(node) {
  if (node.nodeType === 'warehouse') return 'primary'
  if (node.nodeType === 'area') return 'success'
  if (node.nodeType === 'rack') return 'warning'
  return 'info'
}

function getCellVisualType(cell) {
  if (!cell.locationId) {
    return 'disabled'
  }
  if (cell.locationStatus && cell.locationStatus !== 'enabled') {
    return 'disabled'
  }
  if (Number(cell.occupiedFlag) === 1 || Number(cell.itemInstanceCount) > 0 || Number(cell.boxCount) > 0) {
    return 'occupied'
  }
  return 'empty'
}

function formatDimensionText(length, width, height) {
  if (![length, width, height].some(value => value || value === 0)) {
    return '-'
  }
  return `长 ${length ?? '-'} / 宽 ${width ?? '-'} / 高 ${height ?? '-'}`
}

function formatOccupiedText(flag) {
  return Number(flag) === 1 ? '已占用' : '空闲'
}

async function loadLayoutTree() {
  treeLoading.value = true
  try {
    const res = await getStorageLayoutTree(queryParams)
    treeData.value = enhanceTreeNodes(res.data || [])
    if (!currentRackId.value) {
      const firstRack = findFirstNode(treeData.value, 'rack')
      currentRackId.value = firstRack?.id
    } else if (!rackOptions.value.some(item => item.id === currentRackId.value)) {
      currentRackId.value = rackOptions.value[0]?.id
    }
    if (currentRackId.value) {
      await loadRackGrid(currentRackId.value)
    } else {
      rackGrid.value = undefined
      locationSummary.value = undefined
      selectedLocationId.value = undefined
    }
  } finally {
    treeLoading.value = false
  }
}

async function loadRackGrid(rackId) {
  if (!rackId) {
    rackGrid.value = undefined
    return
  }
  gridLoading.value = true
  try {
    const res = await getRackGrid(rackId)
    rackGrid.value = res.data
    const availableCell = (res.data?.cells || []).find(item => item.locationId)
    if (availableCell?.locationId) {
      selectedLocationId.value = availableCell.locationId
      await loadLocationDetail(availableCell.locationId)
    } else {
      selectedLocationId.value = undefined
      locationSummary.value = undefined
    }
  } finally {
    gridLoading.value = false
  }
}

async function loadLocationDetail(locationId) {
  if (!locationId) {
    locationSummary.value = undefined
    return
  }
  summaryLoading.value = true
  try {
    const res = await getLocationSummary(locationId)
    locationSummary.value = res.data
  } finally {
    summaryLoading.value = false
  }
}

function applyNodeSelection(treeNode) {
  const chain = []
  let current = treeNode
  while (current && current.level > 0) {
    chain.unshift(current.data)
    current = current.parent
  }
  queryParams.warehouseId = chain.find(item => item.nodeType === 'warehouse')?.id
  queryParams.areaId = chain.find(item => item.nodeType === 'area')?.id
  const rack = chain.find(item => item.nodeType === 'rack')
  const location = chain.find(item => item.nodeType === 'location')
  currentRackId.value = rack?.id
  if (location?.id) {
    selectedLocationId.value = location.id
    loadLocationDetail(location.id)
  } else if (rack?.id) {
    loadRackGrid(rack.id)
  }
}

function handleNodeClick(data, node) {
  const previousRackId = currentRackId.value
  applyNodeSelection(node)
  if (data.nodeType === 'location' && data.id) {
    selectedLocationId.value = data.id
    if (currentRackId.value && currentRackId.value !== previousRackId) {
      loadRackGrid(currentRackId.value).then(() => loadLocationDetail(data.id))
      return
    }
    loadLocationDetail(data.id)
  }
}

function handleRackChange(value) {
  selectedLocationId.value = undefined
  if (!value) {
    rackGrid.value = undefined
    locationSummary.value = undefined
    return
  }
  loadRackGrid(value)
}

function handleCellClick(cell) {
  if (!cell.locationId) {
    return
  }
  selectedLocationId.value = cell.locationId
  loadLocationDetail(cell.locationId)
}

function resetFilters() {
  queryParams.warehouseId = undefined
  queryParams.areaId = undefined
  currentRackId.value = undefined
  selectedLocationId.value = undefined
  rackGrid.value = undefined
  locationSummary.value = undefined
  loadLayoutTree()
}

onMounted(() => {
  loadLayoutTree().catch(() => {
    proxy?.$modal?.msgError('仓储布局加载失败，请稍后重试')
  })
})
</script>

<style scoped>
.storage-layout-page .mt16 {
  margin-top: 16px;
}

.storage-layout-page .mb16 {
  margin-bottom: 16px;
}

.full-height-card {
  min-height: 720px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.header-sub {
  color: #909399;
  font-size: 12px;
}

.page-tip {
  color: #606266;
  font-size: 13px;
}

.tree-node {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.toolbar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.legend-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 13px;
}

.legend-block {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  display: inline-block;
}

.legend-empty {
  background: #ecf5ff;
  border: 1px solid #a0cfff;
}

.legend-occupied {
  background: #f0f9eb;
  border: 1px solid #95d475;
}

.legend-disabled {
  background: #f4f4f5;
  border: 1px solid #c8c9cc;
}

.grid-panel {
  min-height: 280px;
}

.rack-grid {
  display: grid;
  gap: 12px;
}

.grid-cell {
  min-height: 96px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  text-align: left;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.grid-cell:hover:not(:disabled) {
  transform: translateY(-1px);
}

.grid-cell:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.grid-cell.is-active {
  box-shadow: 0 0 0 2px #409eff inset;
}

.grid-cell--empty {
  background: #ecf5ff;
  border-color: #a0cfff;
}

.grid-cell--occupied {
  background: #f0f9eb;
  border-color: #95d475;
}

.grid-cell--disabled {
  background: #f4f4f5;
  border-color: #c8c9cc;
}

.grid-cell__title {
  font-weight: 600;
  color: #303133;
}

.grid-cell__meta {
  color: #606266;
  font-size: 12px;
  line-height: 1.5;
}

.summary-subtitle {
  margin: 16px 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
</style>
