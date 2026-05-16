<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" :class="{ 'is-view-mode': isViewMode }" style="margin-bottom: 60px" v-loading="loading">
      <el-alert v-if="isViewMode" class="mb10" type="info" :closable="false" title="当前为联查查看模式，已禁用编辑、作废和完成入库操作。" />
      <el-card header="入库单基本信息">
        <el-form label-width="108px" :model="form" ref="receiptForm" :rules="rules" :disabled="isViewMode">
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
                  >{{ item.label }}</el-radio-button>
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
            <el-col :span="6">
              <div style="display: flex;align-items: start">
                <el-form-item label="金额" prop="payableAmount">
                  <el-input-number v-model="form.payableAmount" :precision="2" :min="0"></el-input-number>
                </el-form-item>
                <el-button v-if="!isViewMode" link type="primary" @click="handleAutoCalc" class="ml20" style="line-height: 32px">自动计算</el-button>
              </div>
            </el-col>
            <el-col :span="6">
              <el-form-item label="数量" prop="totalQuantity">
                <el-input-number v-model="form.totalQuantity" :controls="false" :precision="0" :disabled="true"></el-input-number>
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
          </el-row>
        </el-form>
      </el-card>
      <el-card header="入库明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8 receipt-toolbar">
            <div>
              <div class="instance-tip">
                入库按单品实例执行。可按“分类 -> 器材 -> 实例”选择未入库器材，并在明细行填写箱码和目标货位。
              </div>
            </div>
            <div class="receipt-toolbar-actions">
              <el-popover
                placement="left"
                title="提示"
                :width="200"
                trigger="hover"
                :disabled="form.warehouseId"
                content="请先选择仓库！"
              >
                <template #reference>
                  <el-button type="primary" plain="plain" size="default" @click="showAddItem" icon="Plus" :disabled="!form.warehouseId || isViewMode">选择器材实例</el-button>
                </template>
              </el-popover>
            </div>
          </div>
          <el-table
            :data="form.details"
            border
            empty-text="暂无入库明细"
          >
            <el-table-column label="器材信息" prop="itemSku.itemName" min-width="100">
              <template #default="{ row }">
                <div>{{ row.itemSku?.item?.itemName || row.itemName || '-' }}</div>
                <div class="sub-text">规格：{{ row.itemSku?.skuName || row.skuName || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column label="器材实例编码" min-width="150"> 
              <template #default="{ row }">
                <span>{{ row.instanceCode || row.receiptItemInstances?.[0]?.instanceCode || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="产品标识" width="100">
              <template #default="{ row }">
                <span>{{ row.productMark || row.receiptItemInstances?.[0]?.productMark || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="货架/货位" min-width="220">
              <template #default="{ row }">
                <div class="location-editor">
                  <RackSelect v-model="row.rackId" :warehouse-id="form.warehouseId" :area-id="form.areaId" placeholder="货架" :disabled="isViewMode" />
                  <LocationSelect
                    v-model="row.locationId"
                    :warehouse-id="form.warehouseId"
                    :area-id="form.areaId"
                    :rack-id="row.rackId"
                    placeholder="货位"
                    :disabled="isViewMode"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="箱码" min-width="180">
              <template #default="{ row }">
                <el-input
                  v-model="row.boxCode"
                  :disabled="isViewMode"
                />
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
                  :disabled="isViewMode"
                  @change="handleDetailChange(scope.row)"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="总价" prop="lineAmount" width="160">
              <template #default="{ row }">
                <el-input-number v-model="row.lineAmount" :precision="2" :min="0" :controls="false" disabled></el-input-number>
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
                    :disabled="isViewMode"
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
                    :disabled="isViewMode"
                    style="width: 150px!important;"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="备注" width="180">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="请输入备注" :disabled="isViewMode" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="right" fixed="right">
              <template #default="scope">
                <el-button v-if="!isViewMode" type="primary" link size="small" @click.stop="setActiveScanDetail(scope.row)">设为扫码目标</el-button>
                <el-button v-if="!isViewMode" icon="Delete" type="danger" plain size="small" @click.stop="handleDeleteDetail(scope.row, scope.$index)" link>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <el-dialog v-model="itemInstanceSelectDialog.visible" title="选择器材实例" width="1200px" append-to-body>
        <el-alert
          class="mb10"
          type="info"
          :closable="false"
          title="请选择尚未入库的器材实例。完成入库时会把实例绑定到当前仓库、库区、货架、货位和箱体。"
        />
        <el-form :inline="true" :model="itemInstanceSelectDialog.query" label-width="88px">
          <el-form-item label="器材分类">
            <el-tree-select
              v-model="itemInstanceSelectDialog.query.itemCategory"
              :data="useWmsStore().itemCategoryTreeList"
              :props="{ value: 'id', label: 'label', children: 'children' }"
              value-key="id"
              check-strictly
              clearable
              filterable
              placeholder="请选择器材分类"
              style="width: 220px"
              @change="handleReceiptItemCategoryChange"
            />
          </el-form-item>
          <el-form-item label="器材名称">
            <el-select
              v-model="itemInstanceSelectDialog.query.itemId"
              placeholder="请选择器材"
              clearable
              filterable
              style="width: 260px"
              @change="getReceiptItemInstanceList"
            >
              <el-option
                v-for="item in receiptItemOptions"
                :key="item.id"
                :label="item.itemName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="实例编码">
            <el-input v-model="itemInstanceSelectDialog.query.instanceCode" placeholder="请输入器材实例编码" clearable @keyup.enter="getReceiptItemInstanceList" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getReceiptItemInstanceList">查询</el-button>
          </el-form-item>
        </el-form>
        <el-table
          v-loading="itemInstanceSelectDialog.loading"
          :data="itemInstanceSelectDialog.list"
          @selection-change="handleReceiptItemInstanceSelectionChange"
          border
          row-key="id"
          empty-text="请选择器材后查询实例"
        >
          <el-table-column type="selection" width="55" :selectable="isReceiptItemInstanceSelectable" />
          <el-table-column label="器材实例编码" prop="instanceCode" min-width="180" />
          <el-table-column label="器材" prop="itemName" min-width="160" />
          <el-table-column label="规格" prop="skuName" min-width="160" />
          <el-table-column label="规格型号" prop="specModel" min-width="160" />
          <el-table-column label="产品标识" prop="productMark" min-width="160" />
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <span>{{ row.locationName ? '已入库' : '未入库' }}</span>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="itemInstanceSelectDialog.total > 0"
          :total="itemInstanceSelectDialog.total"
          v-model:page="itemInstanceSelectDialog.pageNum"
          v-model:limit="itemInstanceSelectDialog.pageSize"
          @pagination="getReceiptItemInstanceList"
        />
        <template #footer>
          <el-button @click="itemInstanceSelectDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmReceiptItemInstance">确认添加</el-button>
        </template>
      </el-dialog>
    </div>
    <div class="footer-global">
      <div class="btn-box">
        <div v-if="!isViewMode">
          <el-button @click="doWarehousing" type="primary" class="ml10">完成入库</el-button>
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

<script setup name="ReceiptOrderEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRefs} from "vue";
import {addReceiptOrder, getReceiptOrder, updateReceiptOrder, warehousing} from "@/api/wms/receiptOrder";
import {ElMessage} from "element-plus";
import RackSelect from "@/views/components/RackSelect.vue";
import LocationSelect from "@/views/components/LocationSelect.vue";
import {useRoute} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import { numSub, generateNo } from '@/utils/ruoyi'
import { delReceiptOrderDetail } from '@/api/wms/receiptOrderDetail'
import { listReceiptTargets } from '@/api/wms/storageLayout'
import { listItem } from "@/api/wms/item";
import { listItemInstance } from "@/api/wms/itemInstance";

const {proxy} = getCurrentInstance();
const route = useRoute();
const isViewMode = computed(() => route.query.mode === 'view');
const { wms_receipt_type, wms_quality_grade, wms_dispatch_mode } = proxy.useDict(
  "wms_receipt_type",
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
    areaId: [
      {required: true, message: "请选择库区", trigger: ['blur', 'change']}
    ],
  }
});
const { form, rules} = toRefs(data);

const cancel = async () => {
  if (isViewMode.value) {
    close()
    return
  }
  await proxy?.$modal.confirm('确认取消编辑入库单吗？');
  close()
}
const close = () => {
  if (route.query.returnFullPath) {
    proxy?.$tab.closeOpenPage(route.query.returnFullPath);
    return
  }
  proxy?.$tab.closePage();
}
const receiptItemOptions = ref([])
const itemInstanceSelectDialog = reactive({
  visible: false,
  loading: false,
  list: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  selection: [],
  query: {
    itemCategory: undefined,
    itemId: undefined,
    instanceCode: undefined
  }
})

// 选择器材实例 start
const showAddItem = async () => {
  if (!useWmsStore().itemCategoryTreeList?.length) {
    await useWmsStore().getItemCategoryTreeList()
  }
  itemInstanceSelectDialog.query.itemCategory = undefined
  itemInstanceSelectDialog.query.itemId = undefined
  itemInstanceSelectDialog.query.instanceCode = undefined
  itemInstanceSelectDialog.pageNum = 1
  itemInstanceSelectDialog.selection = []
  itemInstanceSelectDialog.visible = true
  await loadReceiptItemOptions()
  getReceiptItemInstanceList()
}

const calcLineAmount = (quantity, unitPrice) => {
  const qty = Number(quantity || 0)
  const price = Number(unitPrice || 0)
  return qty && price ? Number((qty * price).toFixed(2)) : 0
}

const normalizeReceiptInstance = (instance = {}) => ({
  id: instance.id,
  instanceCode: instance.instanceCode ?? '',
  boxCode: instance.boxCode ?? '',
  productMark: instance.productMark ?? '',
  qualityGrade: instance.qualityGrade ?? '',
  remark: instance.remark ?? ''
})

const createReceiptDetailFromInstance = (item = {}) => syncReceiptDetail({
  itemInstanceId: item.id ?? item.itemInstanceId,
  instanceCode: item.instanceCode,
  boxCode: item.boxCode ?? '',
  itemId: item.itemId,
  skuId: item.skuId,
  itemName: item.itemName,
  itemCode: item.itemCode,
  skuName: item.skuName,
  specModel: item.specModel,
  quantity: 1,
  productionDate: item.productionDate,
  expirationDate: item.expirationDate,
  warehouseId: form.value.warehouseId,
  areaId: form.value.areaId,
  rackId: undefined,
  locationId: undefined,
  generateItemInstance: 1,
  generatedInstanceQuantity: 0,
  productMark: item.productMark,
  qualityGrade: item.qualityGrade,
  receiptItemInstances: [normalizeReceiptInstance({
    id: item.id ?? item.itemInstanceId,
    instanceCode: item.instanceCode,
    boxCode: item.boxCode ?? '',
    productMark: item.productMark,
    qualityGrade: item.qualityGrade,
    remark: item.remark
  })]
})

const syncReceiptDetail = (detail) => {
  const firstReceiptInstance = detail.receiptItemInstances?.[0] || {}
  const unitPrice = detail.unitPrice
  const lineAmount = detail.lineAmount ?? detail.amount ?? calcLineAmount(detail.quantity, unitPrice)
  return {
    ...detail,
    itemId: detail.itemId ?? detail.itemSku?.item?.id,
    skuId: detail.skuId ?? detail.itemSku?.id,
    itemName: detail.itemName ?? detail.itemSku?.item?.itemName,
    itemCode: detail.itemCode ?? detail.itemSku?.item?.itemCode,
    skuName: detail.skuName ?? detail.itemSku?.skuName,
    itemInstanceId: detail.itemInstanceId ?? firstReceiptInstance.id,
    instanceCode: detail.instanceCode ?? firstReceiptInstance.instanceCode ?? '',
    boxCode: detail.boxCode ?? firstReceiptInstance.boxCode ?? '',
    equipmentCode: detail.equipmentCode ?? detail.itemSku?.item?.itemCode ?? detail.itemCode ?? firstReceiptInstance.instanceCode,
    specModel: detail.specModel ?? detail.itemSku?.specModel ?? detail.itemSku?.item?.modelText,
    productMark: detail.productMark ?? firstReceiptInstance.productMark ?? '',
    qualityGrade: detail.qualityGrade ?? detail.itemSku?.item?.defaultQualityGrade,
    quantity: Number(detail.quantity || 1),
    generateItemInstance: 1,
    rackId: detail.rackId,
    locationId: detail.locationId,
    receiptItemInstances: (detail.receiptItemInstances || []).map(it => normalizeReceiptInstance(it)),
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

const loadReceiptItemOptions = async () => {
  if (!itemInstanceSelectDialog.query.itemCategory) {
    receiptItemOptions.value = []
    return
  }
  const params = {}
  params.itemCategory = itemInstanceSelectDialog.query.itemCategory
  const res = await listItem(params)
  receiptItemOptions.value = res.data || []
}

const handleReceiptItemCategoryChange = async () => {
  itemInstanceSelectDialog.query.itemId = undefined
  itemInstanceSelectDialog.pageNum = 1
  await loadReceiptItemOptions()
  itemInstanceSelectDialog.list = []
  itemInstanceSelectDialog.total = 0
}

const getReceiptItemInstanceList = () => {
  if (!itemInstanceSelectDialog.query.itemId) {
    itemInstanceSelectDialog.list = []
    itemInstanceSelectDialog.total = 0
    return
  }
  itemInstanceSelectDialog.loading = true
  listItemInstance({
    pageNum: itemInstanceSelectDialog.pageNum,
    pageSize: itemInstanceSelectDialog.pageSize,
    itemId: itemInstanceSelectDialog.query.itemId,
    instanceCode: itemInstanceSelectDialog.query.instanceCode,
    unreceivedOnly: true
  }).then((res) => {
    itemInstanceSelectDialog.list = res.rows || []
    itemInstanceSelectDialog.total = res.total || 0
  }).finally(() => {
    itemInstanceSelectDialog.loading = false
  })
}

const handleReceiptItemInstanceSelectionChange = (selection) => {
  itemInstanceSelectDialog.selection = selection
}

const isReceiptItemInstanceSelectable = (row) => {
  return !form.value.details.some(detail => detail.itemInstanceId === row.id)
}

const handleConfirmReceiptItemInstance = () => {
  if (!itemInstanceSelectDialog.selection.length) {
    ElMessage.error('请选择器材实例')
    return
  }
  const newDetails = itemInstanceSelectDialog.selection.map(item => createReceiptDetailFromInstance(item))
  form.value.details.push(...newDetails)
  itemInstanceSelectDialog.visible = false
  Promise.all(newDetails.map(detail => loadRecommendTargets(detail)))
  recalculateOrderSummary()
}
// 选择器材实例 end

// 初始化receipt-order-form ref
const receiptForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('确认暂存入库单吗？');
  doSave()
}

const validateReceiptInstancesBeforeSubmit = () => {
  const duplicatedInstances = new Set()
  const instanceSet = new Set()
  for (const detail of form.value.details) {
    const quantity = Number(detail.quantity || 0)
    if (quantity !== 1) {
      return '当前入库模式按单品实例执行，明细数量必须为1'
    }
    const instanceId = detail.itemInstanceId ?? detail.receiptItemInstances?.[0]?.id
    const instanceCode = String(detail.instanceCode || detail.receiptItemInstances?.[0]?.instanceCode || '').trim()
    if (!instanceId && !instanceCode) {
      return '请先选择器材实例'
    }
    const uniqueKey = instanceId ? `ID:${instanceId}` : `CODE:${instanceCode}`
    if (instanceSet.has(uniqueKey)) {
      duplicatedInstances.add(instanceCode || String(instanceId))
    }
    instanceSet.add(uniqueKey)
  }
  if (duplicatedInstances.size) {
    return `器材实例重复：${Array.from(duplicatedInstances).join('、')}`
  }
  return ''
}

const buildReceiptItemInstances = (detail) => [{
  id: detail.itemInstanceId ?? detail.receiptItemInstances?.[0]?.id,
  instanceCode: detail.instanceCode ?? detail.receiptItemInstances?.[0]?.instanceCode,
  boxCode: detail.boxCode ?? detail.receiptItemInstances?.[0]?.boxCode,
  productMark: detail.productMark,
  qualityGrade: detail.qualityGrade,
  remark: detail.remark
}]

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
        skuId: it.skuId ?? it.itemSku?.id,
        amount: it.lineAmount,
        quantity: 1,
        equipmentCode: it.equipmentCode,
        specModel: it.specModel,
        productMark: it.productMark,
        qualityGrade: it.qualityGrade,
        unitPrice: it.unitPrice,
        lineAmount: it.lineAmount,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        warehouseId: form.value.warehouseId,
        areaId: it.areaId,
        rackId: it.rackId,
        locationId: it.locationId,
        generateItemInstance: 1,
        generatedInstanceQuantity: it.generatedInstanceQuantity,
        receiptItemInstances: buildReceiptItemInstances(it),
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
    const instanceMessage = validateReceiptInstancesBeforeSubmit()
    if (instanceMessage) {
      return ElMessage.error(instanceMessage)
    }
    // 构建参数
    const details = form.value.details.map(it => {
      return {
        id: it.id,
        receiptOrderId: form.value.id,
        skuId: it.skuId ?? it.itemSku?.id,
        amount: it.lineAmount,
        quantity: 1,
        equipmentCode: it.equipmentCode,
        specModel: it.specModel,
        productMark: it.productMark,
        qualityGrade: it.qualityGrade,
        unitPrice: it.unitPrice,
        lineAmount: it.lineAmount,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        warehouseId: form.value.warehouseId,
        areaId: it.areaId,
        rackId: it.rackId,
        locationId: it.locationId,
        generateItemInstance: 1,
        generatedInstanceQuantity: it.generatedInstanceQuantity,
        receiptItemInstances: buildReceiptItemInstances(it),
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
      details: (response.data.details || []).map(it => syncReceiptDetail({
        ...it,
        generateItemInstance: 1,
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

.receipt-toolbar {
  gap: 12px;
}

.receipt-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

</style>
