<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="出库单基本信息">
        <el-form label-width="108px" :model="form" ref="shipmentForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="出库单号" prop="shipmentOrderNo">
                <el-input class="w200" v-model="form.shipmentOrderNo" placeholder="出库单号"
                          :disabled="form.id"></el-input>
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
            <el-col :span="11">
              <el-form-item label="出库类型" prop="shipmentOrderType">
                <el-radio-group v-model="form.shipmentOrderType">
                  <el-radio-button
                    v-for="item in wms_shipment_type"
                    :key="item.value"
                    :label="item.value"
                  >{{ item.label }}
                  </el-radio-button
                  >
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="客户" prop="merchantId">
                <el-select v-model="form.merchantId" placeholder="请选择客户" clearable filterable>
                  <el-option v-for="item in useWmsStore().merchantList" :key="item.id" :label="item.merchantName"
                             :value="item.id"/>
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
                <el-form-item label="金额" prop="receivableAmount">
                  <el-input-number v-model="form.receivableAmount" :precision="2" :min="0"></el-input-number>
                </el-form-item>
                <el-button link type="primary" @click="handleAutoCalc" class="ml20" style="line-height: 32px">自动计算
                </el-button>
              </div>
            </el-col>
            <el-col :span="6">
              <el-form-item label="数量" prop="totalQuantity">
                <el-input-number v-model="form.totalQuantity" :controls="false" :precision="0"
                                 :disabled="true"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card header="商品明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8">
            <div>
              <el-tag type="info">支持库存出库 / 单品出库 / 整箱出库</el-tag>
            </div>
            <div class="add-actions">
              <el-button type="primary" plain size="default" @click="showAddInventory" icon="Plus" :disabled="!form.warehouseId">
                按库存添加
              </el-button>
              <el-button type="primary" plain size="default" @click="showAddItemInstance" icon="Tickets" :disabled="!form.warehouseId">
                按单品添加
              </el-button>
              <el-button type="primary" plain size="default" @click="showAddBox" icon="Box" :disabled="!form.warehouseId">
                按整箱添加
              </el-button>
            </div>
          </div>
          <el-table :data="form.details" border empty-text="暂无商品明细">
            <el-table-column label="商品信息" prop="itemSku.itemName">
              <template #default="{ row }">
                <div>{{
                    (row.itemSku?.item?.itemName || row.itemName || '-') + ((row.itemSku?.item?.itemCode || row.itemCode) ? ('(' + (row.itemSku?.item?.itemCode || row.itemCode) + ')') : '')
                  }}
                </div>
                <div v-if="row.itemSku?.item?.itemBrand">
                  品牌：{{ useWmsStore().itemBrandMap.get(row.itemSku.item.itemBrand)?.brandName }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="规格信息">
              <template #default="{ row }">
                <div>{{ row.itemSku?.skuName || row.skuName || '-' }}</div>
                <div v-if="row.itemSku?.barcode">条码：{{ row.itemSku.barcode }}</div>
              </template>
            </el-table-column>
            <el-table-column label="出库方式" width="120">
              <template #default="{ row }">
                <dict-tag :options="shipmentDetailSourceOptions" :value="row.detailSourceType" />
              </template>
            </el-table-column>
            <el-table-column label="追踪对象" min-width="180">
              <template #default="{ row }">
                <div v-if="row.instanceCode">单品码：{{ row.instanceCode }}</div>
                <div v-if="row.boxCode">箱码：{{ row.boxCode }}</div>
                <div v-if="!row.instanceCode && !row.boxCode">-</div>
              </template>
            </el-table-column>
            <el-table-column label="库区" prop="areaName" width="200"/>
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
            <el-table-column label="出库数量" prop="quantity" width="180">
              <template #default="scope">
                <div v-if="scope.row.detailSourceType !== 'inventory'">
                  <el-input-number
                    v-model="scope.row.quantity"
                    placeholder="出库数量"
                    :min="1"
                    :precision="0"
                    :max="scope.row.remainQuantity"
                    :disabled="true"
                  ></el-input-number>
                  <div class="table-tip">追踪出库固定为 1</div>
                </div>
                <el-input-number
                  v-else
                  v-model="scope.row.quantity"
                  placeholder="出库数量"
                  :min="1"
                  :precision="0"
                  :max="scope.row.remainQuantity"
                  @change="handleChangeQuantity"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="价格" prop="amount" width="180">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.amount"
                  placeholder="价格"
                  :precision="2"
                  :min="0"
                  :max="2147483647"
                ></el-input-number>
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
        :select-area-disable="!!form?.areaId"
        :warehouse-id="form.warehouseId"
        :area-id="form.areaId"
        :selected-inventory="selectedInventory"
      />
      <el-dialog v-model="itemInstanceDialog.visible" title="按单品添加" width="1100px" append-to-body>
        <el-form :inline="true" :model="itemInstanceDialog.query" label-width="88px">
          <el-form-item label="单品码">
            <el-input v-model="itemInstanceDialog.query.instanceCode" placeholder="请输入单品码" clearable @keyup.enter="getItemInstanceList" />
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="itemInstanceDialog.query.itemName" placeholder="请输入商品名称" clearable @keyup.enter="getItemInstanceList" />
          </el-form-item>
          <el-form-item label="规格名称">
            <el-input v-model="itemInstanceDialog.query.skuName" placeholder="请输入规格名称" clearable @keyup.enter="getItemInstanceList" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getItemInstanceList">查询</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="itemInstanceDialog.loading" :data="itemInstanceDialog.list" @selection-change="handleItemInstanceSelectionChange" border row-key="id">
          <el-table-column type="selection" width="55" :selectable="isItemInstanceSelectable" />
          <el-table-column label="单品码" prop="instanceCode" min-width="160" />
          <el-table-column label="商品" prop="itemName" min-width="160" />
          <el-table-column label="规格" prop="skuName" min-width="160" />
          <el-table-column label="库区" prop="areaName" width="120" />
          <el-table-column label="货位" prop="locationName" width="120" />
          <el-table-column label="批号" prop="batchNo" min-width="120" />
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
      <el-dialog v-model="boxDialog.visible" title="按整箱添加" width="1100px" append-to-body>
        <el-form :inline="true" :model="boxDialog.query" label-width="88px">
          <el-form-item label="箱码">
            <el-input v-model="boxDialog.query.boxCode" placeholder="请输入箱码" clearable @keyup.enter="getBoxList" />
          </el-form-item>
          <el-form-item label="箱体名称">
            <el-input v-model="boxDialog.query.boxName" placeholder="请输入箱体名称" clearable @keyup.enter="getBoxList" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getBoxList">查询</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="boxDialog.loading" :data="boxDialog.list" @selection-change="handleBoxSelectionChange" border row-key="id">
          <el-table-column type="selection" width="55" :selectable="isBoxSelectable" />
          <el-table-column label="箱码" prop="boxCode" min-width="160" />
          <el-table-column label="箱体名称" prop="boxName" min-width="160" />
          <el-table-column label="库区" prop="areaName" width="120" />
          <el-table-column label="货位" prop="locationName" width="120" />
          <el-table-column label="箱内数量" prop="itemCount" width="100" align="right" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <dict-tag :options="wms_box_status" :value="row.boxStatus" />
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="boxDialog.total > 0"
          :total="boxDialog.total"
          v-model:page="boxDialog.pageNum"
          v-model:limit="boxDialog.pageSize"
          @pagination="getBoxList"
        />
        <template #footer>
          <el-button @click="boxDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmBox">确认添加</el-button>
        </template>
      </el-dialog>
    </div>
    <div class="footer-global">
      <div class="btn-box">
        <div>
          <el-button @click="doShipment" type="primary" class="ml10">完成出库</el-button>
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

<script setup name="ShipmentOrderEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRefs} from "vue";
import {addShipmentOrder, getShipmentOrder, updateShipmentOrder, shipment} from "@/api/wms/shipmentOrder";
import {delShipmentOrderDetail} from "@/api/wms/shipmentOrderDetail";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import {numSub, generateNo} from '@/utils/ruoyi'
import InventoryDetailSelect from "@/views/components/InventoryDetailSelect.vue";
import {listInventoryDetailNoPage} from "@/api/wms/inventoryDetail";
import {listItemInstance} from "@/api/wms/itemInstance";
import {getBox, listBox} from "@/api/wms/box";

const {proxy} = getCurrentInstance();
const {wms_shipment_type, wms_item_instance_status, wms_box_status} = proxy.useDict("wms_shipment_type", "wms_item_instance_status", "wms_box_status");

const loading = ref(false)
const shipmentDetailSourceOptions = computed(() => ([
  { label: '库存', value: 'inventory' },
  { label: '单品', value: 'itemInstance' },
  { label: '整箱', value: 'box' }
]))
const initFormData = {
  id: undefined,
  shipmentOrderNo: undefined,
  shipmentOrderType: "2",
  merchantId: undefined,
  orderNo: undefined,
  receivableAmount: undefined,
  shipmentOrderStatus: 0,
  remark: undefined,
  warehouseId: undefined,
  areaId: undefined,
  totalQuantity: 0,
  details: [],
}
const inventorySelectRef = ref(null)
const selectedInventory = ref([])
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
    instanceCode: undefined,
    itemName: undefined,
    skuName: undefined
  }
})
const boxDialog = reactive({
  visible: false,
  loading: false,
  list: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  selection: [],
  query: {
    boxCode: undefined,
    boxName: undefined
  }
})
const data = reactive({
  form: {...initFormData},
  rules: {
    shipmentOrderNo: [
      {required: true, message: "出库单号不能为空", trigger: "blur"}
    ],
    shipmentOrderType: [
      {required: true, message: "出库类型不能为空", trigger: "change"}
    ],
    warehouseId: [
      {required: true, message: "请选择仓库", trigger: ['blur', 'change']}
    ],
  }
});
const {form, rules} = toRefs(data);
const cancel = async () => {
  await proxy?.$modal.confirm('确认取消编辑出库单吗？');
  close()
}
const close = () => {
  const obj = {path: "/shipmentOrder"};
  proxy?.$tab.closeOpenPage(obj);
}
const inventorySelectShow = ref(false)

