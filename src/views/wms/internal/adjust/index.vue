<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="90px">
        <el-form-item label="调整状态" prop="adjustStatus">
          <el-select v-model="queryParams.adjustStatus" clearable placeholder="请选择调整状态" style="width: 160px">
            <el-option label="暂存" :value="0" />
            <el-option label="完成" :value="1" />
            <el-option label="作废" :value="-1" />
          </el-select>
        </el-form-item>
        <el-form-item label="调整单号" prop="adjustOrderNo">
          <el-input v-model="queryParams.adjustOrderNo" clearable placeholder="请输入调整单号" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select
            v-model="queryParams.warehouseId"
            clearable
            filterable
            placeholder="请选择仓库"
            style="width: 180px"
            @change="handleQueryWarehouseChange"
          >
            <el-option v-for="item in wmsStore.warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="库区" prop="areaId">
          <el-select
            v-model="queryParams.areaId"
            clearable
            filterable
            placeholder="请选择库区"
            :disabled="!queryParams.warehouseId"
            style="width: 180px"
          >
            <el-option
              v-for="item in wmsStore.areaList.filter(it => it.warehouseId === queryParams.warehouseId)"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调整原因" prop="adjustReason">
          <el-input v-model="queryParams.adjustReason" clearable placeholder="请输入调整原因" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <div class="mb8 flex-space-between">
        <div class="table-title">库存调整</div>
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wms:adjust:all']">新增调整单</el-button>
      </div>
      <el-table v-loading="loading" :data="adjustOrderList" border empty-text="暂无库存调整单">
        <el-table-column label="调整单号" prop="adjustOrderNo" min-width="160" />
        <el-table-column label="仓储位置" min-width="220">
          <template #default="{ row }">
            <div>仓库：{{ wmsStore.warehouseMap.get(row.warehouseId)?.warehouseName || '-' }}</div>
            <div>库区：{{ wmsStore.areaMap.get(row.areaId)?.areaName || '-' }}</div>
            <div>货架：{{ row.rackId || '-' }} / 货位：{{ row.locationId || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="调整原因" prop="adjustReason" min-width="180" show-overflow-tooltip />
        <el-table-column label="经手人" prop="handlerName" min-width="120" />
        <el-table-column label="调整日期" min-width="170">
          <template #default="{ row }">
            {{ parseTime(row.adjustDate, '{y}-{m}-{d} {h}:{i}') || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.adjustStatus)">{{ statusText(row.adjustStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="调整摘要" min-width="220">
          <template #default="{ row }">
            <div>明细行数：{{ row.details?.length || 0 }}</div>
            <div class="sub-text">差异合计：{{ calcDifferenceTotal(row.details) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" :disabled="row.adjustStatus !== 0" @click="handleUpdate(row)">修改</el-button>
            <el-button link type="primary" :disabled="row.adjustStatus !== 0" @click="handleExecute(row)">完成调整</el-button>
            <el-button link type="danger" :disabled="row.adjustStatus === 1" @click="handleDelete(row)">删除</el-button>
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

    <el-drawer v-model="dialog.visible" :title="dialog.title" size="88%" append-to-body :close-on-click-modal="false">
      <el-form ref="adjustFormRef" :model="form" :rules="rules" label-width="108px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="调整单号" prop="adjustOrderNo">
              <el-input v-model="form.adjustOrderNo" placeholder="请输入调整单号" :disabled="!!form.id" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="调整日期" prop="adjustDate">
              <el-date-picker
                v-model="form.adjustDate"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="经手人" prop="handlerName">
              <el-input v-model="form.handlerName" placeholder="请输入经手人" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="仓库" prop="warehouseId">
              <el-select v-model="form.warehouseId" filterable placeholder="请选择仓库" style="width: 100%" @change="handleFormWarehouseChange">
                <el-option v-for="item in wmsStore.warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="库区" prop="areaId">
              <el-select
                v-model="form.areaId"
                filterable
                clearable
                placeholder="请选择库区"
                :disabled="!form.warehouseId"
                style="width: 100%"
                @change="handleFormAreaChange"
              >
                <el-option
                  v-for="item in wmsStore.areaList.filter(it => it.warehouseId === form.warehouseId)"
                  :key="item.id"
                  :label="item.areaName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="货架" prop="rackId">
              <RackSelect v-model="form.rackId" :warehouse-id="form.warehouseId" :area-id="form.areaId" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="货位" prop="locationId">
              <LocationSelect v-model="form.locationId" :warehouse-id="form.warehouseId" :area-id="form.areaId" :rack-id="form.rackId" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="调整原因" prop="adjustReason">
              <el-input v-model="form.adjustReason" type="textarea" :rows="3" placeholder="请输入调整原因" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-card shadow="never">
        <template #header>
          <div class="flex-space-between">
            <span>调整明细</span>
            <el-button type="primary" plain icon="Plus" :disabled="!form.warehouseId" @click="showInventorySelect">选择库存明细</el-button>
          </div>
        </template>
        <el-table :data="form.details" border empty-text="暂无调整明细">
          <el-table-column label="器材信息" min-width="200">
            <template #default="{ row }">
              <div>{{ row.itemSku?.item?.itemName || '-' }}</div>
              <div class="sub-text">类型编码：{{ row.itemSku?.item?.itemCode || '-' }}</div>
              <div class="sub-text">器材编码：{{ row.equipmentCode || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="器材规格" min-width="180">
            <template #default="{ row }">
              <div>{{ row.itemSku?.skuName || '-' }}</div>
              <div class="sub-text">规格型号：{{ row.specModel || row.itemSku?.specModel || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="产品标识/质量等级" min-width="180">
            <template #default="{ row }">
              <div>产品标识：{{ row.productMark || '-' }}</div>
              <div class="sub-text">质量等级：{{ displayQualityGrade(row.qualityGrade) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="原货位" min-width="180">
            <template #default="{ row }">
              <div>仓库：{{ wmsStore.warehouseMap.get(row.warehouseId)?.warehouseName || '-' }}</div>
              <div>库区：{{ wmsStore.areaMap.get(row.areaId)?.areaName || '-' }}</div>
              <div class="sub-text">货架：{{ row.rackId || '-' }} / 货位：{{ row.locationId || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="调整前数量" width="120" align="right">
            <template #default="{ row }">
              <el-statistic :value="Number(row.beforeQuantity || 0)" :precision="0" />
            </template>
          </el-table-column>
          <el-table-column label="调整后数量" width="160">
            <template #default="{ row }">
              <el-input-number v-model="row.afterQuantity" :min="0" :precision="0" :controls="false" @change="handleAfterQuantityChange(row)" />
            </template>
          </el-table-column>
          <el-table-column label="差异数量" width="120" align="right">
            <template #default="{ row }">
              <span :class="Number(row.differenceQuantity || 0) === 0 ? '' : 'diff-highlight'">{{ row.differenceQuantity || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="批号" prop="batchNo" min-width="120" />
          <el-table-column label="备注" min-width="160">
            <template #default="{ row }">
              <el-input v-model="row.remark" placeholder="请输入备注" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" fixed="right" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" @click="handleDeleteDetail($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="buttonLoading" @click="submitForm(false)">暂存</el-button>
          <el-button type="success" :loading="buttonLoading" @click="submitForm(true)">完成调整</el-button>
          <el-button @click="dialog.visible = false">取消</el-button>
        </div>
      </template>
    </el-drawer>

    <InventoryDetailSelect
      ref="inventorySelectRef"
      :model-value="inventorySelectVisible"
      :size="'90%'"
      :selected-inventory="selectedInventory"
      @handleOkClick="handleInventorySelectOk"
      @handleCancelClick="inventorySelectVisible = false"
    />
  </div>
</template>

<script setup name="InventoryAdjust">
import { getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import { useWmsStore } from '@/store/modules/wms'
import { parseTime, generateNo } from '@/utils/ruoyi'
import { addAdjustOrder, delAdjustOrder, executeAdjustOrder, getAdjustOrder, listAdjustOrder, updateAdjustOrder } from '@/api/wms/adjustOrder'
import InventoryDetailSelect from '@/views/components/InventoryDetailSelect.vue'
import RackSelect from '@/views/components/RackSelect.vue'
import LocationSelect from '@/views/components/LocationSelect.vue'

const { proxy } = getCurrentInstance()
const { wms_quality_grade } = proxy.useDict('wms_quality_grade')
const wmsStore = useWmsStore()

const loading = ref(false)
const buttonLoading = ref(false)
const total = ref(0)
const adjustOrderList = ref([])
const inventorySelectVisible = ref(false)
const selectedInventory = ref([])
const queryRef = ref()
const adjustFormRef = ref()
const inventorySelectRef = ref()

const dialog = reactive({
  visible: false,
  title: ''
})

const initFormData = () => ({
  id: undefined,
  adjustOrderNo: undefined,
  adjustDate: undefined,
  warehouseId: undefined,
  areaId: undefined,
  rackId: undefined,
  locationId: undefined,
  adjustReason: undefined,
  adjustStatus: 0,
  handlerName: undefined,
  remark: undefined,
  details: []
})

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    adjustStatus: undefined,
    adjustOrderNo: undefined,
    warehouseId: undefined,
    areaId: undefined,
    adjustReason: undefined
  },
  form: initFormData(),
  rules: {
    adjustOrderNo: [{ required: true, message: '调整单号不能为空', trigger: 'blur' }],
    warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

const statusText = (value) => {
  if (value === 1) return '完成'
  if (value === -1) return '作废'
  return '暂存'
}

const statusTagType = (value) => {
  if (value === 1) return 'success'
  if (value === -1) return 'info'
  return 'warning'
}

const displayQualityGrade = (value) => proxy.selectDictLabel(wms_quality_grade.value, value) || value || '-'

const calcDifferenceTotal = (details = []) => {
  return details.reduce((sum, item) => sum + Number(item.differenceQuantity || 0), 0).toFixed(0)
}

const normalizeDetail = (item, index) => ({
  id: item.id,
  adjustOrderId: form.value.id,
  lineNo: item.lineNo || index + 1,
  skuId: item.skuId || item.itemSku?.id,
  equipmentCode: item.equipmentCode,
  specModel: item.specModel || item.itemSku?.specModel,
  productMark: item.productMark,
  qualityGrade: item.qualityGrade,
  warehouseId: item.warehouseId,
  areaId: item.areaId,
  rackId: item.rackId,
  locationId: item.locationId,
  itemInstanceId: item.itemInstanceId,
  boxId: item.boxId,
  inventoryDetailId: item.inventoryDetailId || item.id,
  beforeQuantity: item.beforeQuantity,
  afterQuantity: item.afterQuantity,
  differenceQuantity: item.differenceQuantity,
  batchNo: item.batchNo,
  productionDate: item.productionDate,
  expirationDate: item.expirationDate,
  remark: item.remark
})

const handleAfterQuantityChange = (row) => {
  row.differenceQuantity = Number(row.afterQuantity || 0) - Number(row.beforeQuantity || 0)
}

const handleQueryWarehouseChange = () => {
  queryParams.value.areaId = undefined
}

const handleFormWarehouseChange = () => {
  form.value.areaId = undefined
  form.value.rackId = undefined
  form.value.locationId = undefined
}

const handleFormAreaChange = () => {
  form.value.rackId = undefined
  form.value.locationId = undefined
}

const getList = async () => {
  loading.value = true
  try {
    const res = await listAdjustOrder(queryParams.value)
    adjustOrderList.value = res.rows || []
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
  getList()
}

const resetForm = () => {
  form.value = initFormData()
  selectedInventory.value = []
}

const showInventorySelect = () => {
  if (!form.value.warehouseId) {
    ElMessage.warning('请先选择仓库')
    return
  }
  inventorySelectVisible.value = true
  setTimeout(() => {
    inventorySelectRef.value?.setWarehouseIdAndAreaId(form.value.warehouseId, form.value.areaId)
    inventorySelectRef.value?.getList()
  }, 0)
}

const handleInventorySelectOk = (rows) => {
  inventorySelectVisible.value = false
  rows.forEach(item => {
    if (form.value.details.find(detail => (detail.inventoryDetailId || detail.id) === item.id)) {
      return
    }
    form.value.details.push({
      inventoryDetailId: item.id,
      skuId: item.itemSku?.id,
      itemSku: item.itemSku,
      equipmentCode: item.equipmentCode,
      specModel: item.specModel || item.itemSku?.specModel,
      productMark: item.productMark,
      qualityGrade: item.qualityGrade,
      warehouseId: item.warehouseId,
      areaId: item.areaId,
      rackId: item.rackId,
      locationId: item.locationId,
      beforeQuantity: Number(item.remainQuantity || item.quantity || 0),
      afterQuantity: Number(item.remainQuantity || item.quantity || 0),
      differenceQuantity: 0,
      batchNo: item.batchNo,
      productionDate: item.productionDate,
      expirationDate: item.expirationDate,
      remark: undefined
    })
  })
  selectedInventory.value = form.value.details.map(item => ({ id: item.inventoryDetailId || item.id }))
}

const handleDeleteDetail = (index) => {
  form.value.details.splice(index, 1)
  selectedInventory.value = form.value.details.map(item => ({ id: item.inventoryDetailId || item.id }))
}

const handleAdd = () => {
  resetForm()
  dialog.title = '新增库存调整'
  dialog.visible = true
  form.value.adjustOrderNo = 'TZ' + generateNo()
  form.value.adjustDate = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
}

const loadDetail = async (id) => {
  const res = await getAdjustOrder(id)
  form.value = {
    ...initFormData(),
    ...res.data,
    details: (res.data.details || []).map(item => ({ ...item }))
  }
  selectedInventory.value = form.value.details.map(item => ({ id: item.inventoryDetailId }))
}

const handleUpdate = async (row) => {
  resetForm()
  dialog.title = '修改库存调整'
  await loadDetail(row.id)
  dialog.visible = true
}

const buildPayload = () => ({
  ...form.value,
  details: form.value.details.map((item, index) => normalizeDetail(item, index))
})

const submitForm = (execute) => {
  adjustFormRef.value.validate(async valid => {
    if (!valid) {
      return
    }
    if (!form.value.details.length) {
      proxy.$modal.msgWarning('请至少选择一条库存明细')
      return
    }
    buttonLoading.value = true
    try {
      const payload = buildPayload()
      if (execute) {
        await executeAdjustOrder(payload)
        proxy.$modal.msgSuccess('调整完成')
      } else if (form.value.id) {
        await updateAdjustOrder(payload)
        proxy.$modal.msgSuccess('修改成功')
      } else {
        await addAdjustOrder(payload)
        proxy.$modal.msgSuccess('新增成功')
      }
      dialog.visible = false
      await getList()
    } finally {
      buttonLoading.value = false
    }
  })
}

const handleExecute = async (row) => {
  await proxy.$modal.confirm(`确认完成调整单【${row.adjustOrderNo}】吗？`)
  const res = await getAdjustOrder(row.id)
  await executeAdjustOrder({
    ...res.data,
    details: (res.data.details || []).map((item, index) => normalizeDetail(item, index))
  })
  proxy.$modal.msgSuccess('调整完成')
  await getList()
}

const handleDelete = async (row) => {
  await proxy.$modal.confirm(`确认删除调整单【${row.adjustOrderNo}】吗？`)
  await delAdjustOrder(row.id)
  proxy.$modal.msgSuccess('删除成功')
  await getList()
}

onMounted(async () => {
  await Promise.all([
    wmsStore.getWarehouseList(),
    wmsStore.getAreaList()
  ])
  await getList()
})
</script>

<style scoped>
.table-title {
  font-size: 18px;
  font-weight: 600;
}

.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.diff-highlight {
  color: var(--el-color-danger);
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
