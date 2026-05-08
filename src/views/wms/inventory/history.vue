<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px">
        <el-form-item label="操作类型" prop="orderType">
          <el-radio-group v-model="queryParams.orderType" @change="handleQuery">
            <el-radio-button :label="-1">全部</el-radio-button>
            <el-radio-button v-for="item in wms_inventory_history_type" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="操作单号" prop="orderNo">
          <el-input v-model="queryParams.orderNo" clearable placeholder="请输入操作单号" />
        </el-form-item>
        <el-form-item label="仓库库区" prop="place">
          <WarehouseCascader v-model:value="queryParams.place" :show-all-levels="true" size="default" />
        </el-form-item>
        <el-form-item label="器材名称" prop="itemName">
          <el-input v-model="queryParams.itemName" clearable placeholder="请输入器材名称" />
        </el-form-item>
        <el-form-item label="器材编码" prop="equipmentCode">
          <el-input v-model="queryParams.equipmentCode" clearable placeholder="请输入器材编码" />
        </el-form-item>
        <el-form-item label="规格型号" prop="specModel">
          <el-input v-model="queryParams.specModel" clearable placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="产品标识" prop="productMark">
          <el-input v-model="queryParams.productMark" clearable placeholder="请输入产品标识" />
        </el-form-item>
        <el-form-item label="质量等级" prop="qualityGrade">
          <el-select v-model="queryParams.qualityGrade" clearable placeholder="请选择质量等级" style="width: 180px">
            <el-option v-for="item in wms_quality_grade" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="所在单位" prop="belongUnit">
          <el-input v-model="queryParams.belongUnit" clearable placeholder="请输入所在单位" />
        </el-form-item>
        <el-form-item label="操作时间" prop="createTimeRange">
          <el-date-picker
            v-model="queryParams.createTimeRange"
            type="datetimerange"
            range-separator="至"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['wms:inventoryHistory:all']">导出</el-button>
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
          <el-statistic title="当前页数量变化合计" :value="pageSummary.quantity" :precision="0" />
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
        <div class="table-title">库存流水</div>
        <div class="table-tip">支持按操作类型与总账核心字段追溯库存变化</div>
      </div>
      <el-table v-loading="loading" :data="inventoryHistoryList" border class="mt20" empty-text="暂无库存流水" cell-class-name="vertical-top-cell">
        <el-table-column label="操作单号" prop="orderNo" min-width="160" show-overflow-tooltip />
        <el-table-column label="器材信息" min-width="200">
          <template #default="{ row }">
            <div>{{ row.itemName || row.item?.itemName || '-' }}</div>
            <div class="sub-text">器材编码：{{ row.equipmentCode || row.item?.itemCode || '-' }}</div>
            <div v-if="row.equipmentName" class="sub-text">装备名称：{{ row.equipmentName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="规格信息" min-width="180">
          <template #default="{ row }">
            <div>{{ row.itemSku?.skuName || row.skuName || '-' }}</div>
            <div class="sub-text">规格型号：{{ row.specModel || row.itemSku?.specModel || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="产品标识" prop="productMark" min-width="150" show-overflow-tooltip />
        <el-table-column label="质量等级" min-width="120">
          <template #default="{ row }">
            <span>{{ displayQualityGrade(row.qualityGrade) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="所在单位" prop="belongUnit" min-width="140" show-overflow-tooltip />
        <el-table-column label="操作类型" align="center" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_inventory_history_type" :value="row.orderType" />
          </template>
        </el-table-column>
        <el-table-column label="仓库/库区" min-width="180">
          <template #default="{ row }">
            <div>仓库：{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName || '-' }}</div>
            <div>库区：{{ useWmsStore().areaMap.get(row.areaId)?.areaName || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="数量/金额(元)" min-width="170">
          <template #default="{ row }">
            <div class="flex-space-between">
              <div>数量：</div>
              <el-statistic :value="Number(row.quantity || 0)" :precision="0" />
            </div>
            <div class="flex-space-between">
              <div>单价：</div>
              <span>{{ formatMoney(row.unitPrice) }}</span>
            </div>
            <div class="flex-space-between">
              <div>总价：</div>
              <span>{{ formatMoney(row.lineAmount || row.amount) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="批号" prop="batchNo" min-width="120" />
        <el-table-column label="生产日期/过期日期" min-width="200">
          <template #default="{ row }">
            <div v-if="row.productionDate">生产日期：{{ parseTime(row.productionDate, '{y}-{m}-{d}') }}</div>
            <div v-if="row.expirationDate">过期日期：{{ parseTime(row.expirationDate, '{y}-{m}-{d}') }}</div>
            <div v-if="!row.productionDate && !row.expirationDate">-</div>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="140" show-overflow-tooltip />
        <el-table-column label="操作时间" min-width="160">
          <template #default="{ row }">
            {{ parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="100" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleGoOrder(row)">相关单据</el-button>
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

<script setup name="InventoryHistory">
import { computed, getCurrentInstance, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listInventoryHistory } from '@/api/wms/inventoryHistory'
import { useWmsStore } from '@/store/modules/wms'
import { parseTime } from '@/utils/ruoyi'
import WarehouseCascader from '@/views/components/WarehouseCascader.vue'

const defaultTime = reactive([new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)])
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const { wms_inventory_history_type, wms_quality_grade } = proxy.useDict('wms_inventory_history_type', 'wms_quality_grade')

const inventoryHistoryList = ref([])
const loading = ref(true)
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  orderType: -1,
  orderNo: undefined,
  itemName: undefined,
  itemCode: undefined,
  equipmentCode: undefined,
  specModel: undefined,
  productMark: undefined,
  qualityGrade: undefined,
  belongUnit: undefined,
  skuName: undefined,
  skuCode: undefined,
  place: [],
  warehouseId: undefined,
  areaId: undefined,
  createTimeRange: []
})

const pageSummary = computed(() => {
  let quantity = 0
  let lineAmount = 0
  inventoryHistoryList.value.forEach(item => {
    quantity += Number(item.quantity || 0)
    lineAmount += Number(item.lineAmount || item.amount || 0)
  })
  return {
    recordCount: inventoryHistoryList.value.length,
    quantity,
    lineAmount: Number(lineAmount.toFixed(2))
  }
})

const buildQuery = (includePage = true) => {
  const query = { ...queryParams.value }
  if (!includePage) {
    delete query.pageNum
    delete query.pageSize
  }
  if (query.orderType === -1) {
    delete query.orderType
  }
  if (query.place?.length) {
    query.warehouseId = query.place[0]
    query.areaId = query.place[1]
  }
  if (query.createTimeRange?.length) {
    query.startTime = query.createTimeRange[0]
    query.endTime = query.createTimeRange[1]
  }
  delete query.place
  delete query.createTimeRange
  Object.keys(query).forEach(key => {
    if (query[key] === '' || query[key] === null || typeof query[key] === 'undefined') {
      delete query[key]
    }
  })
  return query
}

function getList() {
  loading.value = true
  listInventoryHistory(buildQuery()).then(response => {
    inventoryHistoryList.value = response.rows || []
    total.value = response.total || 0
  }).finally(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  queryParams.value.pageNum = 1
  queryParams.value.pageSize = 10
  queryParams.value.createTimeRange = []
  queryParams.value.place = []
  queryParams.value.orderType = -1
  getList()
}

const handleExport = () => {
  proxy.download('wms/inventoryHistory/export', buildQuery(false), `inventory_history_${new Date().getTime()}.xlsx`)
}

const handleGoOrder = (row) => {
  const orderPathMap = {
    1: '/receiptOrderEdit',
    2: '/shipmentOrderEdit',
    3: '/movementOrderEdit',
    4: '/checkOrderEdit'
  }
  const path = orderPathMap[row.orderType]
  if (!path || !row.orderId) {
    proxy.$modal.msgWarning('当前记录缺少可跳转的单据信息')
    return
  }
  router.push({ path, query: { id: row.orderId } })
}

const displayQualityGrade = (value) => proxy.selectDictLabel(wms_quality_grade.value, value) || value || '-'
const formatMoney = (value) => (value || value === 0) ? Number(value).toFixed(2) : '-'

const initFromRoute = () => {
  queryParams.value.orderNo = route.query.orderNo || undefined
  queryParams.value.itemName = route.query.itemName || undefined
  queryParams.value.equipmentCode = route.query.equipmentCode || undefined
  queryParams.value.specModel = route.query.specModel || undefined
  queryParams.value.productMark = route.query.productMark || undefined
  queryParams.value.qualityGrade = route.query.qualityGrade || undefined
  queryParams.value.belongUnit = route.query.belongUnit || undefined
}

initFromRoute()
getList()
</script>
<style lang="scss">
.el-statistic__content {
  font-size: 14px;
}

.el-table .vertical-top-cell {
  vertical-align: top
}

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

