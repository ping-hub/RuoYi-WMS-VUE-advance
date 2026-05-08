<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="90px">
        <el-form-item label="维度" prop="itemId" class="col4">
          <el-radio-group v-model="queryType" @change="handleSortTypeChange">
            <el-radio-button label="warehouse">仓库库区</el-radio-button>
            <el-radio-button label="item">器材</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseId" class="col4">
          <el-select v-model="queryParams.warehouseId" placeholder="请选择仓库" @change="handleChangeWarehouse" filterable clearable style="width: 100%">
            <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="库区" prop="areaId" class="col4">
          <el-select v-model="queryParams.areaId" placeholder="请选择库区" :disabled="!queryParams.warehouseId" clearable filterable style="width: 100%">
            <el-option
              v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === queryParams.warehouseId)"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="器材名称" prop="itemName" class="col4">
          <el-input v-model="queryParams.itemName" clearable placeholder="请输入器材名称" />
        </el-form-item>
        <el-form-item label="器材编码" prop="equipmentCode" class="col4">
          <el-input v-model="queryParams.equipmentCode" clearable placeholder="请输入器材编码" />
        </el-form-item>
        <el-form-item label="规格型号" prop="specModel" class="col4">
          <el-input v-model="queryParams.specModel" clearable placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="产品标识" prop="productMark" class="col4">
          <el-input v-model="queryParams.productMark" clearable placeholder="请输入产品标识" />
        </el-form-item>
        <el-form-item label="质量等级" prop="qualityGrade" class="col4">
          <el-select v-model="queryParams.qualityGrade" clearable placeholder="请选择质量等级" style="width: 100%">
            <el-option v-for="item in wms_quality_grade" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="所在单位" prop="belongUnit" class="col4">
          <el-input v-model="queryParams.belongUnit" clearable placeholder="请输入所在单位" />
        </el-form-item>
        <el-form-item label="批号" prop="batchNo" class="col4">
          <el-input v-model="queryParams.batchNo" clearable placeholder="请输入批号" />
        </el-form-item>
        <el-form-item label="过期" prop="daysToExpires" class="col4">
          <el-select v-model="queryParams.daysToExpires" clearable style="width: 100%">
            <el-option label="30天内" :value="30" />
            <el-option label="60天内" :value="60" />
            <el-option label="90天内" :value="90" />
            <el-option label="120天内" :value="120" />
            <el-option label="180天内" :value="180" />
            <el-option label="365天内" :value="365" />
          </el-select>
        </el-form-item>
        <el-form-item label="入库日期" prop="createTimeRange" class="col4">
          <el-date-picker
            v-model="queryParams.createTimeRange"
            type="daterange"
            range-separator="至"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD"
            :default-time="defaultTime"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item class="col4">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['wms:inventoryDetail:all']">导出</el-button>
          <el-button v-if="fromLedger" plain icon="Back" @click="handleBackToLedger">返回器材总账</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="12" class="mt20">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="当前页记录数" :value="pageSummary.recordCount" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="当前页数量合计" :value="pageSummary.quantity" :precision="0" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="当前页金额合计" :value="pageSummary.lineAmount" :precision="2" />
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt20">
      <div class="mb8 flex-space-between">
        <div class="table-title">库存明细</div>
        <div class="table-tip">支持从器材总账下钻，并联查相关单据与库存流水</div>
      </div>
      <el-table
        :data="inventoryDetailList"
        border
        :span-method="spanMethod"
        cell-class-name="vertical-top-cell"
        v-loading="loading"
        empty-text="暂无库存"
      >
        <template v-if="queryType === 'warehouse'">
          <el-table-column label="仓库" prop="warehouseId" min-width="120">
            <template #default="{ row }">
              <div>{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="库区" prop="areaId" min-width="120">
            <template #default="{ row }">
              <div>{{ useWmsStore().areaMap.get(row.areaId)?.areaName || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="器材信息" prop="areaIdAndItemId" min-width="180">
            <template #default="{ row }">
              <div>{{ row.itemName || row.item?.itemName || '-' }}</div>
              <div class="sub-text">器材编码：{{ row.equipmentCode || row.item?.itemCode || '-' }}</div>
              <div v-if="row.equipmentName" class="sub-text">装备名称：{{ row.equipmentName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="器材规格" prop="areaIdAndSkuId" min-width="180">
            <template #default="{ row }">
              <div>{{ row.itemSku?.skuName || '-' }}</div>
              <div class="sub-text">规格型号：{{ row.specModel || row.itemSku?.specModel || '-' }}</div>
            </template>
          </el-table-column>
        </template>
        <template v-else>
          <el-table-column label="器材信息" prop="itemId" min-width="180">
            <template #default="{ row }">
              <div>{{ row.itemName || row.item?.itemName || '-' }}</div>
              <div class="sub-text">器材编码：{{ row.equipmentCode || row.item?.itemCode || '-' }}</div>
              <div v-if="row.equipmentName" class="sub-text">装备名称：{{ row.equipmentName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="器材规格" prop="skuId" min-width="180">
            <template #default="{ row }">
              <div>{{ row.itemSku?.skuName || '-' }}</div>
              <div class="sub-text">规格型号：{{ row.specModel || row.itemSku?.specModel || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="仓库" prop="skuIdAndWarehouseId" min-width="120">
            <template #default="{ row }">
              <div>{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="所属库区" prop="skuIdAndAreaId" min-width="120">
            <template #default="{ row }">
              <div>{{ useWmsStore().areaMap.get(row.areaId)?.areaName || '-' }}</div>
            </template>
          </el-table-column>
        </template>
        <el-table-column label="产品标识" prop="productMark" min-width="150" show-overflow-tooltip />
        <el-table-column label="质量等级" min-width="120">
          <template #default="{ row }">
            <span>{{ displayQualityGrade(row.qualityGrade) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="所在单位" prop="belongUnit" min-width="140" show-overflow-tooltip />
        <el-table-column label="入库日期" align="left" prop="createTime" width="160">
          <template #default="{ row }">
            <div>{{ parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}') || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="库存" prop="quantity" align="right" min-width="100">
          <template #default="{ row }">
            <el-statistic :value="Number(row.quantity || 0)" :precision="0" />
          </template>
        </el-table-column>
        <el-table-column label="计量单位" prop="unit" min-width="90" />
        <el-table-column label="单价(元)" align="right" min-width="120">
          <template #default="{ row }">
            <span>{{ formatMoney(row.unitPrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总价(元)" align="right" min-width="120">
          <template #default="{ row }">
            <span>{{ formatMoney(row.lineAmount || row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="批号" align="left" prop="batchNo" min-width="120" />
        <el-table-column label="生产日期/过期日期" align="left" width="200">
          <template #default="{ row }">
            <div v-if="row.productionDate">生产日期：{{ parseTime(row.productionDate, '{y}-{m}-{d}') }}</div>
            <div v-if="row.expirationDate">过期日期：{{ parseTime(row.expirationDate, '{y}-{m}-{d}') }}</div>
            <div v-if="!row.productionDate && !row.expirationDate">-</div>
          </template>
        </el-table-column>
        <el-table-column label="关联单据" min-width="160">
          <template #default="{ row }">
            <div>{{ orderTypeText(row.type) }}</div>
            <div class="sub-text">{{ row.orderNo || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="170" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleGoOrder(row)">相关单据</el-button>
            <el-button link type="primary" @click="handleGoHistory(row)">流水</el-button>
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

<script setup name="InventoryDetail">
import { computed, getCurrentInstance, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWmsStore } from '@/store/modules/wms'
import { listInventoryDetail } from '@/api/wms/inventoryDetail'
import { getRowspanMethod } from '@/utils/getRowSpanMethod'
import { parseTime } from '../../../utils/ruoyi'

const defaultTime = reactive([new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)])
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const { wms_quality_grade } = proxy.useDict('wms_quality_grade')

const queryType = ref('warehouse')
const inventoryDetailList = ref([])
const loading = ref(false)
const total = ref(0)
const fromLedger = computed(() => route.query.fromLedger === '1')
const rowSpanArray = ref(['warehouseId', 'areaId', 'areaIdAndItemId', 'areaIdAndSkuId'])
const spanMethod = computed(() => getRowspanMethod(inventoryDetailList.value, rowSpanArray.value))
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  itemName: undefined,
  itemCode: undefined,
  equipmentCode: undefined,
  equipmentName: undefined,
  specModel: undefined,
  productMark: undefined,
  qualityGrade: undefined,
  belongUnit: undefined,
  skuName: undefined,
  skuCode: undefined,
  areaId: undefined,
  warehouseId: undefined,
  batchNo: undefined,
  daysToExpires: undefined,
  createTimeRange: []
})

const pageSummary = computed(() => {
  let quantity = 0
  let lineAmount = 0
  inventoryDetailList.value.forEach(item => {
    quantity += Number(item.quantity || 0)
    lineAmount += Number(item.lineAmount || item.amount || 0)
  })
  return {
    recordCount: inventoryDetailList.value.length,
    quantity,
    lineAmount: Number(lineAmount.toFixed(2))
  }
})

const handleChangeWarehouse = () => {
  queryParams.value.areaId = undefined
}

const buildQuery = (includePage = true) => {
  const query = { ...queryParams.value }
  if (!includePage) {
    delete query.pageNum
    delete query.pageSize
  }
  if (query.createTimeRange?.length) {
    query.createStartTime = query.createTimeRange[0]
    query.createEndTime = query.createTimeRange[1]
  }
  delete query.createTimeRange
  Object.keys(query).forEach(key => {
    if (query[key] === '' || query[key] === null || typeof query[key] === 'undefined') {
      delete query[key]
    }
  })
  return query
}

const decorateRows = () => {
  inventoryDetailList.value.forEach(it => {
    if (queryType.value === 'warehouse') {
      it.areaIdAndItemId = `${it.areaId}-${it.item?.id || it.itemId || it.equipmentCode || ''}`
      it.areaIdAndSkuId = `${it.areaId}-${it.itemSku?.id || it.skuId || ''}`
    } else {
      it.itemId = it.item?.id || it.itemId || it.equipmentCode
      it.skuId = it.itemSku?.id || it.skuId
      it.skuIdAndWarehouseId = `${it.itemSku?.id || it.skuId || ''}-${it.warehouseId}`
      it.skuIdAndAreaId = `${it.itemSku?.id || it.skuId || ''}-${it.areaId}`
    }
  })
}

const getList = async () => {
  loading.value = true
  try {
    const res = await listInventoryDetail(buildQuery())
    inventoryDetailList.value = res.rows || []
    total.value = res.total || 0
    decorateRows()
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  queryType.value = 'warehouse'
  rowSpanArray.value = ['warehouseId', 'areaId', 'areaIdAndItemId', 'areaIdAndSkuId']
  proxy.resetForm('queryRef')
  queryParams.value.pageNum = 1
  queryParams.value.pageSize = 10
  queryParams.value.createTimeRange = []
  getList()
}

const handleSortTypeChange = (value) => {
  if (value === 'warehouse') {
    queryParams.value.areaId = undefined
    rowSpanArray.value = ['warehouseId', 'areaId', 'areaIdAndItemId', 'areaIdAndSkuId']
  } else {
    rowSpanArray.value = ['itemId', 'skuId', 'skuIdAndWarehouseId', 'skuIdAndAreaId']
  }
  queryParams.value.pageNum = 1
  getList()
}

const handleExport = () => {
  proxy.download('wms/inventoryDetail/export', buildQuery(false), `inventory_detail_${new Date().getTime()}.xlsx`)
}

const handleGoOrder = (row) => {
  const orderId = row.sourceOrderId || row.receiptOrderId
  if (!orderId) {
    proxy.$modal.msgWarning('当前记录缺少关联单据ID')
    return
  }
  const orderPathMap = {
    1: '/receiptOrderEdit',
    2: '/movementOrderEdit',
    3: '/checkOrderEdit'
  }
  const path = orderPathMap[row.type]
  if (!path) {
    proxy.$modal.msgWarning('暂不支持当前单据类型跳转')
    return
  }
  router.push({ path, query: { id: orderId } })
}

const handleGoHistory = (row) => {
  router.push({
    path: '/inventoryHistory',
    query: {
      orderNo: row.orderNo || undefined,
      equipmentCode: row.equipmentCode || undefined,
      itemName: row.itemName || row.item?.itemName || undefined,
      specModel: row.specModel || undefined,
      productMark: row.productMark || undefined,
      qualityGrade: row.qualityGrade || undefined,
      belongUnit: row.belongUnit || undefined
    }
  })
}

const handleBackToLedger = () => {
  router.back()
}

const orderTypeText = (type) => {
  const map = {
    1: '入库单',
    2: '调拨单',
    3: '盘点单'
  }
  return map[type] || '未知单据'
}

const displayQualityGrade = (value) => proxy.selectDictLabel(wms_quality_grade.value, value) || value || '-'
const formatMoney = (value) => (value || value === 0) ? Number(value).toFixed(2) : '-'

const initFromRoute = () => {
  queryType.value = route.query.queryType || 'warehouse'
  queryParams.value.itemName = route.query.itemName || undefined
  queryParams.value.equipmentCode = route.query.equipmentCode || undefined
  queryParams.value.equipmentName = route.query.equipmentName || undefined
  queryParams.value.specModel = route.query.specModel || undefined
  queryParams.value.productMark = route.query.productMark || undefined
  queryParams.value.qualityGrade = route.query.qualityGrade || undefined
  queryParams.value.belongUnit = route.query.belongUnit || undefined
  if (route.query.createStartTime && route.query.createEndTime) {
    queryParams.value.createTimeRange = [route.query.createStartTime, route.query.createEndTime]
  }
  handleSortTypeChange(queryType.value)
}

initFromRoute()
</script>
<style scoped lang="scss">
.table-title {
  font-size: 18px;
  font-weight: 600;
}

.table-tip,
.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