// 选择商品 start
const showAddInventory = () => {
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
        {
          itemSku: {
            ...it.itemSku,
            item: it.item
          },
          skuId: it.skuId,
          amount: undefined,
          quantity: undefined,
          remainQuantity: it.remainQuantity,
          batchNo: it.batchNo,
          productionDate: it.productionDate,
          expirationDate: it.expirationDate,
          warehouseId: form.value.warehouseId,
          areaId: form.value.areaId ?? it.areaId,
          inventoryDetailId: it.id,
          areaName: useWmsStore().areaMap.get(form.value.areaId ?? it.areaId)?.areaName
        })
    }
  })
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
      && (it.batchNo || '') === (source.batchNo || '')
      && normalizeDateTime(it.productionDate) === normalizeDateTime(source.productionDate)
      && normalizeDateTime(it.expirationDate) === normalizeDateTime(source.expirationDate)
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
    skuId: payload.skuId,
    amount: payload.amount,
    quantity: payload.quantity,
    remainQuantity: payload.remainQuantity,
    batchNo: payload.batchNo,
    productionDate: payload.productionDate,
    expirationDate: payload.expirationDate,
    warehouseId: payload.warehouseId,
    areaId: payload.areaId,
    inventoryDetailId: payload.inventoryDetailId,
    areaName: payload.areaName,
    itemInstanceId: payload.itemInstanceId,
    instanceCode: payload.instanceCode,
    boxId: payload.boxId,
    boxCode: payload.boxCode,
    detailSourceType: payload.detailSourceType
  }
}
// 选择商品 end

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
          amount: it.amount,
          quantity: it.quantity,
          batchNo: it.batchNo,
          productionDate: it.productionDate,
          expirationDate: it.expirationDate,
          inventoryDetailId: it.inventoryDetailId,
          itemInstanceId: it.itemInstanceId,
          boxId: it.boxId,
          warehouseId: form.value.warehouseId,
          areaId: it.areaId
        }
      })
    }


    //('提交前校验',form.value)
    const params = {
      id: form.value.id,
      shipmentOrderNo: form.value.shipmentOrderNo,
      shipmentOrderType: form.value.shipmentOrderType,
      shipmentOrderStatus,
      merchantId: form.value.merchantId,
      orderNo: form.value.orderNo,
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
      return ElMessage.error('请选择商品')
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
        amount: it.amount,
        quantity: it.quantity,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        inventoryDetailId: it.inventoryDetailId,
        itemInstanceId: it.itemInstanceId,
        boxId: it.boxId,
        warehouseId: form.value.warehouseId,
        areaId: it.areaId
      }
    })

    //('提交前校验',form.value)
    const params = {
      id: form.value.id,
      shipmentOrderNo: form.value.shipmentOrderNo,
      shipmentOrderType: form.value.shipmentOrderType,
      merchantId: form.value.merchantId,
      orderNo: form.value.orderNo,
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

const route = useRoute();
onMounted(() => {
  const id = route.query && route.query.id;
  if (id) {
    loadDetail(id)
  } else {
    form.value.shipmentOrderNo = 'CK' + generateNo()
    refreshInventoryOptions()
  }
})


// 获取入库单详情
const loadDetail = (id) => {
  loading.value = true
  getShipmentOrder(id).then((response) => {
    if (response.data.details?.length) {
      response.data.details.forEach(detail => {
        detail.areaName = useWmsStore().areaMap.get(detail.areaId)?.areaName
        detail.detailSourceType = detail.itemInstanceId ? (detail.boxId ? 'box' : 'itemInstance') : 'inventory'
      })
      selectedInventory.value = response.data.details.map(it => {
        return {
          id: it.inventoryDetailId,
          areaId: it.areaId
        }
      })
    }
    form.value = {...response.data}
    inventorySelectRef.value.setWarehouseIdAndAreaId(form.value.warehouseId, form.value.areaId)
    return refreshInventoryOptions()
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleChangeWarehouse = (e) => {
  form.value.areaId = undefined
  form.value.details = []
  inventorySelectRef.value.setWarehouseIdAndAreaId(form.value.warehouseId, form.value.areaId)
  refreshInventoryOptions()
}

const handleChangeArea = (e) => {
  inventorySelectRef.value.setWarehouseIdAndAreaId(form.value.warehouseId, form.value.areaId)
  form.value.details = form.value.details.filter(it => it.areaId === e)
  selectedInventory.value = selectedInventory.value.filter(selected => selected.areaId === e)
  refreshInventoryOptions()
}

const handleChangeQuantity = () => {
  let sum = 0
  form.value.details.forEach(it => {
    if (it.quantity) {
      sum += Number(it.quantity)
    }
  })
  form.value.totalQuantity = sum
}

const handleAutoCalc = () => {
  let sum = undefined
  form.value.details.forEach(it => {
    if (it.amount >= 0) {
      if (!sum) {
        sum = 0
      }
      sum = numSub(sum, -Number(it.amount))
    }
  })
  form.value.receivableAmount = sum
}

const handleDeleteDetail = (row, index) => {
  if (row.id) {
    proxy.$modal.confirm('确认删除本条商品明细吗？如确认会立即执行！').then(function () {
      return delShipmentOrderDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      proxy.$modal.msgSuccess("删除成功");
    })
  } else {
    form.value.details.splice(index, 1)
  }
  if (row.detailSourceType === 'inventory') {
    const indexOfSelected = selectedInventory.value.findIndex(it => it.id === row.inventoryDetailId)
    if (indexOfSelected !== -1) {
      selectedInventory.value.splice(indexOfSelected, 1)
    }
  }
  handleChangeQuantity()
}

const showAddItemInstance = async () => {
  await refreshInventoryOptions()
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
    borrowed: 0,
    inBox: 0,
    ...itemInstanceDialog.query
  }).then((res) => {
    itemInstanceDialog.list = (res.rows || []).filter(it => it.instanceStatus !== 'disabled' && it.instanceStatus !== 'outbound')
    itemInstanceDialog.total = res.total || 0
  }).finally(() => {
    itemInstanceDialog.loading = false
  })
}

const handleItemInstanceSelectionChange = (selection) => {
  itemInstanceDialog.selection = selection
}

const isItemInstanceSelectable = (row) => {
  return !form.value.details.some(detail => detail.itemInstanceId === row.id)
}

const handleConfirmItemInstance = async () => {
  if (!itemInstanceDialog.selection.length) {
    ElMessage.error('请选择单品实例')
    return
  }
  await refreshInventoryOptions()
  const extraUsage = {}
  const newRows = []
  for (const item of itemInstanceDialog.selection) {
    const matchedInventory = matchInventoryDetail({
      skuId: item.skuId,
      areaId: item.areaId,
      batchNo: item.batchNo,
      productionDate: item.productionDate,
      expirationDate: item.expirationDate,
      quantity: 1
    }, extraUsage)
    if (!matchedInventory) {
      ElMessage.error(`单品 ${item.instanceCode} 未匹配到可用库存明细`)
      return
    }
    extraUsage[matchedInventory.id] = Number(extraUsage[matchedInventory.id] || 0) + 1
    newRows.push(createDetailRow({
      skuId: item.skuId,
      skuName: item.skuName,
      itemName: item.itemName,
      amount: undefined,
      quantity: 1,
      remainQuantity: matchedInventory.remainQuantity,
      batchNo: item.batchNo,
      productionDate: item.productionDate,
      expirationDate: item.expirationDate,
      warehouseId: form.value.warehouseId,
      areaId: item.areaId,
      inventoryDetailId: matchedInventory.id,
      areaName: useWmsStore().areaMap.get(item.areaId)?.areaName,
      itemInstanceId: item.id,
      instanceCode: item.instanceCode,
      detailSourceType: 'itemInstance'
    }))
  }
  form.value.details.push(...newRows)
  itemInstanceDialog.visible = false
  handleChangeQuantity()
}

const showAddBox = async () => {
  await refreshInventoryOptions()
  boxDialog.pageNum = 1
  boxDialog.visible = true
  boxDialog.selection = []
  getBoxList()
}

const getBoxList = () => {
  boxDialog.loading = true
  listBox({
    pageNum: boxDialog.pageNum,
    pageSize: boxDialog.pageSize,
    warehouseId: form.value.warehouseId,
    areaId: form.value.areaId,
    ...boxDialog.query
  }).then((res) => {
    boxDialog.list = (res.rows || []).filter(it => it.boxStatus !== 'disabled' && it.boxStatus !== 'outbound' && Number(it.itemCount || 0) > 0)
    boxDialog.total = res.total || 0
  }).finally(() => {
    boxDialog.loading = false
  })
}

const handleBoxSelectionChange = (selection) => {
  boxDialog.selection = selection
}

const isBoxSelectable = (row) => {
  return !form.value.details.some(detail => detail.boxId === row.id)
}

const handleConfirmBox = async () => {
  if (!boxDialog.selection.length) {
    ElMessage.error('请选择箱体')
    return
  }
  await refreshInventoryOptions()
  const extraUsage = {}
  const newRows = []
  for (const selectedBox of boxDialog.selection) {
    const detailRes = await getBox(selectedBox.id)
    const box = detailRes.data || {}
    const items = box.items || []
    if (!items.length) {
      ElMessage.error(`箱体 ${selectedBox.boxCode} 内无可出库单品`)
      return
    }
    for (const item of items) {
      if (form.value.details.some(detail => detail.itemInstanceId === item.id)) {
        ElMessage.error(`箱体 ${selectedBox.boxCode} 内存在已添加的单品 ${item.instanceCode}`)
        return
      }
      const matchedInventory = matchInventoryDetail({
        skuId: item.skuId,
        areaId: item.areaId,
        batchNo: item.batchNo,
        productionDate: item.productionDate,
        expirationDate: item.expirationDate,
        quantity: 1
      }, extraUsage)
      if (!matchedInventory) {
        ElMessage.error(`箱体 ${selectedBox.boxCode} 中单品 ${item.instanceCode} 未匹配到可用库存明细`)
        return
      }
      extraUsage[matchedInventory.id] = Number(extraUsage[matchedInventory.id] || 0) + 1
      newRows.push(createDetailRow({
        skuId: item.skuId,
        skuName: item.skuName,
        itemName: item.itemName,
        amount: undefined,
        quantity: 1,
        remainQuantity: matchedInventory.remainQuantity,
        batchNo: item.batchNo,
        productionDate: item.productionDate,
        expirationDate: item.expirationDate,
        warehouseId: form.value.warehouseId,
        areaId: item.areaId,
        inventoryDetailId: matchedInventory.id,
        areaName: useWmsStore().areaMap.get(item.areaId)?.areaName,
        itemInstanceId: item.id,
        instanceCode: item.instanceCode,
        boxId: selectedBox.id,
        boxCode: selectedBox.boxCode,
        detailSourceType: 'box'
      }))
    }
  }
  form.value.details.push(...newRows)
  boxDialog.visible = false
  handleChangeQuantity()
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
  gap: 8px;
}

.table-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}
</style>
