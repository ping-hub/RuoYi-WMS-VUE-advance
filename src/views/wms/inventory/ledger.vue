<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="90px">
        <el-form-item label="器材编码" prop="equipmentCode">
          <el-input v-model="queryParams.equipmentCode" clearable placeholder="请输入器材编码" />
        </el-form-item>
        <el-form-item label="器材名称" prop="itemName">
          <el-input v-model="queryParams.itemName" clearable placeholder="请输入器材名称" />
        </el-form-item>
        <el-form-item label="规格型号" prop="specModel">
          <el-input v-model="queryParams.specModel" clearable placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="产品标识" prop="productMark">
          <el-input v-model="queryParams.productMark" clearable placeholder="请输入产品标识" />
        </el-form-item>
        <el-form-item label="装备名称" prop="equipmentName">
          <el-input v-model="queryParams.equipmentName" clearable placeholder="请输入装备名称" />
        </el-form-item>
        <el-form-item label="质量等级" prop="qualityGrade">
          <el-select v-model="queryParams.qualityGrade" clearable placeholder="请选择质量等级" style="width: 180px">
            <el-option v-for="item in wms_quality_grade" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="所在单位" prop="belongUnit">
          <el-input v-model="queryParams.belongUnit" clearable placeholder="请输入所在单位" />
        </el-form-item>
        <el-form-item label="时间范围" prop="createTimeRange">
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
          <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['wms:ledger:export']">导出</el-button>
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
        <div class="table-title">器材总账</div>
        <div class="table-tip">汇总口径以当前查询条件下的库存余额为准</div>
      </div>
      <el-table v-loading="loading" :data="ledgerList" border empty-text="暂无总账数据">
        <el-table-column label="器材编码" prop="equipmentCode" min-width="140" show-overflow-tooltip />
        <el-table-column label="器材名称" prop="itemName" min-width="160" show-overflow-tooltip />
        <el-table-column label="规格型号" prop="specModel" min-width="160" show-overflow-tooltip />
        <el-table-column label="产品标识" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ displayProductMark(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="装备名称" prop="equipmentName" min-width="160" show-overflow-tooltip />
        <el-table-column label="质量等级" min-width="120">
          <template #default="{ row }">
            <span>{{ displayQualityGrade(row.qualityGrade) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="单价(元)" align="right" min-width="120">
          <template #default="{ row }">
            <span>{{ formatMoney(row.unitPrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" align="right" min-width="100">
          <template #default="{ row }">
            <el-statistic :value="Number(row.quantity || 0)" :precision="0" />
          </template>
        </el-table-column>
        <el-table-column label="计量单位" prop="unit" min-width="100" />
        <el-table-column label="总价(元)" align="right" min-width="120">
          <template #default="{ row }">
            <span>{{ formatMoney(row.lineAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="所在单位" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ displayBelongUnit(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="140" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleGoDetail(row)" v-hasPermi="['wms:inventoryDetail:all']">库存明细</el-button>
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

<script setup name="Ledger">
import { computed, getCurrentInstance, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listLedger } from '@/api/wms/ledger'
import { resolveRoutePath } from '@/utils/routeResolver'

const defaultTime = reactive([new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)])
const { proxy } = getCurrentInstance()
const router = useRouter()
const { wms_quality_grade } = proxy.useDict('wms_quality_grade')

const loading = ref(false)
const total = ref(0)
const ledgerList = ref([])

const resolveInventoryDetailPath = () => {
  return resolveRoutePath(router, { exactTitles: ['库存明细'] }) || '/index'
}

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  equipmentCode: undefined,
  itemName: undefined,
  specModel: undefined,
  productMark: undefined,
  equipmentName: undefined,
  qualityGrade: undefined,
  belongUnit: undefined,
  createTimeRange: []
})

const pageSummary = computed(() => {
  let quantity = 0
  let lineAmount = 0
  ledgerList.value.forEach(item => {
    quantity += Number(item.quantity || 0)
    lineAmount += Number(item.lineAmount || 0)
  })
  return {
    recordCount: ledgerList.value.length,
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

const getList = async () => {
  loading.value = true
  try {
    const res = await listLedger(buildQuery())
    ledgerList.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

const resetQuery = () => {
  proxy.resetForm('queryRef')
  queryParams.value.pageNum = 1
  queryParams.value.pageSize = 10
  queryParams.value.createTimeRange = []
  getList()
}

const handleExport = () => {
  proxy.download('wms/ledger/export', buildQuery(false), `ledger_${new Date().getTime()}.xlsx`)
}

const handleGoDetail = (row) => {
  const query = {
    fromLedger: '1',
    equipmentCode: row.equipmentCode || undefined,
    itemName: row.itemName || undefined,
    specModel: row.specModel || undefined,
    productMark: resolveProductMarkValue(row) || undefined,
    equipmentName: row.equipmentName || undefined,
    qualityGrade: row.qualityGrade || undefined,
    belongUnit: resolveBelongUnitValue(row) || undefined,
    createStartTime: queryParams.value.createTimeRange?.[0],
    createEndTime: queryParams.value.createTimeRange?.[1],
    queryType: 'item'
  }
  router.push({ path: resolveInventoryDetailPath(), query })
}

const displayQualityGrade = (value) => proxy.selectDictLabel(wms_quality_grade.value, value) || value || '-'
const resolveProductMarkValue = (row = {}) => row.productMark ?? row.inventoryDetail?.productMark ?? row.itemInstance?.productMark
const resolveBelongUnitValue = (row = {}) => row.belongUnit ?? row.item?.defaultBelongUnit ?? row.itemSku?.item?.defaultBelongUnit
const displayProductMark = (row = {}) => resolveProductMarkValue(row) ?? '-'
const displayBelongUnit = (row = {}) => resolveBelongUnitValue(row) ?? '-'
const formatMoney = (value) => (value || value === 0) ? Number(value).toFixed(2) : '-'

getList()
</script>

<style scoped lang="scss">
.table-title {
  font-size: 18px;
  font-weight: 600;
}

.table-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
