<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" label-width="88px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="入库单号" prop="receiptOrderNo">
              <el-input v-model="queryParams.receiptOrderNo" clearable placeholder="请输入入库单号" @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="器材名称" prop="itemName">
              <el-input v-model="queryParams.itemName" clearable placeholder="请输入器材名称" @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="器材编码" prop="itemCode">
              <el-input v-model="queryParams.itemCode" clearable placeholder="请输入器材编码" @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="入库时间" prop="createTimeRange">
              <el-date-picker
                v-model="queryParams.createTimeRange"
                type="datetimerange"
                range-separator="至"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                :default-time="defaultTime"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="query-actions-row">
            <div class="query-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <el-table v-loading="loading" :data="detailList" border class="mt20" empty-text="暂无入库明细">
        <el-table-column label="入库单号" width="160">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleGoOrder(row)" :disabled="!row.receiptOrderId && !row.receiptOrder?.id">
              {{ row.receiptOrder?.receiptOrderNo || '-' }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="器材名称" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.itemName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="实例编码" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.instanceCode || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="规格型号" width="130" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.skuName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="仓库" width="110">
          <template #default="{ row }">
            {{ useWmsStore().warehouseMap.get(row.receiptOrder?.warehouseId || row.warehouseId)?.warehouseName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="库区" width="110">
          <template #default="{ row }">
            {{ useWmsStore().areaMap.get(row.receiptOrder?.areaId || row.areaId)?.areaName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="数量" width="80" align="right">
          <template #default="{ row }">
            <el-statistic :value="Number(row.quantity || 0)" :precision="0" />
          </template>
        </el-table-column>
        <el-table-column label="金额(元)" width="100" align="right">
          <template #default="{ row }">
            <el-statistic v-if="row.lineAmount || row.lineAmount === 0" :value="Number(row.lineAmount)" :precision="2" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" show-overflow-tooltip />
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

<script setup name="ReceiptDetail">
import { getCurrentInstance, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listReceiptOrderDetail } from '@/api/wms/receiptOrderDetail'
import { useWmsStore } from '@/store/modules/wms'
import { resolveRoutePath } from '@/utils/routeResolver'

const defaultTime = reactive([new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)])
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const detailList = ref([])
const loading = ref(true)
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  receiptOrderNo: undefined,
  itemName: undefined,
  itemCode: undefined,
  createTimeRange: []
})

const buildQuery = () => {
  const query = { ...queryParams.value }
  if (query.createTimeRange?.length) {
    query.startTime = query.createTimeRange[0]
    query.endTime = query.createTimeRange[1]
  }
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
  listReceiptOrderDetail(buildQuery()).then(response => {
    detailList.value = response.rows || []
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
  getList()
}

const handleGoOrder = (row) => {
  const orderId = row.receiptOrderId || row.receiptOrder?.id
  if (!orderId) {
    proxy.$modal.msgWarning('当前记录缺少关联的入库单信息')
    return
  }
  const path = resolveRoutePath(router, { preferredPaths: ['/receiptOrderEdit'], titleKeywords: ['入库'] }) || '/receiptOrderEdit'
  router.push({ path, query: { id: orderId, mode: 'view', returnFullPath: route.fullPath } })
}

getList()
</script>
<style lang="scss">
.el-statistic__content {
  font-size: 14px;
}

.query-actions-row {
  display: flex;
  justify-content: flex-end;
}

.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
