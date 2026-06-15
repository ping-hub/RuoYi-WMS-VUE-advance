<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" :class="{ 'is-view-mode': isViewMode }" style="margin-bottom: 60px" v-loading="loading">
      <el-alert v-if="isViewMode" class="mb10" type="info" :closable="false" title="当前为联查查看模式，已禁用编辑、作废和完成出库操作。" />
      <el-card header="出库单基本信息">
        <el-form label-width="108px" :model="form" ref="shipmentForm" :rules="rules" :disabled="isViewMode">
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="出库单号" prop="shipmentOrderNo">
                <el-input v-model="form.shipmentOrderNo" placeholder="保存后自动生成" style="width: 100%" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="出库类型" prop="shipmentOrderType">
                <el-select v-model="form.shipmentOrderType" placeholder="请选择出库类型" clearable style="width: 100%">
                  <el-option v-for="item in wms_shipment_type" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="仓库" prop="warehouseId">
                <el-select v-model="form.warehouseId" placeholder="请选择仓库" @change="handleChangeWarehouse"
                           filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                             :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="库区" prop="areaId">
                <el-select v-model="form.areaId" placeholder="请选择库区" :disabled="!form.warehouseId" clearable
                           filterable @change="handleChangeArea" style="width: 100%!important;">
                  <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.warehouseId)"
                             :key="item.id" :label="item.areaName" :value="item.id"/>
                </el-select>
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
                <el-input v-model="form.dispatchMode" placeholder="请输入调拨方式" />
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
              <el-form-item label="出库日期" prop="shipmentDate">
                <el-date-picker v-model="form.shipmentDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="form.remark"
                  placeholder="备注...100个字符以内"
                  rows="2"
                  maxlength="100"
                  type="textarea"
                  show-word-limit="show-word-limit"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card header="器材明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8">
            <div>
              <el-tag type="info">支持“选择器材实例”或扫码枪扫二维码直接新增，当前只允许选择在库实例</el-tag>
            </div>
            <div class="add-actions">
              <el-button type="primary" plain size="default" @click="showAddItemInstance" icon="Tickets" :disabled="!form.warehouseId || !form.areaId || isViewMode">
                选择器材实例
              </el-button>
            </div>
          </div>
          <el-table :data="form.details" border empty-text="暂无器材明细">
            <el-table-column label="器材实例编码" prop="instanceCode" min-width="170" show-overflow-tooltip />
            <el-table-column label="器材信息" min-width="180">
              <template #default="{ row }">
                <div>{{ row.itemName || '-' }}</div>
                <div v-if="row.itemCode" class="sub-text">器材编码：{{ row.itemCode }}</div>
                <div v-if="row.skuName" class="sub-text">规格型号：{{ row.skuName }}</div>
                <div v-if="row.unit" class="sub-text">计量单位：{{ row.unit }}</div>
                <div v-if="row.productIdentifier" class="sub-text">产品标识：{{ row.productIdentifier }}</div>
                <div v-if="row.qualityGrade" class="sub-text">质量等级：{{ row.qualityGrade }}</div>
              </template>
            </el-table-column>
            <el-table-column label="货位信息" min-width="170">
              <template #default="{ row }">
                <div v-if="row.areaName">库区：{{ row.areaName }}</div>
                <div v-if="row.rackName" class="sub-text">货架：{{ row.rackName }}</div>
                <div v-if="row.locationName" class="sub-text">货位：{{ row.locationName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="单价" prop="unitPrice" width="180">
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
            <el-table-column label="总价" prop="lineAmount" width="100" align="right">
              <template #default="{ row }">
                <span>{{ Number(row.lineAmount || 0).toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="请输入备注" :disabled="isViewMode" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="88" align="right">
              <template #default="scope">
                <el-button v-if="!isViewMode" icon="Delete" type="danger" plain size="small"
                           @click="handleDeleteDetail(scope.row, scope.$index)" link>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <el-dialog v-model="itemInstanceDialog.visible" title="选择器材实例" width="1100px" append-to-body>
        <el-form :inline="true" :model="itemInstanceDialog.query" label-width="76px" class="item-instance-search-form">
          <el-form-item label="器材名称">
            <el-input
              v-model="itemInstanceDialog.query.itemName"
              placeholder="请输入器材名称"
              clearable
              style="width: 140px"
              @keyup.enter="getItemInstanceList"
            />
          </el-form-item>
          <el-form-item label="货架">
            <RackSelect
              v-model="itemInstanceDialog.query.rackId"
              :warehouse-id="itemInstanceDialog.query.warehouseId"
              :area-id="itemInstanceDialog.query.areaId"
              placeholder="货架"
              style="width: 140px"
            />
          </el-form-item>
          <el-form-item label="器材规格">
            <el-input
              v-model="itemInstanceDialog.query.skuName"
              placeholder="请输入器材规格"
              clearable
              style="width: 150px"
              @keyup.enter="getItemInstanceList"
            />
          </el-form-item>
          <el-form-item label="器材实例编码" label-width="100px">
            <el-input
              v-model="itemInstanceDialog.query.instanceCode"
              placeholder="请输入器材实例编码"
              clearable
              style="width: 150px"
              @keyup.enter="getItemInstanceList"
            />
          </el-form-item>
          <el-form-item class="item-instance-search-form__action">
            <el-button type="primary" @click="getItemInstanceList">查询</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="itemInstanceDialog.loading" :data="itemInstanceDialog.list" @selection-change="handleItemInstanceSelectionChange" border row-key="id">
          <el-table-column type="selection" width="55" :selectable="isItemInstanceSelectable" />
          <el-table-column label="器材实例编码" prop="instanceCode" min-width="160" />
          <el-table-column label="器材名称" prop="itemName" min-width="160" />
          <el-table-column label="器材规格" prop="skuName" min-width="160" />
          <el-table-column label="货架" prop="rackName" width="120" />
          <el-table-column label="货位" prop="locationName" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <dict-tag :options="wms_item_instance_status" :value="row.instanceStatus" />
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="itemInstanceDialog.total > 0"
          :total="itemInstanceDialog.total"
          v-model:page="itemInstanceDialog.pageNum"
          v-model:limit="itemInstanceDialog.pageSize"
          @pagination="getItemInstanceList"
        />
        <template #footer>
          <el-button @click="itemInstanceDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmItemInstance">确认添加</el-button>
        </template>
      </el-dialog>
    </div>
    <div class="footer-global">
      <div class="btn-box">
        <div v-if="!isViewMode">
          <el-button @click="doShipment" type="primary" class="ml10">完成出库</el-button>
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

<script setup name="ShipmentOrderEdit">
import {computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, toRefs} from "vue";
import {addShipmentOrder, getShipmentOrder, updateShipmentOrder, shipment} from "@/api/wms/shipmentOrder";
import {delShipmentOrderDetail} from "@/api/wms/shipmentOrderDetail";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import {numSub} from '@/utils/ruoyi'
import {listInventoryDetailNoPage} from "@/api/wms/inventoryDetail";
import {getItemInstanceByCode, listItemInstance} from "@/api/wms/itemInstance";
import RackSelect from "@/views/components/RackSelect.vue";

const {proxy} = getCurrentInstance();
const route = useRoute();
const isViewMode = computed(() => route.query.mode === 'view');
const {wms_item_instance_status, wms_shipment_type} = proxy.useDict(
  "wms_item_instance_status",
  "wms_shipment_type"
);

const loading = ref(false)
const initFormData = {
  id: undefined,
  shipmentOrderNo: undefined,
  shipmentOrderType: undefined,
  basisNo: undefined,
  dispatchMode: undefined,
  noticeOrg: undefined,
  receiveUnit: undefined,
  purchaseDate: undefined,
  shipmentDate: undefined,
  receivableAmount: undefined,
  shipmentOrderStatus: 0,
  remark: undefined,
  warehouseId: undefined,
  areaId: undefined,
  totalQuantity: 0,
  details: [],
}
const inventoryDetailOptions = ref([])
const itemInstanceDialog = reactive({
  visible: false,
  loading: false,
  list: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  selection: [],
  query: {
    warehouseId: undefined,
    areaId: undefined,
    rackId: undefined,
    unshippedOnly: true,
    instanceCode: undefined,
    itemName: undefined,
    skuName: undefined
  }
})
const shipmentScanBuffer = reactive({
  value: '',
  lastTime: 0,
  pending: false
})
const data = reactive({
  form: {...initFormData},
  rules: {
    shipmentOrderType: [
      {required: true, message: "出库类型不能为空", trigger: "change"}
    ],
    warehouseId: [
      {required: true, message: "请选择仓库", trigger: ['blur', 'change']}
    ],
    areaId: [
      {required: true, message: "请选择库区", trigger: ['blur', 'change']}
    ],
  }
});
const {form, rules} = toRefs(data);
const cancel = async () => {
  if (isViewMode.value) {
    close()
    return
  }
  await proxy?.$modal.confirm('确认取消编辑出库单吗？');
  close()
}
const close = () => {
  if (route.query.returnFullPath) {
    proxy?.$tab.closeOpenPage(route.query.returnFullPath);
    return
  }
  proxy?.$tab.closePage();
}
const calcLineAmount = (quantity, unitPrice) => {
  const qty = Number(quantity || 0)
  const price = Number(unitPrice || 0)
  return qty && price ? Number((qty * price).toFixed(2)) : 0
}

const syncShipmentDetail = (detail) => {
  const unitPrice = detail.unitPrice
  const lineAmount = detail.lineAmount ?? calcLineAmount(detail.quantity, unitPrice)
  return {
    ...detail,
    itemCode: detail.itemCode ?? detail.itemSku?.item?.itemCode,
    itemName: detail.itemName ?? detail.itemSku?.item?.itemName,
    skuName: detail.skuName ?? detail.itemSku?.skuName,
    unit: detail.unit ?? detail.itemSku?.item?.unit,
    productIdentifier: detail.productIdentifier ?? detail.itemSku?.productIdentifier,
    qualityGrade: detail.qualityGrade ?? detail.itemSku?.qualityGrade,
    areaName: detail.areaName,
    rackId: detail.rackId ?? detail.inventoryDetail?.rackId,
    rackName: detail.rackName ?? detail.inventoryDetail?.rackName,
    locationId: detail.locationId ?? detail.inventoryDetail?.locationId,
    locationName: detail.locationName ?? detail.inventoryDetail?.locationName,
    unitPrice,
    lineAmount
  }
}

const recalculateOrderSummary = () => {
  let quantitySum = 0
  let amountSum = 0
  form.value.details.forEach(it => {
    quantitySum += Number(it.quantity || 0)
    amountSum += Number(it.lineAmount || 0)
  })
  form.value.totalQuantity = quantitySum
  form.value.receivableAmount = amountSum ? Number(amountSum.toFixed(2)) : 0
}

const handleDetailChange = (row) => {
  row.lineAmount = calcLineAmount(row.quantity, row.unitPrice)
  recalculateOrderSummary()
}

const normalizeDateTime = (value) => {
  if (!value) {
    return ''
  }
  return String(value).replace('T', ' ').replace(/\.\d+$/, '')
}

const getInventoryAvailableQuantity = (inventoryDetailId, extraUsage = {}) => {
  const inventory = inventoryDetailOptions.value.find(it => it.id === inventoryDetailId)
  if (!inventory) {
    return 0
  }
  const usedQuantity = form.value.details.reduce((sum, detail) => {
    if (detail.inventoryDetailId === inventoryDetailId) {
      return sum + Number(detail.quantity || 0)
    }
    return sum
  }, 0)
  return Number(inventory.remainQuantity || 0) - usedQuantity - Number(extraUsage[inventoryDetailId] || 0)
}

const refreshInventoryOptions = async () => {
  if (!form.value.warehouseId) {
    inventoryDetailOptions.value = []
    return
  }
  const res = await listInventoryDetailNoPage({
    warehouseId: form.value.warehouseId,
    areaId: form.value.areaId
  })
  inventoryDetailOptions.value = res.data || []
}

const matchInventoryDetail = (source, extraUsage = {}) => {
  const targetAreaId = source.areaId || form.value.areaId
  const candidates = inventoryDetailOptions.value.filter(it => {
    return it.skuId === source.skuId
      && it.warehouseId === form.value.warehouseId
      && (!targetAreaId || it.areaId === targetAreaId)
      && (!source.instanceCode || it.instanceCode === source.instanceCode)
  })
  return candidates.find(it => getInventoryAvailableQuantity(it.id, extraUsage) >= Number(source.quantity || 1))
}

const createDetailRow = (payload) => {
  return {
    id: payload.id,
    itemSku: payload.itemSku,
    itemName: payload.itemName,
    itemCode: payload.itemCode,
    skuName: payload.skuName,
    unit: payload.unit,
    productIdentifier: payload.productIdentifier,
    qualityGrade: payload.qualityGrade,
    skuId: payload.skuId,
    quantity: payload.quantity,
    remainQuantity: payload.remainQuantity,
    warehouseId: payload.warehouseId,
    areaId: payload.areaId,
    inventoryDetailId: payload.inventoryDetailId,
    areaName: payload.areaName,
    rackId: payload.rackId,
    rackName: payload.rackName,
    locationId: payload.locationId,
    locationName: payload.locationName,
    instanceCode: payload.instanceCode,
    remark: payload.remark
  }
}
// 选择器材 end

// 初始化receipt-order-form ref
const shipmentForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('确认暂存出库单吗？');
  doSave()
}

const doSave = (shipmentOrderStatus = 0) => {
  //验证shipmentForm表单
  shipmentForm.value?.validate((valid) => {
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
      // 构建参数
      details = form.value.details.map(it => {
        return {
          id: it.id,
          shipmentOrderId: form.value.id,
          skuId: it.skuId,
          itemCode: it.itemCode,
          itemName: it.itemName,
          skuName: it.skuName,
          unit: it.unit,
          productIdentifier: it.productIdentifier,
          qualityGrade: it.qualityGrade,
          unitPrice: it.unitPrice,
          lineAmount: it.lineAmount,
          quantity: it.quantity,
          inventoryDetailId: it.inventoryDetailId,
          instanceCode: it.instanceCode,
          warehouseId: form.value.warehouseId,
          areaId: it.areaId,
          remark: it.remark
        }
      })
    }


    //('提交前校验',form.value)
    const params = {
      id: form.value.id,
      shipmentOrderNo: form.value.shipmentOrderNo,
      shipmentOrderType: form.value.shipmentOrderType,
      shipmentOrderStatus,
      basisNo: form.value.basisNo,
      dispatchMode: form.value.dispatchMode,
      noticeOrg: form.value.noticeOrg,
      receiveUnit: form.value.receiveUnit,
      purchaseDate: form.value.purchaseDate,
      shipmentDate: form.value.shipmentDate,
      remark: form.value.remark,
      receivableAmount: form.value.receivableAmount,
      totalQuantity: form.value.totalQuantity,
      warehouseId: form.value.warehouseId,
      areaId: form.value.areaId,
      details: details
    }
    if (params.id) {
      updateShipmentOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      })
    } else {
      addShipmentOrder(params).then((res) => {
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
  await proxy?.$modal.confirm('确认作废出库单吗？');
  doSave(-1)
}

const doShipment = async () => {
  await proxy?.$modal.confirm('确认出库吗？');
  shipmentForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    if (!form.value.details?.length) {
      return ElMessage.error('请选择器材')
    }
    const invalidQuantityList = form.value.details.filter(it => !it.quantity)
    if (invalidQuantityList?.length) {
      return ElMessage.error('请选择出库数量')
    }
    // 构建参数
    const details = form.value.details.map(it => {
      return {
        id: it.id,
        shipmentOrderId: form.value.id,
        skuId: it.skuId,
        itemCode: it.itemCode,
        itemName: it.itemName,
        skuName: it.skuName,
        unit: it.unit,
        productIdentifier: it.productIdentifier,
        qualityGrade: it.qualityGrade,
        unitPrice: it.unitPrice,
        lineAmount: it.lineAmount,
        quantity: it.quantity,
        inventoryDetailId: it.inventoryDetailId,
        instanceCode: it.instanceCode,
        warehouseId: form.value.warehouseId,
        areaId: it.areaId
      }
    })

    //('提交前校验',form.value)
    const params = {
      id: form.value.id,
      shipmentOrderNo: form.value.shipmentOrderNo,
      shipmentOrderType: form.value.shipmentOrderType,
      basisNo: form.value.basisNo,
      dispatchMode: form.value.dispatchMode,
      noticeOrg: form.value.noticeOrg,
      receiveUnit: form.value.receiveUnit,
      purchaseDate: form.value.purchaseDate,
      shipmentDate: form.value.shipmentDate,
      remark: form.value.remark,
      receivableAmount: form.value.receivableAmount,
      totalQuantity: form.value.totalQuantity,
      warehouseId: form.value.warehouseId,
      areaId: form.value.areaId,
      details: details
    }
    loading.value = true
    shipment(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('出库成功')
        close()
      } else {
        ElMessage.error(res.msg)
      }
    }).finally(()=>{
      loading.value = false
    })
  })
}

onMounted(() => {
  window.addEventListener('keydown', handleShipmentScanKeydown)
  const id = route.query && route.query.id;
  if (id) {
    loadDetail(id)
  } else {
    form.value.shipmentOrderType = wms_shipment_type.value?.[0]?.value
    refreshInventoryOptions()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleShipmentScanKeydown)
})


// 获取入库单详情
const loadDetail = (id) => {
  loading.value = true
  getShipmentOrder(id).then((response) => {
    if (response.data.details?.length) {
      response.data.details.forEach(detail => {
        detail.areaName = useWmsStore().areaMap.get(detail.areaId)?.areaName
        detail.rackName = detail.rackName ?? detail.inventoryDetail?.rackName
        detail.locationName = detail.locationName ?? detail.inventoryDetail?.locationName
      })
    }
    form.value = {
      ...response.data,
      details: (response.data.details || []).map(detail => syncShipmentDetail(detail))
    }
    recalculateOrderSummary()
    return refreshInventoryOptions()
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleChangeWarehouse = (e) => {
  form.value.areaId = undefined
  form.value.details = []
  refreshInventoryOptions()
}

const handleChangeArea = (e) => {
  form.value.details = form.value.details.filter(it => it.areaId === e)
  refreshInventoryOptions()
}

const handleChangeQuantity = () => {
  form.value.details.forEach(it => {
    it.lineAmount = calcLineAmount(it.quantity, it.unitPrice)
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
  form.value.receivableAmount = sum ?? 0
}

const handleDeleteDetail = (row, index) => {
  if (row.id) {
    proxy.$modal.confirm('确认删除本条器材条目吗？如确认会立即执行！').then(function () {
      return delShipmentOrderDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      proxy.$modal.msgSuccess("删除成功");
    })
  } else {
    form.value.details.splice(index, 1)
  }
  handleChangeQuantity()
}

const addItemInstancesToShipment = async (items) => {
  if (!items?.length) {
    return
  }
  await refreshInventoryOptions()
  const extraUsage = {}
  const newRows = []
  for (const item of items) {
    if (form.value.details.some(detail => detail.instanceCode === item.instanceCode)) {
      throw new Error(`器材实例编码 ${item.instanceCode} 已添加`)
    }
    const matchedInventory = matchInventoryDetail({
      skuId: item.skuId,
      areaId: item.areaId,
      quantity: 1,
      instanceCode: item.instanceCode
    }, extraUsage)
    if (!matchedInventory) {
      throw new Error(`器材实例编码 ${item.instanceCode} 未匹配到可用库存明细`)
    }
    extraUsage[matchedInventory.id] = Number(extraUsage[matchedInventory.id] || 0) + 1
    newRows.push(createDetailRow({
      skuId: item.skuId,
      skuName: item.skuName,
      itemName: item.itemName,
      itemCode: item.itemCode,
      unit: item.unit,
      productIdentifier: item.productIdentifier,
      qualityGrade: item.qualityGrade,
      quantity: 1,
      remainQuantity: matchedInventory.remainQuantity,
      warehouseId: form.value.warehouseId,
      areaId: item.areaId,
      inventoryDetailId: matchedInventory.id,
      areaName: useWmsStore().areaMap.get(item.areaId)?.areaName,
      rackId: matchedInventory.rackId,
      rackName: matchedInventory.rackName,
      locationId: matchedInventory.locationId,
      locationName: matchedInventory.locationName,
      instanceCode: item.instanceCode,
    }))
  }
  form.value.details.push(...newRows.map(it => syncShipmentDetail(it)))
  handleChangeQuantity()
}

const isTypingTarget = (event) => {
  const tagName = event?.target?.tagName
  return ['INPUT', 'TEXTAREA'].includes(tagName) || event?.target?.isContentEditable
}

const handleScanAddItemInstance = async (instanceCode) => {
  if (!form.value.warehouseId || !form.value.areaId) {
    ElMessage.warning('请先选择仓库和库区后再扫码')
    return
  }
  const res = await getItemInstanceByCode(instanceCode, { unshippedOnly: true, instanceStatus: '在库' })
  const item = res.data
  if (!item?.id) {
    ElMessage.error(`未找到可出库器材实例：${instanceCode}`)
    return
  }
  await addItemInstancesToShipment([item])
  ElMessage.success(`已扫码添加：${instanceCode}`)
}

const handleShipmentScanKeydown = async (event) => {
  if (isViewMode.value || loading.value || shipmentScanBuffer.pending || isTypingTarget(event)) {
    return
  }
  const now = Date.now()
  if (now - shipmentScanBuffer.lastTime > 120) {
    shipmentScanBuffer.value = ''
  }
  shipmentScanBuffer.lastTime = now
  if (event.key === 'Enter') {
    const instanceCode = shipmentScanBuffer.value.trim()
    shipmentScanBuffer.value = ''
    if (!instanceCode) {
      return
    }
    shipmentScanBuffer.pending = true
    try {
      await handleScanAddItemInstance(instanceCode)
    } catch (e) {
      ElMessage.error(e?.message || '扫码添加失败')
    } finally {
      shipmentScanBuffer.pending = false
    }
    return
  }
  if (event.key.length === 1) {
    shipmentScanBuffer.value += event.key
  }
}

const showAddItemInstance = async () => {
  await refreshInventoryOptions()
  if (!useWmsStore().warehouseList?.length) {
    await useWmsStore().getWarehouseList()
  }
  if (!useWmsStore().areaList?.length) {
    await useWmsStore().getAreaList()
  }
  itemInstanceDialog.query.warehouseId = form.value.warehouseId
  itemInstanceDialog.query.areaId = form.value.areaId
  itemInstanceDialog.query.rackId = undefined
  itemInstanceDialog.pageNum = 1
  itemInstanceDialog.visible = true
  itemInstanceDialog.selection = []
  getItemInstanceList()
}

const getItemInstanceList = () => {
  itemInstanceDialog.loading = true
  listItemInstance({
    pageNum: itemInstanceDialog.pageNum,
    pageSize: itemInstanceDialog.pageSize,
    warehouseId: form.value.warehouseId,
    areaId: form.value.areaId,
    instanceStatus: '在库',
    ...itemInstanceDialog.query
  }).then((res) => {
    itemInstanceDialog.list = res.rows || []
    itemInstanceDialog.total = res.total || 0
  }).finally(() => {
    itemInstanceDialog.loading = false
  })
}

const handleItemInstanceSelectionChange = (selection) => {
  itemInstanceDialog.selection = selection
}

const isItemInstanceSelectable = (row) => {
  return !form.value.details.some(detail => detail.instanceCode === row.instanceCode)
}

const handleConfirmItemInstance = async () => {
  if (!itemInstanceDialog.selection.length) {
    ElMessage.error('请选择器材实例编码')
    return
  }
  try {
    await addItemInstancesToShipment(itemInstanceDialog.selection)
    itemInstanceDialog.visible = false
  } catch (e) {
    ElMessage.error(e?.message || '器材实例编码添加失败')
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

.el-statistic__content {
  font-size: 14px;
}

.add-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.table-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.item-title {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.item-instance-search-form {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.item-instance-search-form :deep(.el-form-item) {
  margin-right: 8px;
  margin-bottom: 12px;
}

.item-instance-search-form :deep(.el-form-item__label) {
  padding-right: 6px;
}

.item-instance-search-form__action {
  margin-left: auto !important;
  margin-right: 0 !important;
}

@media (max-width: 1280px) {
  .item-instance-search-form :deep(.el-form-item) {
    margin-right: 12px;
  }
}
</style>

