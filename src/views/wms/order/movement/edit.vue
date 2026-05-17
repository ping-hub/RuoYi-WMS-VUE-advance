<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" :class="{ 'is-view-mode': isViewMode }" style="margin-bottom: 60px" v-loading="loading">
      <el-alert v-if="isViewMode" class="mb10" type="info" :closable="false" title="当前为联查查看模式，已禁用编辑、作废和完成调拨操作。" />
      <el-card header="调拨单基本信息">
        <el-form label-width="108px" :model="form" ref="movementForm" :rules="rules" :disabled="isViewMode">
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="调拨单号" prop="movementOrderNo">
                <el-input class="w200" v-model="form.movementOrderNo" placeholder="调拨单号"
                          :disabled="form.id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="原仓库" prop="sourceWarehouseId">
                <el-select v-model="form.sourceWarehouseId" placeholder="请选择源仓库" @change="handleChangeSourceWarehouse"
                           filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                             :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="原库区" prop="sourceAreaId">
                <el-select v-model="form.sourceAreaId" placeholder="请选择原库区" :disabled="!form.sourceWarehouseId" clearable
                           filterable @change="handleChangeSourceArea" style="width: 100%!important;">
                  <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.sourceWarehouseId)"
                             :key="item.id" :label="item.areaName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="调拨类型" prop="movementType">
                <el-radio-group v-model="form.movementType">
                  <el-radio-button v-for="item in wms_movement_type" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="目标仓库" prop="targetWarehouseId">
                <el-select v-model="form.targetWarehouseId" placeholder="请选择目标仓库" @change="handleChangeTargetWarehouse"
                           filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                             :value="item.id"/>
                </el-select>
              </el-form-item>
              <el-form-item label="数量" prop="totalQuantity">
                <el-input-number v-model="form.totalQuantity" :controls="false" :precision="0"
                                 :disabled="true"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="目标库区" prop="targetAreaId">
                <el-select v-model="form.targetAreaId" placeholder="请选择目标库区" :disabled="!form.targetWarehouseId" clearable
                           filterable @change="handleChangeTargetArea" style="width: 100%!important;">
                  <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.targetWarehouseId)"
                             :key="item.id" :label="item.areaName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="form-tip">带 * 为必填项</div>
          <el-alert
            :closable="false"
            type="info"
            title="本页按调拨单处理，仅支持跨仓调拨和单位间调拨；库内位置变化不应在此页办理。"
          />
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item prop="movementScope">
                <template #label>
                  <FormLabelHelp label="调拨范围" purpose="说明本单属于跨仓调拨还是单位间调拨，用于单据头口径确认。" example="跨仓调拨、单位间调拨" />
                </template>
                <el-input v-model="form.movementScope" placeholder="请输入跨仓或单位间" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="dispatchBasis">
                <template #label>
                  <FormLabelHelp label="调拨依据" purpose="记录本次调拨所依据的文件或命令类型，便于纸单口径一致。" example="命令、计划、申请" />
                </template>
                <el-select v-model="form.dispatchBasis" placeholder="请选择调拨依据" clearable style="width: 100%">
                  <el-option v-for="item in wms_basis_type" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="调拨目的" prop="dispatchPurpose">
                <el-input v-model="form.dispatchPurpose" placeholder="请输入调拨目的"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="supportNo">
                <template #label>
                  <FormLabelHelp label="保障号" purpose="记录保障任务或保障批次编号，便于与纸单和外部任务单对照。" example="BZ-2026-015" />
                </template>
                <el-input v-model="form.supportNo" placeholder="请输入物资保障号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="dispatchMode">
                <template #label>
                  <FormLabelHelp label="调拨方式" purpose="表示本次调拨采用的组织或运输方式，便于表头信息完整。" example="通装、专装" />
                </template>
                <el-select v-model="form.dispatchMode" placeholder="请选择调拨方式" clearable style="width: 100%">
                  <el-option v-for="item in wms_dispatch_mode" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="发货单位" prop="fromUnit">
                <el-input v-model="form.fromUnit" placeholder="请输入发货单位"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="收货单位" prop="toUnit">
                <el-input v-model="form.toUnit" placeholder="请输入收货单位"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="发站" prop="fromStation">
                <el-input v-model="form.fromStation" placeholder="请输入发站"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="到站" prop="toStation">
                <el-input v-model="form.toStation" placeholder="请输入到站"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="发货地址" prop="fromAddress">
                <el-input v-model="form.fromAddress" placeholder="请输入发货地址"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="收货地址" prop="toAddress">
                <el-input v-model="form.toAddress" placeholder="请输入收货地址"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="通信地址" prop="contactAddress">
                <el-input v-model="form.contactAddress" placeholder="请输入通信地址"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="调拨日期" prop="dispatchDate">
                <el-date-picker v-model="form.dispatchDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item prop="targetRackId">
                <template #label>
                  <FormLabelHelp label="目标货架" purpose="指定调拨后所在货架，需先选目标仓库和目标库区。" example="A库区-01号架" />
                </template>
                <RackSelect v-model="form.targetRackId" :warehouse-id="form.targetWarehouseId" :area-id="form.targetAreaId" @update:model-value="handleHeaderTargetRackChange" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="targetLocationId">
                <template #label>
                  <FormLabelHelp label="目标货位" purpose="指定调拨后落位货位，需与目标货架保持一致。" example="A01-03-02" />
                </template>
                <LocationSelect
                  v-model="form.targetLocationId"
                  :warehouse-id="form.targetWarehouseId"
                  :area-id="form.targetAreaId"
                  :rack-id="form.targetRackId"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="有效日期" prop="effectiveDate">
                <el-date-picker v-model="form.effectiveDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="发出日期" prop="issueDate">
                <el-date-picker v-model="form.issueDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="发货经手人" prop="fromHandler">
                <el-input v-model="form.fromHandler" placeholder="请输入发货经手人"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="收货经手人" prop="toHandler">
                <el-input v-model="form.toHandler" placeholder="请输入收货经手人"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="form.remark"
                  placeholder="备注...100个字符以内"
                  rows="4"
                  maxlength="100"
                  type="textarea"
                  show-word-limit="show-word-limit"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card header="调拨明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8">
            <div>
              <el-tag v-if="form.movementType === 'special'" type="warning">专装调拨必须按物品码或箱码流转，且数量必须为 1</el-tag>
              <el-tag v-else type="info">通装调拨按数量流转，箱码仅作为附加追踪信息</el-tag>
            </div>
            <el-popover
              placement="left"
              title="提示"
              :width="200"
              trigger="hover"
              :disabled="form.sourceWarehouseId && form.targetWarehouseId"
              content="请先选择源仓库和目标仓库！"
            >
              <template #reference>
                <el-button type="primary" plain="plain" size="default" @click="showAddItem" icon="Plus"
                           :disabled="!form.sourceWarehouseId || !form.targetWarehouseId || isViewMode">添加器材
                </el-button>
              </template>
            </el-popover>
          </div>
            <el-table :data="form.details" border empty-text="暂无调拨明细">
            <el-table-column label="器材信息" prop="itemSku.itemName">
              <template #default="{ row }">
                <div>{{
                    row.itemSku.item.itemName + (row.itemSku.item.itemCode ? ('(' + row.itemSku.item.itemCode + ')') : '')
                  }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="源位置" min-width="180">
              <template #default="{ row }">
                <div>库区：{{ row.sourceAreaName || '-' }}</div>
                <div class="table-tip">货架：{{ row.sourceRackId || '-' }} / 货位：{{ row.sourceLocationId || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column label="目标位置" min-width="260">
              <template #default="{ row }">
                <div class="target-place-edit">
                  <el-select v-model="row.targetAreaId" placeholder="目标库区" filterable :disabled="isViewMode || !!form.targetAreaId" style="width: 110px">
                    <el-option
                      v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.targetWarehouseId)"
                      :key="item.id"
                      :label="item.areaName"
                      :value="item.id"
                    />
                  </el-select>
                  <RackSelect v-model="row.targetRackId" :warehouse-id="form.targetWarehouseId" :area-id="row.targetAreaId || form.targetAreaId" :disabled="isViewMode" />
                  <LocationSelect
                    v-model="row.targetLocationId"
                    :warehouse-id="form.targetWarehouseId"
                    :area-id="row.targetAreaId || form.targetAreaId"
                    :rack-id="row.targetRackId"
                    :disabled="isViewMode"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column v-if="form.movementType === 'special'" label="物品码/箱码" min-width="240">
              <template #default="{ row }">
                <el-input v-model="row.instanceCode" placeholder="请输入物品码" :disabled="isViewMode" @blur="handleSpecialCodeBlur(row, 'item')" />
                <el-input class="mt5" v-model="row.boxCode" placeholder="请输入箱码" :disabled="isViewMode" @blur="handleSpecialCodeBlur(row, 'box')" />
              </template>
            </el-table-column>
            <el-table-column label="生产日期" prop="productionDate">
              <template #default="{ row }">
                <div v-if="row.productionDate">{{ row.productionDate.substring(0, 10) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="过期日期" prop="expirationDate">
              <template #default="{ row }">
                <div v-if="row.expirationDate">{{ row.expirationDate.substring(0, 10) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="剩余库存" prop="remainQuantity" align="right" width="150">
              <template #default="{ row }">
                <el-statistic :value="Number(row.remainQuantity)" :precision="0"/>
              </template>
            </el-table-column>
            <el-table-column label="单价" prop="unitPrice" width="160">
              <template #default="{ row }">
                <el-input-number v-model="row.unitPrice" :precision="2" :min="0" :controls="false" :disabled="isViewMode" @change="handleDetailChange(row)" />
              </template>
            </el-table-column>
            <el-table-column label="总价" prop="lineAmount" width="160">
              <template #default="{ row }">
                <el-input-number v-model="row.lineAmount" :precision="2" :controls="false" disabled />
              </template>
            </el-table-column>
            <el-table-column label="调拨数量" prop="quantity" width="180">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  placeholder="调拨数量"
                  :min="1"
                  :precision="0"
                  :max="scope.row.remainQuantity"
                  :disabled="isViewMode"
                  @change="handleChangeQuantity"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="备注" width="180">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="请输入备注" :disabled="isViewMode" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="right" fixed="right">
              <template #default="scope">
                <el-button v-if="!isViewMode" icon="Delete" type="danger" plain size="small"
                           @click="handleDeleteDetail(scope.row, scope.$index)" link>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <InventoryDetailSelect
        ref="inventorySelectRef"
        :model-value="inventorySelectShow"
        @handleOkClick="handleOkClick"
        @handleCancelClick="inventorySelectShow = false"
        :size="'90%'"
        :select-warehouse-disable="false"
        :select-area-disable="!!form?.sourceAreaId"
        :warehouse-id="form.sourceWarehouseId"
        :area-id="form.sourceAreaId"
        :selected-inventory="selectedInventory"
      />
    </div>
    <div class="footer-global">
      <div class="btn-box">
        <div v-if="!isViewMode">
          <el-button @click="doMovement" type="primary" class="ml10">完成调拨</el-button>
          <el-button @click="updateToInvalid" type="danger" v-if="form.id">作废</el-button>
        </div>
        <div>
          <el-button v-if="!isViewMode" @click="save" type="primary">暂存</el-button>
          <el-button @click="cancel" class="mr10">{{ isViewMode ? '关闭' : '取消' }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="MovementOrderEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRef, toRefs, watch} from "vue";
import {addMovementOrder, getMovementOrder, updateMovementOrder, movement} from "@/api/wms/movementOrder";
import {delMovementOrderDetail} from "@/api/wms/movementOrderDetail";
import {getItemInstanceByCode} from "@/api/wms/itemInstance";
import {getBoxByCode} from "@/api/wms/box";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import {numSub, generateNo} from '@/utils/ruoyi'
import InventoryDetailSelect from "@/views/components/InventoryDetailSelect.vue";
import RackSelect from "@/views/components/RackSelect.vue";
import LocationSelect from "@/views/components/LocationSelect.vue";
import FormLabelHelp from '@/views/components/FormLabelHelp.vue'

const {proxy} = getCurrentInstance();
const route = useRoute();
const isViewMode = computed(() => route.query.mode === 'view');
const {wms_movement_type, wms_dispatch_mode, wms_basis_type} = proxy.useDict(
  "wms_movement_type",
  "wms_dispatch_mode",
  "wms_basis_type"
);

const loading = ref(false)
const initFormData = {
  id: undefined,
  movementOrderNo: undefined,
  movementType: 'common',
  movementScope: undefined,
  dispatchBasis: undefined,
  dispatchPurpose: undefined,
  supportNo: undefined,
  dispatchMode: undefined,
  fromUnit: undefined,
  toUnit: undefined,
  fromStation: undefined,
  toStation: undefined,
  fromAddress: undefined,
  toAddress: undefined,
  contactAddress: undefined,
  dispatchDate: undefined,
  effectiveDate: undefined,
  issueDate: undefined,
  fromHandler: undefined,
  toHandler: undefined,
  shipmentOrderStatus: 0,
  remark: undefined,
  sourceWarehouseId: undefined,
  sourceAreaId: undefined,
  sourceRackId: undefined,
  sourceLocationId: undefined,
  targetWarehouseId: undefined,
  targetAreaId: undefined,
  targetRackId: undefined,
  targetLocationId: undefined,
  totalQuantity: 0,
  details: [],
}
const inventorySelectRef = ref(null)
const selectedInventory = ref([])
const data = reactive({
  form: {...initFormData},
  rules: {
    movementOrderNo: [
      {required: true, message: "调拨单号不能为空", trigger: "blur"}
    ],
    sourceWarehouseId: [
      {required: true, message: "请选择源仓库", trigger: ['blur', 'change']}
    ],
    targetWarehouseId: [
      {required: true, message: "请选择目标仓库", trigger: ['blur', 'change']}
    ],
  }
});
const {form, rules} = toRefs(data);
const cancel = async () => {
  if (isViewMode.value) {
    close()
    return
  }
  await proxy?.$modal.confirm('确认取消编辑调拨单吗？');
  close()
}
const close = () => {
  if (route.query.returnFullPath) {
    proxy?.$tab.closeOpenPage(route.query.returnFullPath);
    return
  }
  proxy?.$tab.closePage();
}
const inventorySelectShow = ref(false)

const calcLineAmount = (quantity, unitPrice) => {
  const qty = Number(quantity || 0)
  const price = Number(unitPrice || 0)
  return qty && price ? Number((qty * price).toFixed(2)) : 0
}

const syncMovementDetail = (detail) => {
  const unitPrice = detail.unitPrice
  return {
    ...detail,
    equipmentCode: detail.equipmentCode ?? detail.itemSku?.item?.itemCode,
    specModel: detail.specModel ?? detail.itemSku?.specModel ?? detail.itemSku?.item?.modelText,
    itemInstanceId: detail.itemInstanceId,
    instanceCode: detail.instanceCode,
    boxId: detail.boxId,
    boxCode: detail.boxCode,
    sourceRackId: detail.sourceRackId,
    sourceLocationId: detail.sourceLocationId,
    targetRackId: detail.targetRackId,
    targetLocationId: detail.targetLocationId,
    unitPrice,
    lineAmount: detail.lineAmount ?? calcLineAmount(detail.quantity, unitPrice)
  }
}

const handleDetailChange = (row) => {
  row.lineAmount = calcLineAmount(row.quantity, row.unitPrice)
}

const handleSpecialCodeBlur = async (row, mode) => {
  if (form.value.movementType !== 'special') {
    return
  }
  if (mode === 'item') {
    if (!row.instanceCode) {
      row.itemInstanceId = undefined
      return
    }
    try {
      const res = await getItemInstanceByCode(row.instanceCode)
      const data = res.data
      row.itemInstanceId = data?.id
      row.boxId = undefined
      row.boxCode = undefined
      row.quantity = 1
      handleChangeQuantity()
    } catch (e) {
      row.itemInstanceId = undefined
      proxy.$modal.msgError('物品码校验失败，请确认物品存在且可用于专装调拨')
    }
    return
  }
  if (!row.boxCode) {
    row.boxId = undefined
    return
  }
  try {
    const res = await getBoxByCode(row.boxCode)
    const data = res.data
    row.boxId = data?.id
    row.itemInstanceId = undefined
    row.instanceCode = undefined
    row.quantity = 1
    handleChangeQuantity()
  } catch (e) {
    row.boxId = undefined
    proxy.$modal.msgError('箱码校验失败，请确认箱体存在且可用于专装调拨')
  }
}

const validateSpecialMovementDetails = (details) => {
  if (form.value.movementType !== 'special') {
    return true
  }
  for (const detail of details) {
    const hasItem = !!detail.itemInstanceId
    const hasBox = !!detail.boxId
    if (!hasItem && !hasBox) {
      ElMessage.error('专装调拨必须录入物品码或箱码')
      return false
    }
    if (hasItem && hasBox) {
      ElMessage.error('专装调拨明细不能同时录入物品码和箱码')
      return false
    }
    if (Number(detail.quantity) !== 1) {
      ElMessage.error('专装调拨数量必须为 1')
      return false
    }
  }
  return true
}

// 选择器材 start
const showAddItem = () => {
  inventorySelectRef.value.getList()
  inventorySelectShow.value = true
}
// 选择成功
const handleOkClick = (item) => {
  inventorySelectShow.value = false
  selectedInventory.value = [...item]
  item.forEach(it => {
    if (!form.value.details.find(detail => detail.inventoryDetailId === it.id)) {
      form.value.details.push(
        syncMovementDetail({
          itemSku: {
            ...it.itemSku,
            item: it.item
          },
          skuId: it.skuId,
          quantity: undefined,
          remainQuantity: it.remainQuantity,
          productionDate: it.productionDate,
          expirationDate: it.expirationDate,
          sourceWarehouseId: form.value.sourceWarehouseId,
          sourceAreaId: form.value.sourceAreaId ?? it.areaId,
          sourceRackId: it.rackId,
          sourceLocationId: it.locationId,
          inventoryDetailId: it.id,
          targetWarehouseId: form.value.targetWarehouseId,
          targetAreaId: form.value.targetAreaId,
          targetRackId: form.value.targetRackId,
          targetLocationId: form.value.targetLocationId,
          sourceAreaName: useWmsStore().areaMap.get(form.value.sourceAreaId ?? it.areaId)?.areaName,
          equipmentCode: it.equipmentCode ?? it.item?.itemCode,
          specModel: it.specModel ?? it.itemSku?.specModel,
          unitPrice: it.unitPrice
        })
      )
    }
  })
}

const getPlaceAndSkuKey = (row) => {
  return row.warehouseId + '_' + row.areaId + '_' + row.skuId
}
// 选择器材 end

// 初始化receipt-order-form ref
const movementForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('确认暂存调拨单吗？');
  doSave()
}

const doSave = (movementOrderStatus = 0) => {
  movementForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    let details = []
    if (form.value.details?.length) {
      const invalidQuantityList = form.value.details.filter(it => !it.quantity)
      if (invalidQuantityList?.length) {
        return ElMessage.error('请选择数量')
      }
      if (!validateSpecialMovementDetails(form.value.details)) {
        return
      }
      // 构建参数
      details = form.value.details.map(it => {
        return {
          id: it.id,
          movementOrderId: form.value.id,
          skuId: it.skuId,
          quantity: it.quantity,
          equipmentCode: it.equipmentCode,
          specModel: it.specModel,
          unitPrice: it.unitPrice,
          lineAmount: it.lineAmount,
          remark: it.remark,
          productionDate: it.productionDate,
          expirationDate: it.expirationDate,
          inventoryDetailId: it.inventoryDetailId,
          itemInstanceId: it.itemInstanceId,
          boxId: it.boxId,
          sourceWarehouseId: form.value.sourceWarehouseId,
          sourceAreaId: it.sourceAreaId,
          sourceRackId: it.sourceRackId,
          sourceLocationId: it.sourceLocationId,
          targetWarehouseId: form.value.targetWarehouseId,
          targetAreaId: it.targetAreaId,
          targetRackId: it.targetRackId,
          targetLocationId: it.targetLocationId
        }
      })
    }

    const params = {
      id: form.value.id,
      movementOrderNo: form.value.movementOrderNo,
      movementType: form.value.movementType,
      movementScope: form.value.movementScope,
      dispatchBasis: form.value.dispatchBasis,
      dispatchPurpose: form.value.dispatchPurpose,
      supportNo: form.value.supportNo,
      dispatchMode: form.value.dispatchMode,
      fromUnit: form.value.fromUnit,
      toUnit: form.value.toUnit,
      fromStation: form.value.fromStation,
      toStation: form.value.toStation,
      fromAddress: form.value.fromAddress,
      toAddress: form.value.toAddress,
      contactAddress: form.value.contactAddress,
      dispatchDate: form.value.dispatchDate,
      effectiveDate: form.value.effectiveDate,
      issueDate: form.value.issueDate,
      fromHandler: form.value.fromHandler,
      toHandler: form.value.toHandler,
      movementOrderStatus,
      remark: form.value.remark,
      totalQuantity: form.value.totalQuantity,
      sourceWarehouseId: form.value.sourceWarehouseId,
      sourceAreaId: form.value.sourceAreaId,
      sourceRackId: form.value.sourceRackId,
      sourceLocationId: form.value.sourceLocationId,
      targetWarehouseId: form.value.targetWarehouseId,
      targetAreaId: form.value.targetAreaId,
      targetRackId: form.value.targetRackId,
      targetLocationId: form.value.targetLocationId,
      details: details
    }
    if (params.id) {
      updateMovementOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      })
    } else {
      addMovementOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      })
    }
  })
}


