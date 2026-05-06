<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="移库单基本信息">
        <el-form label-width="108px" :model="form" ref="movementForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="移库单号" prop="movementOrderNo">
                <el-input class="w200" v-model="form.movementOrderNo" placeholder="移库单号"
                          :disabled="form.id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="源仓库" prop="sourceWarehouseId">
                <el-select v-model="form.sourceWarehouseId" placeholder="请选择源仓库" @change="handleChangeSourceWarehouse"
                           filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                             :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="源库区" prop="sourceAreaId">
                <el-select v-model="form.sourceAreaId" placeholder="请选择源库区" :disabled="!form.sourceWarehouseId" clearable
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
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="调拨依据" prop="dispatchBasis">
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
              <el-form-item label="物资保障号" prop="supportNo">
                <el-input v-model="form.supportNo" placeholder="请输入物资保障号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="调拨方式" prop="dispatchMode">
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
      <el-card header="商品明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8">
            <div>
              <el-tag v-if="form.movementType === 'special'" type="warning">专装调拨必须按单品或箱体流转，且数量必须为 1</el-tag>
              <el-tag v-else type="info">通装调拨按数量流转，专装场景可补录单品码或箱码</el-tag>
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
                           :disabled="!form.sourceWarehouseId || !form.targetWarehouseId">添加商品
                </el-button>
              </template>
            </el-popover>
          </div>
          <el-table :data="form.details" border empty-text="暂无商品明细">
            <el-table-column label="商品信息" prop="itemSku.itemName">
              <template #default="{ row }">
                <div>{{
                    row.itemSku.item.itemName + (row.itemSku.item.itemCode ? ('(' + row.itemSku.item.itemCode + ')') : '')
                  }}
                </div>
                <div v-if="row.itemSku.item.itemBrand">
                  品牌：{{ useWmsStore().itemBrandMap.get(row.itemSku.item.itemBrand).brandName }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="规格信息">
              <template #default="{ row }">
                <div>{{ row.itemSku.skuName}}</div>
                <div v-if="row.itemSku.barcode">条码：{{ row.itemSku.barcode }}</div>
              </template>
            </el-table-column>
            <el-table-column label="器材编码/规格型号" min-width="180">
              <template #default="{ row }">
                <div>{{ row.equipmentCode || row.itemSku.item.itemCode || '-' }}</div>
                <div class="table-tip">{{ row.specModel || row.itemSku.specModel || row.itemSku.item.modelText || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column label="源库区" width="200" prop="sourceAreaName" />
            <el-table-column label="目标库区" width="200">
              <template #default="{ row }">
                <el-select v-model="row.targetAreaId" placeholder="请选择目标库区" filterable :disabled="!!form.targetAreaId">
                  <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.targetWarehouseId)"
                             :key="item.id" :label="item.areaName" :value="item.id"/>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="产品标识" width="180">
              <template #default="{ row }">
                <el-input v-model="row.productMark" :placeholder="form.movementType === 'special' ? '专装请录入产品标识' : '可选录入产品标识'" />
              </template>
            </el-table-column>
            <el-table-column v-if="form.movementType === 'special'" label="单品码/箱码" min-width="240">
              <template #default="{ row }">
                <el-input v-model="row.instanceCode" placeholder="请输入单品码" @blur="handleSpecialCodeBlur(row, 'item')" />
                <el-input class="mt5" v-model="row.boxCode" placeholder="请输入箱码" @blur="handleSpecialCodeBlur(row, 'box')" />
              </template>
            </el-table-column>
            <el-table-column label="质量等级" width="160">
              <template #default="{ row }">
                <el-select v-model="row.qualityGrade" placeholder="请选择质量等级" clearable style="width: 100%">
                  <el-option v-for="item in wms_quality_grade" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="批号" prop="batchNo" />
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
                <el-input-number v-model="row.unitPrice" :precision="2" :min="0" :controls="false" @change="handleDetailChange(row)" />
              </template>
            </el-table-column>
            <el-table-column label="总价" prop="lineAmount" width="160">
              <template #default="{ row }">
                <el-input-number v-model="row.lineAmount" :precision="2" :controls="false" disabled />
              </template>
            </el-table-column>
            <el-table-column label="移库数量" prop="quantity" width="180">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  placeholder="移库数量"
                  :min="1"
                  :precision="0"
                  :max="scope.row.remainQuantity"
                  @change="handleChangeQuantity"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="备注" width="180">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="请输入备注" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="right" fixed="right">
              <template #default="scope">
                <el-button icon="Delete" type="danger" plain size="small"
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
        <div>
          <el-button @click="doMovement" type="primary" class="ml10">完成移库</el-button>
          <el-button @click="updateToInvalid" type="danger" v-if="form.id">作废</el-button>
        </div>
        <div>
          <el-button @click="save" type="primary">暂存</el-button>
          <el-button @click="cancel" class="mr10">取消</el-button>
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

const {proxy} = getCurrentInstance();
const {wms_movement_type, wms_dispatch_mode, wms_basis_type, wms_quality_grade} = proxy.useDict(
  "wms_movement_type",
  "wms_dispatch_mode",
  "wms_basis_type",
  "wms_quality_grade"
);

const loading = ref(false)
const initFormData = {
  id: undefined,
  movementOrderNo: undefined,
  movementType: 'common',
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
  targetWarehouseId: undefined,
  targetAreaId: undefined,
  totalQuantity: 0,
  details: [],
}
const inventorySelectRef = ref(null)
const selectedInventory = ref([])
const data = reactive({
  form: {...initFormData},
  rules: {
    movementOrderNo: [
      {required: true, message: "出库单号不能为空", trigger: "blur"}
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
  await proxy?.$modal.confirm('确认取消编辑移库单吗？');
  close()
}
const close = () => {
  const obj = {path: "/movementOrder"};
  proxy?.$tab.closeOpenPage(obj);
}
const inventorySelectShow = ref(false)

const calcLineAmount = (quantity, unitPrice) => {
  const qty = Number(quantity || 0)
  const price = Number(unitPrice || 0)
  return qty && price ? Number((qty * price).toFixed(2)) : 0
}

const syncMovementDetail = (detail) => {
  const unitPrice = detail.unitPrice ?? detail.itemSku?.defaultUnitPrice
  return {
    ...detail,
    equipmentCode: detail.equipmentCode ?? detail.itemSku?.item?.itemCode,
    specModel: detail.specModel ?? detail.itemSku?.specModel ?? detail.itemSku?.item?.modelText,
    productMark: detail.productMark,
    qualityGrade: detail.qualityGrade ?? detail.itemSku?.item?.defaultQualityGrade,
    itemInstanceId: detail.itemInstanceId,
    instanceCode: detail.instanceCode,
    boxId: detail.boxId,
    boxCode: detail.boxCode,
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
      if (data?.productMark && !row.productMark) {
        row.productMark = data.productMark
      }
      if (data?.qualityGrade && !row.qualityGrade) {
        row.qualityGrade = data.qualityGrade
      }
      row.quantity = 1
      handleChangeQuantity()
    } catch (e) {
      row.itemInstanceId = undefined
      proxy.$modal.msgError('单品码校验失败，请确认单品存在且可用于专装调拨')
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
      ElMessage.error('专装调拨必须录入单品码或箱码')
      return false
    }
    if (hasItem && hasBox) {
      ElMessage.error('专装调拨明细不能同时录入单品码和箱码')
      return false
    }
    if (Number(detail.quantity) !== 1) {
      ElMessage.error('专装调拨数量必须为 1')
      return false
    }
  }
  return true
}

// 选择商品 start
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
          batchNo: it.batchNo,
          productionDate: it.productionDate,
          expirationDate: it.expirationDate,
          sourceWarehouseId: form.value.sourceWarehouseId,
          sourceAreaId: form.value.sourceAreaId ?? it.areaId,
          inventoryDetailId: it.id,
          targetAreaId: form.value.targetAreaId,
          sourceAreaName: useWmsStore().areaMap.get(form.value.sourceAreaId ?? it.areaId)?.areaName,
          equipmentCode: it.equipmentCode ?? it.item?.itemCode,
          specModel: it.specModel ?? it.itemSku?.specModel,
          productMark: it.productMark,
          qualityGrade: it.qualityGrade ?? it.item?.defaultQualityGrade,
          unitPrice: it.unitPrice ?? it.itemSku?.defaultUnitPrice
        })
      )
    }
  })
}

