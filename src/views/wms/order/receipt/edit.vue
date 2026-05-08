<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="入库单基本信息">
        <el-form label-width="108px" :model="form" ref="receiptForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="入库单号" prop="receiptOrderNo">
                <el-input class="w200" v-model="form.receiptOrderNo" placeholder="入库单号" :disabled="form.id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="仓库" prop="warehouseId">
                <el-select v-model="form.warehouseId" placeholder="请选择仓库" @change="handleChangeWarehouse" filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="库区" prop="areaId">
                <el-popover
                  placement="left"
                  title="提示"
                  :width="200"
                  trigger="hover"
                  :disabled="form.warehouseId"
                  content="请先选择仓库！"
                >
                  <template #reference>
                    <el-select v-model="form.areaId" placeholder="请选择库区" :disabled="!form.warehouseId" clearable filterable @change="handleChangeArea" style="width: 100%!important;">
                      <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.warehouseId)" :key="item.id" :label="item.areaName" :value="item.id"/>
                    </el-select>
                  </template>
                </el-popover>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="入库类型" prop="receiptOrderType">
                <el-radio-group v-model="form.receiptOrderType">
                  <el-radio-button
                    v-for="item in wms_receipt_type"
                    :key="item.value"
                    :label="item.value"
                    >{{ item.label }}</el-radio-button
                  >
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="供应商" prop="merchantId">
                <el-select v-model="form.merchantId" placeholder="请选择供应商" clearable filterable>
                  <el-option v-for="item in useWmsStore().merchantList" :key="item.id" :label="item.merchantName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="订单号" prop="orderNo">
                <el-input v-model="form.orderNo" placeholder="请输入订单号"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="调拨根据" prop="basisNo">
                <el-input v-model="form.basisNo" placeholder="请输入调拨根据"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="调拨方式" prop="dispatchMode">
                <el-select v-model="form.dispatchMode" placeholder="请选择调拨方式" clearable style="width: 100%">
                  <el-option v-for="item in wms_dispatch_mode" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="通知机关" prop="noticeOrg">
                <el-input v-model="form.noticeOrg" placeholder="请输入通知机关"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="收物单位" prop="receiveUnit">
                <el-input v-model="form.receiveUnit" placeholder="请输入收物单位"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="采购日期" prop="purchaseDate">
                <el-date-picker v-model="form.purchaseDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="入库日期" prop="receiptDate">
                <el-date-picker v-model="form.receiptDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="采购配发人" prop="purchaserName">
                <el-input v-model="form.purchaserName" placeholder="请输入采购配发人"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="验收人" prop="acceptorName">
                <el-input v-model="form.acceptorName" placeholder="请输入验收人"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="保管员" prop="keeperName">
                <el-input v-model="form.keeperName" placeholder="请输入保管员"></el-input>
              </el-form-item>
            </el-col>
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
            <el-col :span="6">
              <div style="display: flex;align-items: start">
                <el-form-item label="金额" prop="payableAmount">
                  <el-input-number v-model="form.payableAmount" :precision="2" :min="0"></el-input-number>
                </el-form-item>
                <el-button link type="primary" @click="handleAutoCalc" class="ml20" style="line-height: 32px">自动计算</el-button>
              </div>
            </el-col>
            <el-col :span="6">
              <el-form-item label="数量" prop="totalQuantity">
                <el-input-number v-model="form.totalQuantity" :controls="false" :precision="0" :disabled="true"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card header="入库明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8">
            <div class="instance-tip">
              支持生成器材明细、展示推荐货位，并保留手工选位与装箱交互占位。
            </div>
            <el-popover
              placement="left"
              title="提示"
              :width="200"
              trigger="hover"
              :disabled="form.warehouseId"
              content="请先选择仓库！"
            >
              <template #reference>
                <el-button type="primary" plain="plain" size="default" @click="showAddItem" icon="Plus" :disabled="!form.warehouseId">添加器材</el-button>
              </template>
            </el-popover>
          </div>
          <el-table :data="form.details" border empty-text="暂无入库明细">
            <el-table-column label="器材信息" prop="itemSku.itemName">
              <template #default="{ row }">
                <div>{{ row.itemSku.item.itemName + (row.itemSku.item.itemCode ? ('(' + row.itemSku.item.itemCode + ')') : '') }}</div>
                <div v-if="row.itemSku.item.itemBrand">品牌：{{ useWmsStore().itemBrandMap.get(row.itemSku.item.itemBrand).brandName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="器材规格">
              <template #default="{ row }">
                <div>{{ row.itemSku.skuName }}</div>
                <div v-if="row.itemSku.barcode">条码：{{row.itemSku.barcode}}</div>
              </template>
            </el-table-column>
            <el-table-column label="器材编码/规格型号" min-width="180">
              <template #default="{ row }">
                <div>{{ row.equipmentCode || row.itemSku.item.itemCode || '-' }}</div>
                <div class="sub-text">{{ row.specModel || row.itemSku.specModel || row.itemSku.item.modelText || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column label="明细模式" width="120">
              <template #default="{ row }">
                <dict-tag :options="wms_tracking_mode" :value="row.itemSku.item.defaultTrackingMode || row.itemSku.item.trackingMode" />
              </template>
            </el-table-column>
            <el-table-column label="产品标识" width="180">
              <template #default="{ row }">
                <el-input v-model="row.productMark" placeholder="请输入产品标识" />
              </template>
            </el-table-column>
            <el-table-column label="质量等级" width="160">
              <template #default="{ row }">
                <el-select v-model="row.qualityGrade" placeholder="请选择质量等级" clearable style="width: 100%">
                  <el-option v-for="item in wms_quality_grade" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="推荐货位" min-width="220">
              <template #default="{ row }">
                <div>{{ getRecommendLocationText(row) }}</div>
                <div class="sub-text">{{ getRecommendLocationRemark(row) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="手工选位" min-width="320">
              <template #default="{ row }">
                <div class="location-editor">
                  <el-select
                    v-model="row.areaId"
                    placeholder="库区"
                    :disabled="!form.warehouseId || !!form.areaId"
                    filterable
                    style="width: 110px"
                    @change="handleRowAreaChange(row)"
                  >
                    <el-option
                      v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.warehouseId)"
                      :key="item.id"
                      :label="item.areaName"
                      :value="item.id"
                    />
                  </el-select>
                  <RackSelect v-model="row.rackId" :warehouse-id="form.warehouseId" :area-id="row.areaId || form.areaId" placeholder="货架" />
                  <LocationSelect
                    v-model="row.locationId"
                    :warehouse-id="form.warehouseId"
                    :area-id="row.areaId || form.areaId"
                    :rack-id="row.rackId"
                    placeholder="货位"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="quantity" width="180">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  placeholder="数量"
                  :min="1"
                  :precision="0"
                  @change="handleChangeQuantity"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="生成器材明细" width="140">
              <template #default="{ row }">
                <el-switch
                  v-model="row.generateItemInstance"
                  :active-value="1"
                  :inactive-value="0"
                  inline-prompt
                  active-text="是"
                  inactive-text="否"
                  :disabled="(row.itemSku.item.defaultTrackingMode || row.itemSku.item.trackingMode) === 'instance'"
                />
              </template>
            </el-table-column>
            <el-table-column label="是否装箱" width="120">
              <template #default="{ row }">
                <el-switch
                  v-model="row.needBox"
                  :active-value="1"
                  :inactive-value="0"
                  inline-prompt
                  active-text="是"
                  inactive-text="否"
                  :disabled="row.itemSku?.item?.allowBox !== 1"
                />
              </template>
            </el-table-column>
            <el-table-column label="已生成数" width="100" align="right">
              <template #default="{ row }">
                {{ row.generatedInstanceQuantity || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="单价" prop="unitPrice" width="160">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.unitPrice"
                  placeholder="单价"
                  :precision="2"
                  :min="0"
                  :max="2147483647"
                  @change="handleDetailChange(scope.row)"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="总价" prop="lineAmount" width="160">
              <template #default="{ row }">
                <el-input-number v-model="row.lineAmount" :precision="2" :min="0" :controls="false" disabled></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="批号" prop="batchNo" width="150">
              <template #default="scope">
                <el-input v-model="scope.row.batchNo"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="生产日期/过期日期" width="250">
              <template #default="scope">
                <div class="flex-center">
                  <span>生产日期：</span>
                  <el-date-picker
                    v-model="scope.row.productionDate"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 150px!important;"
                  />
                </div>
                <div class="flex-center mt5">
                  <span>过期日期：</span>
                  <el-date-picker
                    v-model="scope.row.expirationDate"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 150px!important;"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="备注" width="180">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="请输入备注" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="right" fixed="right">
              <template #default="scope">
                <el-button icon="Delete" type="danger" plain size="small" @click="handleDeleteDetail(scope.row, scope.$index)" link>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <SkuSelect
        ref="sku-select"
        :model-value="skuSelectShow"
        @handleOkClick="handleOkClick"
        @handleCancelClick="skuSelectShow = false"
        :size="'80%'"
      />
    </div>
    <div class="footer-global">
      <div class="btn-box">
        <div>
          <el-button @click="doWarehousing" type="primary" class="ml10">完成入库</el-button>
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

<script setup name="ReceiptOrderEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRef, toRefs, watch} from "vue";
import {addReceiptOrder, getReceiptOrder, updateReceiptOrder, warehousing} from "@/api/wms/receiptOrder";
import {ElMessage, ElMessageBox} from "element-plus";
import SkuSelect from "../../../components/SkuSelect.vue";
import RackSelect from "@/views/components/RackSelect.vue";
import LocationSelect from "@/views/components/LocationSelect.vue";
import {useRoute} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import { numSub, generateNo } from '@/utils/ruoyi'
import { delReceiptOrderDetail } from '@/api/wms/receiptOrderDetail'
import { listReceiptTargets } from '@/api/wms/storageLayout'

const {proxy} = getCurrentInstance();
const { wms_receipt_type, wms_tracking_mode, wms_quality_grade, wms_dispatch_mode } = proxy.useDict(
  "wms_receipt_type",
  "wms_tracking_mode",
  "wms_quality_grade",
  "wms_dispatch_mode"
);
const loading = ref(false)
const initFormData = {
  id: undefined,
  receiptOrderNo: undefined,
  receiptOrderType: "2",
  merchantId: undefined,
  orderNo: undefined,
  basisNo: undefined,
  dispatchMode: undefined,
  noticeOrg: undefined,
  receiveUnit: undefined,
  purchaseDate: undefined,
  receiptDate: undefined,
  purchaserName: undefined,
  acceptorName: undefined,
  keeperName: undefined,
  payableAmount: undefined,
  receiptOrderStatus: 0,
  remark: undefined,
  warehouseId: undefined,
  areaId: undefined,
  totalQuantity: 0,
  details: [],
}
const data = reactive({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    receiptOrderNo: undefined,
    receiptOrderType: undefined,
    orderNo: undefined,
    payableAmount: undefined,
    receiptOrderStatus: undefined,
  },
  rules: {
    id: [
      {required: true, message: "不能为空", trigger: "blur"}
    ],
    receiptOrderNo: [
      {required: true, message: "入库单号不能为空", trigger: "blur"}
    ],
    receiptOrderType: [
      {required: true, message: "入库类型不能为空", trigger: "change"}
    ],
    receiptOrderStatus: [
      {required: true, message: "入库状态不能为空", trigger: "change"}
    ],
    warehouseId: [
      {required: true, message: "请选择仓库", trigger: ['blur', 'change']}
    ],
  }
});
const { form, rules} = toRefs(data);

const cancel = async () => {
  await proxy?.$modal.confirm('确认取消编辑入库单吗？');
  close()
}
const close = () => {
  const obj = {path: "/receiptOrder"};
  proxy?.$tab.closeOpenPage(obj);
}
const skuSelectShow = ref(false)

// 选择器材 start
const showAddItem = () => {
  skuSelectShow.value = true
}

const calcLineAmount = (quantity, unitPrice) => {
  const qty = Number(quantity || 0)
  const price = Number(unitPrice || 0)
  return qty && price ? Number((qty * price).toFixed(2)) : 0
}

const syncReceiptDetail = (detail) => {
  const unitPrice = detail.unitPrice ?? detail.itemSku?.defaultUnitPrice
  const lineAmount = detail.lineAmount ?? detail.amount ?? calcLineAmount(detail.quantity, unitPrice)
  return {
    ...detail,
    equipmentCode: detail.equipmentCode ?? detail.itemSku?.item?.itemCode,
    specModel: detail.specModel ?? detail.itemSku?.specModel ?? detail.itemSku?.item?.modelText,
    productMark: detail.productMark,
    qualityGrade: detail.qualityGrade ?? detail.itemSku?.item?.defaultQualityGrade,
    rackId: detail.rackId,
    locationId: detail.locationId,
    needBox: detail.needBox ?? 0,
    recommendTargets: detail.recommendTargets ?? [],
    unitPrice,
    lineAmount,
    amount: lineAmount
  }
}

const buildRecommendQuery = (detail) => ({
  warehouseId: form.value.warehouseId,
  areaId: detail.areaId || form.value.areaId,
  rackId: detail.rackId,
  occupiedFlag: 0
})

const loadRecommendTargets = async (detail) => {
  if (!form.value.warehouseId) {
    detail.recommendTargets = []
    return
  }
  try {
    const res = await listReceiptTargets(buildRecommendQuery(detail))
    detail.recommendTargets = (res.data || []).slice(0, 5)
  } catch (e) {
    detail.recommendTargets = []
  }
}

const getRecommendLocationText = (detail) => {
  if (detail.locationId) {
    return '已手工指定货位'
  }
  const firstTarget = detail.recommendTargets?.[0]
  if (firstTarget) {
    return `${firstTarget.areaName || '-'} / ${firstTarget.rackName || firstTarget.rackCode || '-'} / ${firstTarget.locationName || firstTarget.locationCode || '-'}`
  }
  return '暂无推荐货位'
}

const getRecommendLocationRemark = (detail) => {
  if (detail.locationId) {
    return '当前已指定到具体货位，入库时以手工选位为准'
  }
  if (detail.recommendTargets?.length) {
    return `已加载 ${detail.recommendTargets.length} 个候选货位，可继续手工修正`
  }
  if (detail.itemSku?.item?.allowBox === 1 && detail.needBox === 1) {
    return '当前为装箱占位，后续联调箱体推荐逻辑'
  }
  return '当前支持按库区范围人工修正货架与货位'
}

const handleRowAreaChange = async (row) => {
  row.rackId = undefined
  row.locationId = undefined
  await loadRecommendTargets(row)
}

const recalculateOrderSummary = () => {
  let quantitySum = 0
  let amountSum = 0
  form.value.details.forEach(it => {
    if (it.quantity) {
      quantitySum += Number(it.quantity)
    }
    amountSum += Number(it.lineAmount || 0)
  })
  form.value.totalQuantity = quantitySum
  form.value.payableAmount = amountSum ? Number(amountSum.toFixed(2)) : 0
}

const handleDetailChange = (row) => {
  row.lineAmount = calcLineAmount(row.quantity, row.unitPrice)
  row.amount = row.lineAmount
  recalculateOrderSummary()
}
// 选择成功
const handleOkClick = (item) => {
  skuSelectShow.value = false
  const newDetails = item.map((it) => syncReceiptDetail({
      itemSku: {...it},
      quantity: it.quantity,
      batchNo: undefined,
      productionDate: undefined,
      expirationDate: undefined,
      warehouseId: form.value.warehouseId,
      areaId: form.value.areaId,
      rackId: undefined,
      locationId: undefined,
      needBox: 0,
      generateItemInstance: (it.item?.defaultTrackingMode || it.item?.trackingMode) === 'instance' ? 1 : 0,
      generatedInstanceQuantity: 0
    }))
  item.forEach((_, index) => {
    form.value.details.push(newDetails[index])
  })
  Promise.all(newDetails.map(detail => loadRecommendTargets(detail)))
  recalculateOrderSummary()
}
// 选择器材 end

// 初始化receipt-order-form ref
const receiptForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('确认暂存入库单吗？');
  doSave()
}

const doSave = async (receiptOrderStatus = 0) => {
  //验证receiptForm表单
  receiptForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    if (form.value.details?.length) {
      const invalidAreaList = form.value.details.filter(it => !it.areaId )
      if (invalidAreaList?.length) {
        return ElMessage.error('请选择库区')
      }
      const invalidQuantityList = form.value.details.filter(it => !it.quantity)
      if (invalidQuantityList?.length) {
        return ElMessage.error('请选择数量')
      }
    }
    // 构建参数
    const details = form.value.details.map(it => {
      return {
        id: it.id,
        receiptOrderId: form.value.id,
        skuId: it.itemSku.id,
        amount: it.lineAmount,
        quantity: it.quantity,
        equipmentCode: it.equipmentCode,
        specModel: it.specModel,
        productMark: it.productMark,
        qualityGrade: it.qualityGrade,
        unitPrice: it.unitPrice,
        lineAmount: it.lineAmount,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        warehouseId: form.value.warehouseId,
        areaId: it.areaId,
        rackId: it.rackId,
        locationId: it.locationId,
        generateItemInstance: it.generateItemInstance,
        generatedInstanceQuantity: it.generatedInstanceQuantity,
        remark: it.remark
      }
    })

    const params = {
      id: form.value.id,
      receiptOrderNo: form.value.receiptOrderNo,
      receiptOrderStatus,
      receiptOrderType: form.value.receiptOrderType,
      merchantId: form.value.merchantId,
      orderNo: form.value.orderNo,
      basisNo: form.value.basisNo,
      dispatchMode: form.value.dispatchMode,
      noticeOrg: form.value.noticeOrg,
      receiveUnit: form.value.receiveUnit,
      purchaseDate: form.value.purchaseDate,
      receiptDate: form.value.receiptDate,
      purchaserName: form.value.purchaserName,
      acceptorName: form.value.acceptorName,
      keeperName: form.value.keeperName,
      remark: form.value.remark,
      payableAmount: form.value.payableAmount,
      totalQuantity: form.value.totalQuantity,
      warehouseId: form.value.warehouseId,
      areaId: form.value.areaId,
      details: details
    }
    if (params.id) {
      updateReceiptOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      })
    } else {
      addReceiptOrder(params).then((res) => {
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
  await proxy?.$modal.confirm('确认作废入库单吗？');
  doSave(-1)
}

const doWarehousing = async () => {
  await proxy?.$modal.confirm('确认入库吗？');
  receiptForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    if (!form.value.details?.length) {
      return ElMessage.error('请选择器材')
    }
    const invalidAreaList = form.value.details.filter(it => !it.areaId )
    if (invalidAreaList?.length) {
      return ElMessage.error('请选择库区')
    }
    const invalidQuantityList = form.value.details.filter(it => !it.quantity)
    if (invalidQuantityList?.length) {
      return ElMessage.error('请选择数量')
    }
    // 构建参数
    const details = form.value.details.map(it => {
      return {
        id: it.id,
        receiptOrderId: form.value.id,
        skuId: it.itemSku.id,
        amount: it.lineAmount,
        quantity: it.quantity,
        equipmentCode: it.equipmentCode,
        specModel: it.specModel,
        productMark: it.productMark,
        qualityGrade: it.qualityGrade,
        unitPrice: it.unitPrice,
        lineAmount: it.lineAmount,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        warehouseId: form.value.warehouseId,
        areaId: it.areaId,
        rackId: it.rackId,
        locationId: it.locationId,
        generateItemInstance: it.generateItemInstance,
        generatedInstanceQuantity: it.generatedInstanceQuantity,
        remark: it.remark
      }
    })

    //('提交前校验',form.value)
    const params = {
      id: form.value.id,
      receiptOrderNo: form.value.receiptOrderNo,
      receiptOrderStatus: form.value.receiptOrderStatus,
      receiptOrderType: form.value.receiptOrderType,
      merchantId: form.value.merchantId,
      orderNo: form.value.orderNo,
      basisNo: form.value.basisNo,
      dispatchMode: form.value.dispatchMode,
      noticeOrg: form.value.noticeOrg,
      receiveUnit: form.value.receiveUnit,
      purchaseDate: form.value.purchaseDate,
      receiptDate: form.value.receiptDate,
      purchaserName: form.value.purchaserName,
      acceptorName: form.value.acceptorName,
      keeperName: form.value.keeperName,
      remark: form.value.remark,
      payableAmount: form.value.payableAmount,
      totalQuantity: form.value.totalQuantity,
      warehouseId: form.value.warehouseId,
      areaId: form.value.areaId,
      details: details
    }
    warehousing(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('入库成功')
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
    form.value.receiptOrderNo = 'RK' + generateNo()
  }
})


// 获取入库单详情
const loadDetail = (id) => {
  loading.value = true
  getReceiptOrder(id).then((response) => {
    form.value = {
      ...response.data,
      details: (response.data.details || []).map(it => ({
        ...syncReceiptDetail(it),
        generateItemInstance: it.generateItemInstance ?? ((it.itemSku?.item?.defaultTrackingMode || it.itemSku?.item?.trackingMode) === 'instance' ? 1 : 0),
        needBox: it.needBox ?? 0,
        generatedInstanceQuantity: it.generatedInstanceQuantity ?? 0
      }))
    }
    Promise.all(form.value.details.map(detail => loadRecommendTargets(detail)))
    recalculateOrderSummary()
    Promise.resolve();
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleChangeWarehouse = (e) => {
  form.value.areaId = undefined
  form.value.details.forEach(it => {
    it.areaId = undefined
    it.rackId = undefined
    it.locationId = undefined
    it.recommendTargets = []
  })
}

const handleChangeArea = (e) => {
  form.value.details.forEach(it => {
    it.areaId = e
    it.rackId = undefined
    it.locationId = undefined
  })
  Promise.all(form.value.details.map(detail => loadRecommendTargets(detail)))
}

const handleChangeQuantity = () => {
  form.value.details.forEach(it => {
    it.lineAmount = calcLineAmount(it.quantity, it.unitPrice)
    it.amount = it.lineAmount
  })
  recalculateOrderSummary()
}

const handleAutoCalc = () => {
  let sum = undefined
  form.value.details.forEach(it => {
    if (it.lineAmount >= 0) {
      if (!sum) {
        sum = 0
      }
      sum = numSub(sum, -Number(it.lineAmount))
    }
  })
  form.value.payableAmount = sum ?? 0
}

const handleDeleteDetail = (row, index) => {
  if (row.id) {
    proxy.$modal.confirm('确认删除本条器材明细吗？如确认会立即执行！').then(function () {
      return delReceiptOrderDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      recalculateOrderSummary()
      proxy.$modal.msgSuccess("删除成功");
    });
  } else {
    form.value.details.splice(index, 1)
    recalculateOrderSummary()
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

.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