const updateToInvalid = async () => {
  await proxy?.$modal.confirm('确认作废调拨单吗？');
  doSave(-1)
}

const doMovement = async () => {
  await proxy?.$modal.confirm('确认执行调拨吗？');
  movementForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    if (!form.value.details?.length) {
      return ElMessage.error('请选择调拨明细')
    }
    const invalidQuantityList = form.value.details.filter(it => !it.quantity)
    if (invalidQuantityList?.length) {
      return ElMessage.error('请选择调拨数量')
    }
    if (!validateSpecialMovementDetails(form.value.details)) {
      return
    }
    // 构建参数
    const details = form.value.details.map(it => {
      return {
        id: it.id,
        movementOrderId: form.value.id,
        skuId: it.skuId,
        quantity: it.quantity,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        inventoryDetailId: it.inventoryDetailId,
        itemInstanceId: it.itemInstanceId,
        boxId: it.boxId,
        sourceWarehouseId: form.value.sourceWarehouseId,
        sourceAreaId: it.sourceAreaId,
        sourceRackId: it.sourceRackId,
        sourceLocationId: it.sourceLocationId,
        targetWarehouseId: form.value.targetWarehouseId,
        targetAreaId: it.targetAreaId,
        targetRackId: it.targetRackId,
        targetLocationId: it.targetLocationId
      }
    })

    //('提交前校验',form.value)
    const params = {
      id: form.value.id,
      movementOrderNo: form.value.movementOrderNo,
      movementType: form.value.movementType,
      movementScope: form.value.movementScope,
      dispatchBasis: form.value.dispatchBasis,
      dispatchPurpose: form.value.dispatchPurpose,
      supportNo: form.value.supportNo,
      dispatchMode: form.value.dispatchMode,
      fromUnit: form.value.fromUnit,
      toUnit: form.value.toUnit,
      fromStation: form.value.fromStation,
      toStation: form.value.toStation,
      fromAddress: form.value.fromAddress,
      toAddress: form.value.toAddress,
      contactAddress: form.value.contactAddress,
      dispatchDate: form.value.dispatchDate,
      effectiveDate: form.value.effectiveDate,
      issueDate: form.value.issueDate,
      fromHandler: form.value.fromHandler,
      toHandler: form.value.toHandler,
      remark: form.value.remark,
      totalQuantity: form.value.totalQuantity,
      sourceWarehouseId: form.value.sourceWarehouseId,
      sourceAreaId: form.value.sourceAreaId,
      sourceRackId: form.value.sourceRackId,
      sourceLocationId: form.value.sourceLocationId,
      targetWarehouseId: form.value.targetWarehouseId,
      targetAreaId: form.value.targetAreaId,
      targetRackId: form.value.targetRackId,
      targetLocationId: form.value.targetLocationId,
      details: details
    }
    movement(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('调拨成功')
        close()
      } else {
        ElMessage.error(res.msg)
      }
    })
  })
}

