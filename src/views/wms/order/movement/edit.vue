<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" :class="{ 'is-view-mode': isViewMode }" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="调拨单基本信息">
        <el-form label-width="108px" :model="form" ref="movementForm" :rules="rules" :disabled="isViewMode">
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="调拨单号" prop="movementOrderNo">
                <el-input v-model="form.movementOrderNo" placeholder="保存后自动生成" style="width: 100%" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="调拨范围" prop="transferScope">
                <el-select v-model="form.transferScope" placeholder="请选择调拨范围" clearable style="width: 100%" @change="handleChangeTransferScope">
                  <el-option v-for="item in wms_transfer_scope" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="调拨类型" prop="movementType">
                <el-select v-model="form.movementType" placeholder="请选择调拨类型" clearable style="width: 100%">
                  <el-option v-for="item in wms_movement_type" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="原仓库" prop="sourceWarehouseId">
                <el-select v-model="form.sourceWarehouseId" placeholder="请选择源仓库" @change="handleChangeSourceWarehouse" filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="原库区" prop="sourceAreaId">
                <el-select
                  v-model="form.sourceAreaId"
                  placeholder="请选择原库区"
                  :disabled="!form.sourceWarehouseId"
                  clearable
                  filterable
                  @change="handleChangeSourceArea"
                  style="width: 100%!important;"
                >
                  <el-option
                    v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.sourceWarehouseId)"
                    :key="item.id"
                    :label="item.areaName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if="!isExternalTransfer">
              <el-form-item label="目标仓库" prop="targetWarehouseId">
                <el-select v-model="form.targetWarehouseId" placeholder="请选择目标仓库" @change="handleChangeTargetWarehouse" filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if="!isExternalTransfer">
              <el-form-item label="目标库区" prop="targetAreaId">
                <el-select
                  v-model="form.targetAreaId"
                  placeholder="请选择目标库区"
                  :disabled="!form.targetWarehouseId"
                  clearable
                  filterable
                  @change="handleChangeTargetArea"
                  style="width: 100%!important;"
                >
                  <el-option
                    v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.targetWarehouseId)"
                    :key="item.id"
                    :label="item.areaName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <template v-if="form.movementType === '通装'">
            <el-row :gutter="24">
              <el-col :span="6">
                <el-form-item label="调拨根据" prop="dispatchBasis">
                  <el-input v-model="form.dispatchBasis" placeholder="请输入调拨根据" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="调拨目的" prop="dispatchPurpose">
                  <el-input v-model="form.dispatchPurpose" placeholder="请输入调拨目的"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="发物单位" prop="fromUnit">
                  <el-input v-model="form.fromUnit" placeholder="请输入发物单位"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="收物单位" prop="toUnit">
                  <el-input v-model="form.toUnit" placeholder="请输入收物单位"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="6">
                <el-form-item label="到站" prop="toStation">
                  <el-input v-model="form.toStation" placeholder="请输入到站"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="通信地址" prop="contactAddress">
                  <el-input v-model="form.contactAddress" placeholder="请输入通信地址"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="调拨方式" prop="dispatchMode">
                  <el-input v-model="form.dispatchMode" placeholder="请输入调拨方式" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="有效日期" prop="effectiveDate">
                  <el-date-picker v-model="form.effectiveDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="6">
                <el-form-item label="发出日期" prop="issueDate">
                  <el-date-picker v-model="form.issueDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="18">
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
          </template>

          <template v-if="form.movementType === '专装'">
            <el-row :gutter="24">
              <el-col :span="6">
                <el-form-item label="调拨依据" prop="dispatchBasis">
                  <el-input v-model="form.dispatchBasis" placeholder="请输入调拨依据" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="调拨方式" prop="dispatchMode">
                  <el-input v-model="form.dispatchMode" placeholder="请输入调拨方式" />
                </el-form-item>
              </el-col>
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
            </el-row>
            <el-row :gutter="24">
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
            </el-row>
            <el-row :gutter="24">
              <el-col :span="6">
                <el-form-item label="调拨日期" prop="dispatchDate">
                  <el-date-picker v-model="form.dispatchDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="有效日期" prop="effectiveDate">
                  <el-date-picker v-model="form.effectiveDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" style="width: 100%" />
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
          </template>
        </el-form>
      </el-card>
      <el-card header="调拨明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8">
            <div>
              <el-tag type="info">仅支持选择当前源仓库/源库区下的在库器材实例</el-tag>
            </div>
            <el-popover
              placement="left"
              title="提示"
              :width="200"
              trigger="hover"
              :disabled="isExternalTransfer ? !!form.sourceWarehouseId : !!(form.sourceWarehouseId && form.targetWarehouseId)"
              :content="isExternalTransfer ? '请先选择源仓库！' : '请先选择源仓库和目标仓库！'"
            >
              <template #reference>
                <el-button type="primary" plain="plain" size="default" @click="showAddItem" icon="Plus"
                           :disabled="isExternalTransfer ? (!form.sourceWarehouseId || isViewMode) : (!form.sourceWarehouseId || !form.targetWarehouseId || isViewMode)">添加器材
                </el-button>
              </template>
            </el-popover>
          </div>
          <el-table
            :data="form.details"
            border
            empty-text="暂无调拨明细"
            @row-click="handleDetailRowClick"
            style="cursor: pointer"
          >
            <el-table-column label="器材实例编码" prop="instanceCode" min-width="160" show-overflow-tooltip />
            <el-table-column label="器材名称" min-width="140">
              <template #default="{ row }">
                <span>{{ row.itemName || row.itemSku?.item?.itemName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="源货位" min-width="120">
              <template #default="{ row }">
                <span>{{ row.sourceLocationName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="!isExternalTransfer" label="目标货架" min-width="140">
              <template #default="{ row }">
                <RackSelect v-model="row.targetRackId" :warehouse-id="form.targetWarehouseId" :area-id="row.targetAreaId || form.targetAreaId" :disabled="isViewMode" />
              </template>
            </el-table-column>
            <el-table-column v-if="!isExternalTransfer" label="目标货位" min-width="140">
              <template #default="{ row }">
                <LocationSelect
                  v-model="row.targetLocationId"
                  :warehouse-id="form.targetWarehouseId"
                  :area-id="row.targetAreaId || form.targetAreaId"
                  :rack-id="row.targetRackId"
                  :disabled="isViewMode"
                />
              </template>
            </el-table-column>
            <el-table-column label="调拨数量" prop="quantity" align="right" width="100">
              <template #default="{ row }">
                <el-statistic :value="Number(row.quantity || 0)" :precision="0"/>
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="140">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="请输入备注" :disabled="isViewMode" />
              </template>
            </el-table-column>
            <el-table-column v-if="!isViewMode" label="操作" width="88" align="right" fixed="right">
              <template #default="scope">
                <el-button icon="Delete" type="danger" plain size="small"
                           @click.stop="handleDeleteDetail(scope.row, scope.$index)" link>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <!-- 器材详情弹窗（点击明细行触发） -->
      <el-dialog v-model="itemDetailDialog.visible" title="器材详情" width="520px" append-to-body>
        <div v-loading="itemDetailDialog.loading">
          <el-descriptions v-if="itemDetailDialog.data" :column="2" border>
            <el-descriptions-item label="实例编码">{{ itemDetailDialog.data.instanceCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="器材名称">{{ itemDetailDialog.data.itemName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="器材编码">{{ itemDetailDialog.data.itemCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="规格型号">{{ itemDetailDialog.data.skuName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="计量单位">{{ itemDetailDialog.data.unit || '-' }}</el-descriptions-item>
            <el-descriptions-item label="产品标识">{{ itemDetailDialog.data.productIdentifier || '-' }}</el-descriptions-item>
            <el-descriptions-item label="质量等级">{{ itemDetailDialog.data.qualityGrade || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ itemDetailDialog.data.instanceStatus || '-' }}</el-descriptions-item>
          </el-descriptions>
          <el-empty v-else-if="!itemDetailDialog.loading" description="暂无器材详情" />
        </div>
        <template #footer>
          <el-button @click="itemDetailDialog.visible = false">关闭</el-button>
        </template>
      </el-dialog>
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
              :warehouse-id="form.sourceWarehouseId"
              :area-id="form.sourceAreaId"
              placeholder="货架"
              style="width: 140px"
              @change="handleItemInstanceQueryChange"
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
        <el-table
          v-loading="itemInstanceDialog.loading"
          :data="itemInstanceDialog.list"
          @selection-change="handleItemInstanceSelectionChange"
          border
          row-key="id"
        >
          <el-table-column type="selection" width="55" :selectable="isItemInstanceSelectable" />
          <el-table-column label="器材实例编码" prop="instanceCode" min-width="160" />
          <el-table-column label="器材名称" prop="itemName" min-width="160" />
          <el-table-column label="器材规格" prop="skuName" min-width="160" />
          <el-table-column label="库区" prop="areaName" width="140" />
          <el-table-column label="货架" prop="rackName" width="120" />
          <el-table-column label="货位" prop="locationName" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <span>{{ row.instanceStatus || '-' }}</span>
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
import {ElMessage} from "element-plus";
import {useRoute} from "vue-router";
import useTagsViewStore from "@/store/modules/tagsView";
import {useWmsStore} from '@/store/modules/wms'
import {numSub} from '@/utils/ruoyi'
import {listInventoryDetailNoPage} from "@/api/wms/inventoryDetail";
import {listItemInstance, getItemInstanceByCode} from "@/api/wms/itemInstance";
import RackSelect from "@/views/components/RackSelect.vue";
import LocationSelect from "@/views/components/LocationSelect.vue";

const {proxy} = getCurrentInstance();
const route = useRoute();
const tagsViewStore = useTagsViewStore();
const isViewMode = computed(() => route.query.mode === 'view');
const {wms_movement_type, wms_transfer_scope} = proxy.useDict(
  "wms_movement_type",
  "wms_transfer_scope"
);

const loading = ref(false)
const initFormData = {
  id: undefined,
  movementOrderNo: undefined,
  movementType: undefined,
  transferScope: '库外调拨',
  dispatchBasis: undefined,
  dispatchPurpose: undefined,
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
  movementOrderStatus: 0,
  remark: undefined,
  sourceWarehouseId: undefined,
  sourceAreaId: undefined,
  targetWarehouseId: undefined,
  targetAreaId: undefined,
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
    unshippedOnly: true,
    rackId: undefined,
    instanceCode: undefined,
    itemName: undefined,
    skuName: undefined
  }
})

// 器材详情弹窗（点击明细行触发）
const itemDetailDialog = reactive({
  visible: false,
  loading: false,
  data: null
})

const handleDetailRowClick = async (row) => {
  itemDetailDialog.visible = true
  itemDetailDialog.loading = true
  itemDetailDialog.data = null
  try {
    if (row.instanceCode) {
      const res = await getItemInstanceByCode(row.instanceCode)
      if (res.data) {
        itemDetailDialog.data = {
          itemName: res.data.itemName ?? row.itemName ?? row.itemSku?.item?.itemName,
          instanceCode: res.data.instanceCode ?? row.instanceCode,
          itemCode: res.data.itemCode ?? row.itemCode ?? row.itemSku?.item?.itemCode,
          skuName: res.data.skuName ?? row.skuName ?? row.itemSku?.skuName,
          unit: res.data.unit ?? row.unit ?? row.itemSku?.item?.unit,
          productIdentifier: res.data.productIdentifier ?? row.productIdentifier ?? row.itemSku?.productIdentifier,
          qualityGrade: res.data.qualityGrade ?? row.qualityGrade ?? row.itemSku?.qualityGrade,
          instanceStatus: res.data.instanceStatus ?? '-'
        }
        return
      }
    }
    itemDetailDialog.data = {
      itemName: row.itemName ?? row.itemSku?.item?.itemName,
      instanceCode: row.instanceCode,
      itemCode: row.itemCode ?? row.itemSku?.item?.itemCode,
      skuName: row.skuName ?? row.itemSku?.skuName,
      unit: row.unit ?? row.itemSku?.item?.unit,
      productIdentifier: row.productIdentifier ?? row.itemSku?.productIdentifier,
      qualityGrade: row.qualityGrade ?? row.itemSku?.qualityGrade,
      instanceStatus: '-'
    }
  } catch (e) {
    itemDetailDialog.data = {
      itemName: row.itemName ?? row.itemSku?.item?.itemName,
      instanceCode: row.instanceCode,
      itemCode: row.itemCode ?? row.itemSku?.item?.itemCode,
      skuName: row.skuName ?? row.itemSku?.skuName,
      unit: row.unit ?? row.itemSku?.item?.unit,
      productIdentifier: row.productIdentifier ?? row.itemSku?.productIdentifier,
      qualityGrade: row.qualityGrade ?? row.itemSku?.qualityGrade,
      instanceStatus: '-'
    }
  } finally {
    itemDetailDialog.loading = false
  }
}
const data = reactive({
  form: {...initFormData},
  rules: {
    sourceWarehouseId: [
      {required: true, message: "请选择源仓库", trigger: ['blur', 'change']}
    ],
    targetWarehouseId: [
      {required: true, validator: (rule, value, callback) => {
        if (!isExternalTransfer.value && !value) {
          callback(new Error('请选择目标仓库'))
        } else {
          callback()
        }
      }, trigger: ['blur', 'change']}
    ],
    movementType: [
      {required: true, message: "请选择调拨类型", trigger: ['blur', 'change']}
    ],
    transferScope: [
      {required: true, message: "请选择调拨范围", trigger: ['blur', 'change']}
    ],
  }
});
const {form, rules} = toRefs(data);

// 库外调拨计算属性
const isExternalTransfer = computed(() => form.value.transferScope === '库外调拨');

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

const calcLineAmount = (quantity, unitPrice) => {
  const qty = Number(quantity || 0)
  const price = Number(unitPrice || 0)
  return qty && price ? Number((qty * price).toFixed(2)) : 0
}

const syncMovementDetail = (detail) => {
  const unitPrice = detail.unitPrice
  return {
    ...detail,
    itemCode: detail.itemCode ?? detail.itemSku?.item?.itemCode,
    itemName: detail.itemName ?? detail.itemSku?.item?.itemName,
    skuName: detail.skuName ?? detail.itemSku?.skuName,
    unit: detail.unit ?? detail.itemSku?.item?.unit,
    productIdentifier: detail.productIdentifier ?? detail.itemSku?.productIdentifier,
    qualityGrade: detail.qualityGrade ?? detail.itemSku?.qualityGrade,
    instanceCode: detail.instanceCode ?? detail.itemInstance?.instanceCode ?? detail.inventoryDetail?.instanceCode,
    sourceRackId: detail.sourceRackId ?? detail.inventoryDetail?.rackId,
    sourceRackName: detail.sourceRackName ?? detail.rackName,
    sourceLocationId: detail.sourceLocationId ?? detail.inventoryDetail?.locationId,
    sourceLocationName: detail.sourceLocationName ?? detail.locationName,
    targetRackId: detail.targetRackId,
    targetLocationId: detail.targetLocationId,
    remainQuantity: detail.remainQuantity ?? detail.inventoryDetail?.remainQuantity,
    unitPrice,
    lineAmount: detail.lineAmount ?? calcLineAmount(detail.quantity, unitPrice)
  }
}

const handleDetailChange = (row) => {
  row.lineAmount = calcLineAmount(row.quantity, row.unitPrice)
}

// 选择器材 start
const refreshInventoryOptions = async () => {
  if (!form.value.sourceWarehouseId) {
    inventoryDetailOptions.value = []
    return
  }
  const res = await listInventoryDetailNoPage({
    warehouseId: form.value.sourceWarehouseId,
    areaId: form.value.sourceAreaId
  })
  inventoryDetailOptions.value = res.data || []
}

const matchInventoryDetailByItemInstance = (item) => {
  return inventoryDetailOptions.value.find(detail => {
    return detail.instanceCode === item.instanceCode
      && detail.warehouseId === form.value.sourceWarehouseId
      && (!form.value.sourceAreaId || detail.areaId === form.value.sourceAreaId)
      && Number(detail.remainQuantity || 0) > 0
  })
}

const addItemInstancesToMovement = async (items) => {
  if (!items?.length) {
    return
  }
  await refreshInventoryOptions()
  const newRows = []
  for (const item of items) {
    if (form.value.details.some(detail => detail.instanceCode === item.instanceCode)) {
      throw new Error(`器材实例编码 ${item.instanceCode} 已添加`)
    }
    const matchedInventory = matchInventoryDetailByItemInstance(item)
    if (!matchedInventory) {
      throw new Error(`器材实例编码 ${item.instanceCode} 未匹配到当前源位置的可用库存明细`)
    }
    newRows.push(createMovementDetailRow(item, matchedInventory))
  }
  form.value.details.push(...newRows.map(it => syncMovementDetail(it)))
  handleChangeQuantity()
}

const createMovementDetailRow = (item, matchedInventory) => {
  return {
    skuId: item.skuId,
    itemCode: item.itemCode,
    itemName: item.itemName,
    skuName: item.skuName,
    unit: item.unit,
    productIdentifier: item.productIdentifier,
    qualityGrade: item.qualityGrade,
    instanceCode: item.instanceCode,
    quantity: 1,
    remainQuantity: matchedInventory.remainQuantity,
    sourceWarehouseId: form.value.sourceWarehouseId,
    sourceAreaId: matchedInventory.areaId,
    sourceAreaName: item.areaName ?? useWmsStore().areaMap.get(matchedInventory.areaId)?.areaName,
    sourceRackId: matchedInventory.rackId,
    sourceRackName: matchedInventory.rackName ?? item.rackName,
    sourceLocationId: matchedInventory.locationId,
    sourceLocationName: matchedInventory.locationName ?? item.locationName,
    inventoryDetailId: matchedInventory.id,
    targetWarehouseId: form.value.targetWarehouseId,
    targetAreaId: form.value.targetAreaId,
    targetRackId: undefined,
    targetLocationId: undefined,
    unitPrice: matchedInventory.unitPrice
  }
}

const showAddItem = async () => {
  await refreshInventoryOptions()
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
    warehouseId: form.value.sourceWarehouseId,
    areaId: form.value.sourceAreaId,
    instanceStatus: '在库',
    ...itemInstanceDialog.query
  }).then((res) => {
    itemInstanceDialog.list = res.rows || []
    itemInstanceDialog.total = res.total || 0
  }).finally(() => {
    itemInstanceDialog.loading = false
  })
}

const handleItemInstanceQueryChange = () => {
  itemInstanceDialog.pageNum = 1
  getItemInstanceList()
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
    await addItemInstancesToMovement(itemInstanceDialog.selection)
    itemInstanceDialog.visible = false
  } catch (e) {
    ElMessage.error(e?.message || '器材实例编码添加失败')
  }
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
      // 构建参数
      details = form.value.details.map(it => {
        return {
          id: it.id,
          movementOrderId: form.value.id,
          skuId: it.skuId,
          instanceCode: it.instanceCode,
          itemCode: it.itemCode,
          itemName: it.itemName,
          skuName: it.skuName,
          unit: it.unit,
          productIdentifier: it.productIdentifier,
          qualityGrade: it.qualityGrade,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          lineAmount: it.lineAmount,
          remark: it.remark,
          inventoryDetailId: it.inventoryDetailId,
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
      transferScope: form.value.transferScope,
      movementType: form.value.movementType,
      dispatchBasis: form.value.dispatchBasis,
      dispatchPurpose: form.value.dispatchPurpose,
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
      movementOrderStatus,
      remark: form.value.remark,
      totalQuantity: form.value.totalQuantity,
      sourceWarehouseId: form.value.sourceWarehouseId,
      sourceAreaId: form.value.sourceAreaId,
      targetWarehouseId: isExternalTransfer.value ? undefined : form.value.targetWarehouseId,
      targetAreaId: isExternalTransfer.value ? undefined : form.value.targetAreaId,
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
    // 构建参数
    const details = form.value.details.map(it => {
      return {
        id: it.id,
        movementOrderId: form.value.id,
        skuId: it.skuId,
        instanceCode: it.instanceCode,
        itemCode: it.itemCode,
        itemName: it.itemName,
        skuName: it.skuName,
        unit: it.unit,
        productIdentifier: it.productIdentifier,
        qualityGrade: it.qualityGrade,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineAmount: it.lineAmount,
        inventoryDetailId: it.inventoryDetailId,
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
      transferScope: form.value.transferScope,
      movementType: form.value.movementType,
      dispatchBasis: form.value.dispatchBasis,
      dispatchPurpose: form.value.dispatchPurpose,
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
      remark: form.value.remark,
      totalQuantity: form.value.totalQuantity,
      sourceWarehouseId: form.value.sourceWarehouseId,
      sourceAreaId: form.value.sourceAreaId,
      targetWarehouseId: isExternalTransfer.value ? undefined : form.value.targetWarehouseId,
      targetAreaId: isExternalTransfer.value ? undefined : form.value.targetAreaId,
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
  if (route.query.mode === 'view') {
    route.meta.title = '查看调拨单'
    tagsViewStore.updateVisitedView(route)
  }
  const id = route.query && route.query.id;
  if (id) {
    loadDetail(id)
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
    }
    form.value = {...response.data}
    form.value.details = (response.data.details || []).map(detail => syncMovementDetail(detail))
    return refreshInventoryOptions()
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleChangeSourceWarehouse = (e) => {
  form.value.sourceAreaId = undefined
  form.value.details = []
  refreshInventoryOptions()
}

const handleChangeSourceArea = (e) => {
  form.value.details = e ? form.value.details.filter(it => it.sourceAreaId === e) : form.value.details
  refreshInventoryOptions()
}

const handleChangeTransferScope = () => {
  if (isExternalTransfer.value) {
    // 切换到库外调拨：清空目标仓库/库区
    form.value.targetWarehouseId = undefined
    form.value.targetAreaId = undefined
    form.value.details.forEach(it => {
      it.targetWarehouseId = undefined
      it.targetAreaId = undefined
      it.targetRackId = undefined
      it.targetLocationId = undefined
    })
  }
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
    handleChangeQuantity()
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

.form-tip,
.table-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.form-tip {
  margin: 0 0 12px;
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

</style>


