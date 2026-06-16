<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" label-width="88px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="仓库库区" prop="place">
              <WarehouseCascader v-model:value="queryParams.place" :show-all-levels="true" size="default" @change="handleQuery" />
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
            <div class="query-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <el-table v-loading="loading" :data="groupedList" border class="mt20" empty-text="暂无库存数据">
        <el-table-column label="器材名称" min-width="200" show-overflow-tooltip prop="itemName" />
        <el-table-column label="器材编码" min-width="150" show-overflow-tooltip prop="itemCode" />
        <el-table-column label="规格型号" min-width="180" show-overflow-tooltip prop="skuName" />
        <el-table-column label="仓库" min-width="110">
          <template #default="{ row }">
            {{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="库区" min-width="110">
          <template #default="{ row }">
            {{ row.areaId ? useWmsStore().areaMap.get(row.areaId)?.areaName || '-' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="数量" min-width="80" align="right">
          <template #default="{ row }">
            <el-statistic :value="Number(row.quantity)" :precision="0" />
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

<script setup name="InventorySummary">
import { computed, getCurrentInstance, ref } from 'vue'
import { listInventory } from '@/api/wms/inventory'
import { useWmsStore } from '@/store/modules/wms'
import WarehouseCascader from '@/views/components/WarehouseCascader.vue'

const { proxy } = getCurrentInstance()

const inventoryList = ref([])
const loading = ref(true)
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  itemName: undefined,
  itemCode: undefined,
  place: [],
  warehouseId: undefined,
  areaId: undefined,
})

// 按 规格型号 + 仓库 + 库区 聚合数量（去掉货架/货位维度后合并同类）
const groupedList = computed(() => {
  const map = {}
  inventoryList.value.forEach(item => {
    const skuId = item.skuId || ''
    const warehouseId = item.warehouseId || ''
    const areaId = item.areaId || ''
    const key = `${skuId}-${warehouseId}-${areaId}`
    if (!map[key]) {
      map[key] = {
        itemName: item.item?.itemName || '',
        itemCode: item.item?.itemCode || '',
        skuName: item.itemSku?.skuName || '',
        warehouseId,
        areaId,
        quantity: 0
      }
    }
    map[key].quantity += Number(item.quantity || 0)
  })
  return Object.values(map)
})

const buildQuery = () => {
  const query = { ...queryParams.value }
  if (query.place?.length) {
    query.warehouseId = query.place[0]
    query.areaId = query.place[1]
  }
  delete query.place
  Object.keys(query).forEach(key => {
    if (query[key] === '' || query[key] === null || typeof query[key] === 'undefined') {
      delete query[key]
    }
  })
  return query
}

function getList() {
  loading.value = true
  listInventory(buildQuery()).then(response => {
    inventoryList.value = response.rows || []
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
  queryParams.value.place = []
  getList()
}

getList()
</script>
<style lang="scss">
.el-statistic__content {
  font-size: 14px;
}

.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
