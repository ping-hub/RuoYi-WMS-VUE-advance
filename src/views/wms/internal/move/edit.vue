<template>
  <div class="app-container internal-move-edit">
    <div v-loading="loading">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>{{ pageTitle }}</span>
            <span class="header-sub">仅允许同仓内位置变化，源位置与目标位置不能完全一致。</span>
          </div>
        </template>

        <div class="form-tip">带 * 为必填项</div>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="移库单号" prop="internalMoveOrderNo">
                <el-input v-model="form.internalMoveOrderNo" placeholder="请输入移库单号" :disabled="isReadOnly" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="移库状态" prop="internalMoveStatus">
                <el-tag :type="getStatusType(form.internalMoveStatus)">{{ getStatusLabel(form.internalMoveStatus) }}</el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="总数量">
                <el-statistic :value="Number(form.totalQuantity || 0)" :precision="0" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="源仓库" prop="sourceWarehouseId">
                <el-select v-model="form.sourceWarehouseId" placeholder="请选择源仓库" filterable style="width: 100%" :disabled="isReadOnly" @change="handleSourceWarehouseChange">
                  <el-option v-for="item in wmsStore.warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="目标仓库" prop="targetWarehouseId">
                <el-select v-model="form.targetWarehouseId" placeholder="目标仓库与源仓库一致" filterable style="width: 100%" disabled>
                  <el-option v-for="item in wmsStore.warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="源库区" prop="sourceAreaId">
                <el-select v-model="form.sourceAreaId" placeholder="请选择源库区" filterable style="width: 100%" :disabled="isReadOnly" @change="handleSourceAreaChange">
                  <el-option v-for="item in sourceAreaOptions" :key="item.id" :label="item.areaName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="源货架" prop="sourceRackId">
                <RackSelect v-model="form.sourceRackId" :warehouse-id="form.sourceWarehouseId" :area-id="form.sourceAreaId" :disabled="isReadOnly" @update:model-value="handleSourceRackChange" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="源货位" prop="sourceLocationId">
                <LocationSelect v-model="form.sourceLocationId" :warehouse-id="form.sourceWarehouseId" :area-id="form.sourceAreaId" :rack-id="form.sourceRackId" :disabled="isReadOnly" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="目标库区" prop="targetAreaId">
                <el-select v-model="form.targetAreaId" placeholder="请选择目标库区" filterable style="width: 100%" :disabled="isReadOnly" @change="handleTargetAreaChange">
                  <el-option v-for="item in targetAreaOptions" :key="item.id" :label="item.areaName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="targetRackId">
                <template #label>
                  <FormLabelHelp label="目标货架" purpose="指定库内移库后的目标货架，必须属于同一仓库下的目标库区。" example="A区-02号架" />
                </template>
                <RackSelect v-model="form.targetRackId" :warehouse-id="form.targetWarehouseId" :area-id="form.targetAreaId" :disabled="isReadOnly" @update:model-value="handleTargetRackChange" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="targetLocationId">
                <template #label>
                  <FormLabelHelp label="目标货位" purpose="指定库内移库后的最终落位货位，必须与目标货架匹配。" example="A02-03-01" />
                </template>
                <LocationSelect v-model="form.targetLocationId" :warehouse-id="form.targetWarehouseId" :area-id="form.targetAreaId" :rack-id="form.targetRackId" :disabled="isReadOnly" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item prop="moveReason">
                <template #label>
                  <FormLabelHelp label="移库原因" purpose="说明本次库内位置变更的业务原因，便于盘点和追踪核对。" example="货位整理、待检转合格区" />
                </template>
                <el-input v-model="form.moveReason" placeholder="请输入移库原因" :disabled="isReadOnly" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" placeholder="请输入备注" :disabled="isReadOnly" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <el-card class="mt16">
        <template #header>
          <div class="card-header">
            <span>移库明细</span>
            <span class="header-sub">可按库存明细选择需要移库的数量，并支持单品码或箱码定位对象。</span>
          </div>
        </template>

        <div class="toolbar-row">
          <el-button type="primary" plain icon="Plus" :disabled="isReadOnly || !canSelectInventory" @click="showAddDetail">添加明细</el-button>
          <span v-if="!canSelectInventory" class="header-sub">请先选择源仓库和目标位置</span>
        </div>

        <el-table :data="form.details" border empty-text="暂无移库明细" cell-class-name="vertical-top-cell">
          <el-table-column label="器材信息" min-width="210">
            <template #default="{ row }">
              <div>{{ row.itemSku?.item?.itemName || '-' }}</div>
              <div class="sub-text">{{ row.itemSku?.skuName || '-' }}</div>
              <div class="sub-text">规格型号：{{ row.specModel || row.itemSku?.specModel || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="物品码/箱码" min-width="220">
            <template #default="{ row }">
              <div>物品码：{{ row.instanceCode || '-' }}</div>
              <div class="sub-text">箱码：{{ row.boxCode || '-' }}</div>
              <div class="sub-text">器材编码：{{ row.equipmentCode || row.itemSku?.item?.itemCode || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="源位置" min-width="220">
            <template #default="{ row }">
              <div>库区：{{ areaNameMap.get(row.sourceAreaId) || row.sourceAreaId || '-' }}</div>
              <div class="sub-text">货架：{{ rackNameMap.get(row.sourceRackId) || row.sourceRackId || '-' }}</div>
              <div class="sub-text">货位：{{ locationNameMap.get(row.sourceLocationId) || row.sourceLocationId || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="目标位置" min-width="220">
            <template #default="{ row }">
              <div>库区：{{ areaNameMap.get(row.targetAreaId) || row.targetAreaId || '-' }}</div>
              <div class="sub-text">货架：{{ rackNameMap.get(row.targetRackId) || row.targetRackId || '-' }}</div>
              <div class="sub-text">货位：{{ locationNameMap.get(row.targetLocationId) || row.targetLocationId || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="产品标识/质量等级" min-width="180">
            <template #default="{ row }">
              <div>{{ row.productMark || '-' }}</div>
              <div class="sub-text">{{ displayQualityGrade(row) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="单价/总价" min-width="150">
            <template #default="{ row }">
              <div>单价：{{ formatMoney(row.unitPrice) }}</div>
              <div class="sub-text">总价：{{ formatMoney(row.lineAmount) }}</div>
            </template>
          </el-table-column>
          <el-table-column min-width="180" prop="quantity">
            <template #header>
              <FormLabelHelp label="数量" purpose="填写本次从源位置移到目标位置的数量，不得超过剩余库存。" example="1、5" />
            </template>
            <template #default="{ row }">
              <el-input-number
                v-model="row.quantity"
                :min="1"
                :max="Number(row.remainQuantity || 1)"
                :precision="0"
                :disabled="isReadOnly"
                style="width: 100%"
                @change="handleQuantityChange(row)"
              />
              <div class="sub-text mt4">剩余库存：{{ row.remainQuantity || 0 }}</div>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="160">
            <template #default="{ row }">
              <el-input v-model="row.remark" placeholder="请输入备注" :disabled="isReadOnly" />
            </template>
          </el-table-column>
          <el-table-column v-if="!isReadOnly" label="操作" width="100" align="right">
            <template #default="{ $index }">
              <el-button link type="danger" @click="handleDeleteDetail($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <InventoryDetailSelect
      ref="inventorySelectRef"
      :model-value="inventorySelectVisible"
      :selected-inventory="selectedInventory"
      :size="'90%'"
      @handleOkClick="handleInventoryOk"
      @handleCancelClick="inventorySelectVisible = false"
    />

    <div class="footer-global">
      <div class="btn-box">
        <div>
          <el-button v-if="!isReadOnly" type="primary" @click="doMove" v-hasPermi="['wms:internalMove:execute']">执行移库</el-button>
          <el-button v-if="form.id && !isReadOnly" type="danger" @click="handleDeleteOrder" v-hasPermi="['wms:internalMove:remove']">删除</el-button>
        </div>
        <div>
          <el-button v-if="!isReadOnly" type="primary" plain @click="save">暂存</el-button>
          <el-button @click="cancel">返回</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="InternalMoveOrderEdit">
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { parseTime, generateNo } from '@/utils/ruoyi'
import { useWmsStore } from '@/store/modules/wms'
import { listRackNoPage } from '@/api/wms/rack'
import { listLocationNoPage } from '@/api/wms/location'
import {
  addInternalMoveOrder,
  delInternalMoveOrder,
  getInternalMoveOrder,
  moveInternalMoveOrder,
  updateInternalMoveOrder
} from '@/api/wms/internalMoveOrder'
import RackSelect from '@/views/components/RackSelect.vue'
import LocationSelect from '@/views/components/LocationSelect.vue'
import InventoryDetailSelect from '@/views/components/InventoryDetailSelect.vue'
import FormLabelHelp from '@/views/components/FormLabelHelp.vue'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const wmsStore = useWmsStore()
const { wms_quality_grade } = proxy.useDict('wms_quality_grade')

const loading = ref(false)
const buttonLoading = ref(false)
const inventorySelectVisible = ref(false)
const inventorySelectRef = ref(null)
const selectedInventory = ref([])
const rackNameMap = ref(new Map())
const locationNameMap = ref(new Map())

const displayQualityGrade = (row = {}) => {
  const value = row.qualityGrade ?? row.itemSku?.defaultQualityGrade ?? row.itemSku?.item?.defaultQualityGrade
  return proxy.selectDictLabel(wms_quality_grade, value) || value || '-'
}

const initFormData = {
  id: undefined,
  internalMoveOrderNo: undefined,
  sourceWarehouseId: undefined,
  sourceAreaId: undefined,
  sourceRackId: undefined,
  sourceLocationId: undefined,
  targetWarehouseId: undefined,
  targetAreaId: undefined,
  targetRackId: undefined,
  targetLocationId: undefined,
  moveReason: undefined,
  internalMoveStatus: 0,
  totalQuantity: 0,
  remark: undefined,
  details: []
}

const form = reactive({ ...initFormData })
const rules = {
  internalMoveOrderNo: [
    { required: true, message: '移库单号不能为空', trigger: 'blur' }
  ],
  sourceWarehouseId: [
    { required: true, message: '请选择源仓库', trigger: 'change' }
  ],
  targetWarehouseId: [
    { required: true, message: '目标仓库不能为空', trigger: 'change' }
  ],
  targetAreaId: [
    { required: true, message: '请选择目标库区', trigger: 'change' }
  ]
}

const statusOptions = [
  { label: '待执行', value: 0 },
  { label: '已执行', value: 1 },
  { label: '已作废', value: -1 }
]

const isReadOnly = computed(() => route.query.mode === 'view' || Number(form.internalMoveStatus) !== 0)
const sourceAreaOptions = computed(() => {
  if (!form.sourceWarehouseId) {
    return wmsStore.areaList
  }
  return wmsStore.areaList.filter(item => item.warehouseId === form.sourceWarehouseId)
})
const targetAreaOptions = computed(() => sourceAreaOptions.value)
const areaNameMap = computed(() => wmsStore.areaMap)
const pageTitle = computed(() => {
  if (route.query.mode === 'view') return '查看库内移库单'
  return form.id ? '修改库内移库单' : '新增库内移库单'
})
const canSelectInventory = computed(() => {
  return form.sourceWarehouseId && form.sourceAreaId && form.targetAreaId && form.targetRackId && form.targetLocationId
})

function getStatusLabel(value) {
  return statusOptions.find(item => Number(item.value) === Number(value))?.label || value || '-'
}

function getStatusType(value) {
  if (Number(value) === 1) return 'success'
  if (Number(value) === -1) return 'info'
  return 'warning'
}

function formatMoney(value) {
  return (value || value === 0) ? Number(value).toFixed(2) : '-'
}

function resetForm() {
  Object.assign(form, {
    ...initFormData,
    internalMoveOrderNo: generateNo('YN')
  })
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

function syncHeaderToDetails() {
  form.details = form.details.map(detail => ({
    ...detail,
    sourceWarehouseId: form.sourceWarehouseId,
    targetWarehouseId: form.targetWarehouseId,
    targetAreaId: form.targetAreaId,
    targetRackId: form.targetRackId,
    targetLocationId: form.targetLocationId
  }))
}

function recalcTotalQuantity() {
  form.totalQuantity = form.details.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
}

function handleSourceWarehouseChange() {
  form.targetWarehouseId = form.sourceWarehouseId
  form.sourceAreaId = undefined
  form.sourceRackId = undefined
  form.sourceLocationId = undefined
  form.targetAreaId = undefined
  form.targetRackId = undefined
  form.targetLocationId = undefined
  form.details = []
  recalcTotalQuantity()
}

function handleSourceAreaChange() {
  form.sourceRackId = undefined
  form.sourceLocationId = undefined
  form.details = []
  recalcTotalQuantity()
}

function handleSourceRackChange() {
  form.sourceLocationId = undefined
  form.details = []
  recalcTotalQuantity()
}

function handleTargetAreaChange() {
  form.targetRackId = undefined
  form.targetLocationId = undefined
  syncHeaderToDetails()
}

function handleTargetRackChange() {
  form.targetLocationId = undefined
  syncHeaderToDetails()
}

function handleQuantityChange(row) {
  row.lineAmount = Number((Number(row.quantity || 0) * Number(row.unitPrice || 0)).toFixed(2))
  recalcTotalQuantity()
}

function handleDeleteDetail(index) {
  form.details.splice(index, 1)
  recalcTotalQuantity()
}

function showAddDetail() {
  if (!canSelectInventory.value) {
    proxy.$modal.msgWarning('请先选择源仓库、源库区和目标位置')
    return
  }
  inventorySelectRef.value?.setWarehouseIdAndAreaId(form.sourceWarehouseId, form.sourceAreaId, form.sourceRackId, form.sourceLocationId)
  inventorySelectVisible.value = true
}

function normalizeDetail(row) {
  const quantity = Number(row.remainQuantity || 0) > 0 ? 1 : 0
  return {
    id: row.id,
    internalMoveOrderId: form.id,
    skuId: row.skuId,
    quantity,
    equipmentCode: row.equipmentCode || row.item?.itemCode,
    specModel: row.specModel || row.itemSku?.specModel || row.item?.modelText,
    productMark: row.productMark,
    qualityGrade: row.qualityGrade,
    unitPrice: row.unitPrice,
    lineAmount: Number((quantity * Number(row.unitPrice || 0)).toFixed(2)),
    remark: row.remark,
    batchNo: row.batchNo,
    productionDate: row.productionDate,
    expirationDate: row.expirationDate,
    sourceWarehouseId: row.warehouseId,
    sourceAreaId: row.areaId,
    sourceRackId: row.rackId,
    sourceLocationId: row.locationId,
    targetWarehouseId: form.targetWarehouseId,
    targetAreaId: form.targetAreaId,
    targetRackId: form.targetRackId,
    targetLocationId: form.targetLocationId,
    inventoryDetailId: row.id,
    itemInstanceId: row.itemInstanceId,
    instanceCode: row.instanceCode,
    boxId: row.boxId,
    boxCode: row.boxCode,
    itemSku: row.itemSku,
    remainQuantity: row.remainQuantity
  }
}

function handleInventoryOk(rows) {
  const nextRows = rows
    .filter(item => !form.details.some(detail => detail.inventoryDetailId === item.id))
    .map(normalizeDetail)
  form.details = [...form.details, ...nextRows]
  recalcTotalQuantity()
  selectedInventory.value = form.details.map(item => ({ id: item.inventoryDetailId }))
  inventorySelectVisible.value = false
}

function buildPayload(status) {
  return {
    ...form,
    internalMoveStatus: status,
    details: form.details.map(item => ({
      id: item.id,
      internalMoveOrderId: form.id,
      skuId: item.skuId,
      quantity: item.quantity,
      equipmentCode: item.equipmentCode,
      specModel: item.specModel,
      productMark: item.productMark,
      qualityGrade: item.qualityGrade,
      unitPrice: item.unitPrice,
      lineAmount: item.lineAmount,
      remark: item.remark,
      batchNo: item.batchNo,
      productionDate: item.productionDate,
      expirationDate: item.expirationDate,
      sourceWarehouseId: item.sourceWarehouseId,
      sourceAreaId: item.sourceAreaId,
      sourceRackId: item.sourceRackId,
      sourceLocationId: item.sourceLocationId,
      targetWarehouseId: item.targetWarehouseId,
      targetAreaId: item.targetAreaId,
      targetRackId: item.targetRackId,
      targetLocationId: item.targetLocationId,
      inventoryDetailId: item.inventoryDetailId,
      itemInstanceId: item.itemInstanceId,
      boxId: item.boxId
    })),
    totalQuantity: form.details.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  }
}

function validateBeforeSubmit() {
  if (!form.details.length) {
    ElMessage.error('移库明细不能为空')
    return false
  }
  if (!form.targetWarehouseId || !form.targetAreaId) {
    ElMessage.error('请先选择目标位置')
    return false
  }
  const invalid = form.details.find(item => !item.quantity || Number(item.quantity) <= 0)
  if (invalid) {
    ElMessage.error('移库数量必须大于 0')
    return false
  }
  return true
}

async function submit(status) {
  const valid = await proxy.$refs.formRef.validate().catch(() => false)
  if (!valid || !validateBeforeSubmit()) {
    return
  }
  buttonLoading.value = true
  try {
    const payload = buildPayload(status)
    if (status === 1) {
      await moveInternalMoveOrder(payload)
      proxy.$modal.msgSuccess('执行成功')
    } else if (form.id) {
      await updateInternalMoveOrder(payload)
      proxy.$modal.msgSuccess('修改成功')
    } else {
      await addInternalMoveOrder(payload)
      proxy.$modal.msgSuccess('新增成功')
    }
    router.back()
  } finally {
    buttonLoading.value = false
  }
}

function save() {
  submit(0)
}

function doMove() {
  submit(1)
}

async function handleDeleteOrder() {
  if (!form.id) {
    router.back()
    return
  }
  await proxy.$modal.confirm('确认删除库内移库单【' + form.internalMoveOrderNo + '】吗？')
  await delInternalMoveOrder(form.id)
  proxy.$modal.msgSuccess('删除成功')
  router.back()
}

function cancel() {
  router.back()
}

async function loadDetail(id) {
  loading.value = true
  try {
    const res = await getInternalMoveOrder(id)
    const data = res.data || {}
    Object.assign(form, {
      ...initFormData,
      ...data,
      details: (data.details || []).map(item => ({
        ...item,
        remainQuantity: item.remainQuantity ?? item.quantity,
        lineAmount: item.lineAmount ?? Number((Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2))
      }))
    })
    selectedInventory.value = form.details.map(item => ({ id: item.inventoryDetailId }))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  resetForm()
  await Promise.all([
    wmsStore.getWarehouseList(),
    wmsStore.getAreaList(),
    loadPlaceMaps()
  ])
  if (route.query.id) {
    await loadDetail(route.query.id)
  }
})
</script>

<style scoped lang="scss">
.internal-move-edit {
  padding-bottom: 72px;
}

.mt16 {
  margin-top: 16px;
}

.mt4 {
  margin-top: 4px;
}

.form-tip,
.header-sub,
.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.form-tip {
  margin-bottom: 12px;
}

.card-header,
.toolbar-row,
.btn-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toolbar-row {
  margin-bottom: 12px;
}

.vertical-top-cell {
  vertical-align: top;
}

.footer-global {
  position: fixed;
  right: 0;
  bottom: 0;
  width: calc(100% - var(--sidebar-width, 210px));
  padding: 12px 20px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  z-index: 10;
}
</style>