const getPlaceAndSkuKey = (row) => {
  return row.warehouseId + '_' + row.areaId + '_' + row.skuId
}
// 选择商品 end

// 初始化receipt-order-form ref
const movementForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('确认暂存移库单吗？');
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
          productMark: it.productMark,
          qualityGrade: it.qualityGrade,
          unitPrice: it.unitPrice,
          lineAmount: it.lineAmount,
          remark: it.remark,
          batchNo: it.batchNo,
          productionDate: it.productionDate,
          expirationDate: it.expirationDate,
          inventoryDetailId: it.inventoryDetailId,
          itemInstanceId: it.itemInstanceId,
          boxId: it.boxId,
          sourceWarehouseId: form.value.sourceWarehouseId,
          sourceAreaId: it.sourceAreaId,
          targetWarehouseId: form.value.targetWarehouseId,
          targetAreaId: it.targetAreaId
        }
      })
    }

    const params = {
      id: form.value.id,
      movementOrderNo: form.value.movementOrderNo,
      movementType: form.value.movementType,
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
      targetWarehouseId: form.value.targetWarehouseId,
      targetAreaId: form.value.targetAreaId,
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
  await proxy?.$modal.confirm('确认作废移库单吗？');
  doSave(-1)
}

const doMovement = async () => {
  await proxy?.$modal.confirm('确认移库吗？');
  movementForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    if (!form.value.details?.length) {
      return ElMessage.error('请选择商品')
    }
    const invalidQuantityList = form.value.details.filter(it => !it.quantity)
    if (invalidQuantityList?.length) {
      return ElMessage.error('请选择移库数量')
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
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        inventoryDetailId: it.inventoryDetailId,
        itemInstanceId: it.itemInstanceId,
        boxId: it.boxId,
        sourceWarehouseId: form.value.sourceWarehouseId,
        sourceAreaId: it.sourceAreaId,
        targetWarehouseId: form.value.targetWarehouseId,
        targetAreaId: it.targetAreaId
      }
    })

    //('提交前校验',form.value)
    const params = {
      id: form.value.id,
      movementOrderNo: form.value.movementOrderNo,
      movementType: form.value.movementType,
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
      targetWarehouseId: form.value.targetWarehouseId,
      targetAreaId: form.value.targetAreaId,
      details: details
    }
    movement(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('移库成功')
        close()
      } else {
        ElMessage.error(res.msg)
      }
    })
  })
}

const route = useRoute();
onMounted(() => {
  const id = route.query && route.query.id;
  if (id) {
    loadDetail(id)
  } else {
    form.value.movementOrderNo = 'YK' + generateNo()
  }
})


// 获取移库单详情
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
  form.value.details.forEach(it => {
    it.targetWarehouseId = e
    it.targetAreaId = undefined
  })

}

const handleChangeTargetArea = (e) => {
  ('targetAreaId', e)
  ('form.value.targetAreaId', form.value.targetAreaId)
  form.value.details.forEach(it => it.targetAreaId = e)
}

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
    proxy.$modal.confirm('确认删除本条商品明细吗？如确认会立即执行！').then(function () {
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

.table-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}
</style>
