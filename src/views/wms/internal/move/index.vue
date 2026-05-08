<template>
  <div class="app-container">
    <el-alert
      class="mb16"
      :closable="false"
      type="info"
      title="本页仅处理同仓内位置变化；跨仓或单位间流转请使用调拨作业。"
    />

    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="94px">
        <el-form-item label="移库单号" prop="internalMoveOrderNo">
          <el-input v-model="queryParams.internalMoveOrderNo" placeholder="请输入移库单号" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="移库状态" prop="internalMoveStatus">
          <el-select v-model="queryParams.internalMoveStatus" placeholder="请选择移库状态" clearable style="width: 160px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库" prop="sourceWarehouseId">
          <el-select v-model="queryParams.sourceWarehouseId" placeholder="请选择仓库" clearable filterable style="width: 180px" @change="handleSourceWarehouseChange">
            <el-option v-for="item in wmsStore.warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="源库区" prop="sourceAreaId">
          <el-select v-model="queryParams.sourceAreaId" placeholder="请选择源库区" clearable filterable style="width: 180px" @change="handleSourceAreaChange">
            <el-option v-for="item in sourceAreaOptions" :key="item.id" :label="item.areaName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="源货架" prop="sourceRackId">
          <RackSelect v-model="queryParams.sourceRackId" :warehouse-id="queryParams.sourceWarehouseId" :area-id="queryParams.sourceAreaId" @update:model-value="handleSourceRackChange" />
        </el-form-item>
        <el-form-item label="源货位" prop="sourceLocationId">
          <LocationSelect v-model="queryParams.sourceLocationId" :warehouse-id="queryParams.sourceWarehouseId" :area-id="queryParams.sourceAreaId" :rack-id="queryParams.sourceRackId" />
        </el-form-item>
        <el-form-item label="目标库区" prop="targetAreaId">
          <el-select v-model="queryParams.targetAreaId" placeholder="请选择目标库区" clearable filterable style="width: 180px" @change="handleTargetAreaChange">
            <el-option v-for="item in sourceAreaOptions" :key="item.id" :label="item.areaName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标货架" prop="targetRackId">
          <RackSelect v-model="queryParams.targetRackId" :warehouse-id="queryParams.sourceWarehouseId" :area-id="queryParams.targetAreaId" @update:model-value="handleTargetRackChange" />
        </el-form-item>
        <el-form-item label="目标货位" prop="targetLocationId">
          <LocationSelect v-model="queryParams.targetLocationId" :warehouse-id="queryParams.sourceWarehouseId" :area-id="queryParams.targetAreaId" :rack-id="queryParams.targetRackId" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="8">
          <div class="page-title">库内移库</div>
          <div class="page-tip">支持按同仓内源位置和目标位置维护库内移库单，并联动库存与对象位置。</div>
        </el-col>
        <el-col :span="4" class="toolbar-right">
          <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wms:internalMove:edit']">新增移库单</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="internalMoveList" border empty-text="暂无库内移库单" cell-class-name="vertical-top-cell">
        <el-table-column label="移库单号" prop="internalMoveOrderNo" min-width="180" />
        <el-table-column label="移库状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.internalMoveStatus)">{{ getStatusLabel(row.internalMoveStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="仓库" min-width="140">
          <template #default="{ row }">
            {{ warehouseNameMap.get(row.sourceWarehouseId) || row.sourceWarehouseId || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="源位置" min-width="220">
          <template #default="{ row }">
            <div>库区：{{ areaNameMap.get(row.sourceAreaId) || row.sourceAreaId || '-' }}</div>
            <div class="sub-text">货架：{{ rackNameMap.get(row.sourceRackId) || row.sourceRackId || '-' }} / 货位：{{ locationNameMap.get(row.sourceLocationId) || row.sourceLocationId || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="目标位置" min-width="220">
          <template #default="{ row }">
            <div>库区：{{ areaNameMap.get(row.targetAreaId) || row.targetAreaId || '-' }}</div>
            <div class="sub-text">货架：{{ rackNameMap.get(row.targetRackId) || row.targetRackId || '-' }} / 货位：{{ locationNameMap.get(row.targetLocationId) || row.targetLocationId || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="数量/原因" min-width="180">
          <template #default="{ row }">
            <div>总数量：{{ row.totalQuantity || 0 }}</div>
            <div class="sub-text">原因：{{ row.moveReason || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" width="220">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button v-if="Number(row.internalMoveStatus) === 0" link type="primary" @click="handleEdit(row)" v-hasPermi="['wms:internalMove:edit']">修改</el-button>
            <el-button v-if="Number(row.internalMoveStatus) === 0" link type="danger" @click="handleDelete(row)" v-hasPermi="['wms:internalMove:remove']">删除</el-button>
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
    </el-card>
  </div>
</template>

<script setup name="InternalMoveOrder">
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { parseTime } from '@/utils/ruoyi'
import { listInternalMoveOrder, delInternalMoveOrder } from '@/api/wms/internalMoveOrder'
import { useWmsStore } from '@/store/modules/wms'
import { listRackNoPage } from '@/api/wms/rack'
import { listLocationNoPage } from '@/api/wms/location'
import RackSelect from '@/views/components/RackSelect.vue'
import LocationSelect from '@/views/components/LocationSelect.vue'

const { proxy } = getCurrentInstance()
const router = useRouter()
const wmsStore = useWmsStore()

const loading = ref(false)
const total = ref(0)
const internalMoveList = ref([])
const rackNameMap = ref(new Map())
const locationNameMap = ref(new Map())

const statusOptions = [
  { label: '待执行', value: 0 },
  { label: '已执行', value: 1 },
  { label: '已作废', value: -1 }
]

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  internalMoveOrderNo: undefined,
  internalMoveStatus: undefined,
  sourceWarehouseId: undefined,
  sourceAreaId: undefined,
  sourceRackId: undefined,
  sourceLocationId: undefined,
  targetAreaId: undefined,
  targetRackId: undefined,
  targetLocationId: undefined
})

const sourceAreaOptions = computed(() => {
  if (!queryParams.sourceWarehouseId) {
    return wmsStore.areaList
  }
  return wmsStore.areaList.filter(item => item.warehouseId === queryParams.sourceWarehouseId)
})

const warehouseNameMap = computed(() => wmsStore.warehouseMap)
const areaNameMap = computed(() => wmsStore.areaMap)

function getStatusLabel(value) {
  return statusOptions.find(item => Number(item.value) === Number(value))?.label || value || '-'
}

function getStatusType(value) {
  if (Number(value) === 1) return 'success'
  if (Number(value) === -1) return 'info'
  return 'warning'
}

async function loadPlaceMaps() {
  const [rackRes, locationRes] = await Promise.all([
    listRackNoPage({}),
    listLocationNoPage({})
  ])
  const rackMap = new Map()
  const locationMap = new Map()
  ;(rackRes.data || []).forEach(item => {
    rackMap.set(item.id, item.rackName || item.rackCode || item.id)
  })
  ;(locationRes.data || []).forEach(item => {
    locationMap.set(item.id, item.locationName || item.locationCode || item.id)
  })
  rackNameMap.value = rackMap
  locationNameMap.value = locationMap
}

async function getList() {
  loading.value = true
  try {
    const res = await listInternalMoveOrder(queryParams)
    internalMoveList.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleSourceWarehouseChange() {
  queryParams.sourceAreaId = undefined
  queryParams.sourceRackId = undefined
  queryParams.sourceLocationId = undefined
  queryParams.targetAreaId = undefined
  queryParams.targetRackId = undefined
  queryParams.targetLocationId = undefined
}

function handleSourceAreaChange() {
  queryParams.sourceRackId = undefined
  queryParams.sourceLocationId = undefined
}

function handleSourceRackChange() {
  queryParams.sourceLocationId = undefined
}

function handleTargetAreaChange() {
  queryParams.targetRackId = undefined
  queryParams.targetLocationId = undefined
}

function handleTargetRackChange() {
  queryParams.targetLocationId = undefined
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleSourceWarehouseChange()
  handleQuery()
}

function handleAdd() {
  router.push({ path: '/internalMoveOrderEdit' })
}

function handleEdit(row) {
  router.push({ path: '/internalMoveOrderEdit', query: { id: row.id } })
}

function handleView(row) {
  router.push({ path: '/internalMoveOrderEdit', query: { id: row.id, mode: 'view' } })
}

async function handleDelete(row) {
  await proxy.$modal.confirm('确认删除库内移库单【' + row.internalMoveOrderNo + '】吗？')
  await delInternalMoveOrder(row.id)
  proxy.$modal.msgSuccess('删除成功')
  await getList()
}

onMounted(async () => {
  await Promise.all([
    wmsStore.getWarehouseList(),
    wmsStore.getAreaList(),
    loadPlaceMaps()
  ])
  await getList()
})
</script>

<style scoped lang="scss">
.mb16 {
  margin-bottom: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.page-tip,
.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.toolbar-right {
  display: flex;
  justify-content: flex-end;
}

.vertical-top-cell {
  vertical-align: top;
}
</style>