onMounted(() => {
  const id = route.query && route.query.id;
  if (id) {
    loadDetail(id)
  } else {
    form.value.movementOrderNo = 'DB' + generateNo()
  }
})


// 获取调拨单详情
const loadDetail = (id) => {
  loading.value = true
  getMovementOrder(id).then((response) => {

    if (response.data.details?.length) {
      response.data.details.forEach(detail => {
        detail.sourceAreaName = useWmsStore().areaMap.get(detail.sourceAreaId)?.areaName
        detail.targetAreaName = useWmsStore().areaMap.get(detail.targetAreaId)?.areaName
      })
      selectedInventory.value = response.data.details.map(it => {
        return {
          id: it.inventoryDetailId,
          areaId: it.sourceAreaId
        }
      })
    }
    form.value = {...response.data}
    form.value.details = (response.data.details || []).map(detail => syncMovementDetail(detail))
    inventorySelectRef.value.setWarehouseIdAndAreaId(form.value.sourceWarehouseId, form.value.sourceAreaId)
    Promise.resolve();
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleChangeSourceWarehouse = (e) => {
  form.value.sourceAreaId = undefined
  form.value.details = []
  inventorySelectRef.value.setWarehouseIdAndAreaId(form.value.sourceWarehouseId, form.value.sourceAreaId)
}

const handleChangeSourceArea = (e) => {
  inventorySelectRef.value.setWarehouseIdAndAreaId(form.value.sourceWarehouseId, form.value.sourceAreaId)
  form.value.details = form.value.details.filter(it => it.sourceAreaId === e)
  selectedInventory.value = selectedInventory.value.filter(selected => selected.areaId === e)
}

const handleChangeTargetWarehouse = (e) => {
  form.value.targetAreaId = undefined
  form.value.targetRackId = undefined
  form.value.targetLocationId = undefined
  form.value.details.forEach(it => {
    it.targetWarehouseId = e
    it.targetAreaId = undefined
    it.targetRackId = undefined
    it.targetLocationId = undefined
  })

}

const handleChangeTargetArea = (e) => {
  form.value.targetRackId = undefined
  form.value.targetLocationId = undefined
  form.value.details.forEach(it => {
    it.targetAreaId = e
    it.targetRackId = undefined
    it.targetLocationId = undefined
  })
}

const handleHeaderTargetRackChange = () => {
  form.value.targetLocationId = undefined
  form.value.details.forEach(it => {
    it.targetRackId = form.value.targetRackId
    it.targetLocationId = undefined
  })
}

watch(() => form.value.targetLocationId, (value) => {
  form.value.details.forEach(it => {
    it.targetLocationId = value
  })
})

const handleChangeQuantity = () => {
  let sum = 0
  form.value.details.forEach(it => {
    if (it.quantity) {
      sum += Number(it.quantity)
    }
    it.lineAmount = calcLineAmount(it.quantity, it.unitPrice)
  })
  form.value.totalQuantity = sum
}

const handleDeleteDetail = (row, index) => {
  if (row.id) {
    proxy.$modal.confirm('确认删除本条器材条目吗？如确认会立即执行！').then(function () {
      return delMovementOrderDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      handleChangeQuantity()
      proxy.$modal.msgSuccess("删除成功");
    })
  } else {
    form.value.details.splice(index, 1)
    const indexOfSelected = selectedInventory.value.findIndex(it => it.id === row.inventoryDetailId)
    selectedInventory.value.splice(indexOfSelected, 1)
    handleChangeQuantity()
  }
}
const goSaasTip = () => {
  ElMessageBox.alert('一物一码/SN模式请去Saas版本体验！', '系统提示', {
    confirmButtonText: '确定'
  })
  return false
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.module";

.btn-box {
  width: calc(100% - #{$base-sidebar-width});
  display: flex;
  align-items: center;
  justify-content: space-between;
  float: right;
}

.el-statistic__content {
  font-size: 14px;
}

.form-tip,
.table-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.form-tip {
  margin: 0 0 12px;
}

</style>


