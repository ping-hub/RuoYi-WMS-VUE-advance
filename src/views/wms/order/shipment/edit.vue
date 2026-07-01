<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" :class="{ 'is-view-mode': isViewMode }" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="出库单基本信息">
        <el-form label-width="108px" :model="form" ref="shipmentForm" :rules="rules" :disabled="formReadonly">
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="出库单号" prop="shipmentOrderNo">
                <el-input v-model="form.shipmentOrderNo" placeholder="保存后自动生成" style="width: 100%" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="出库类型" prop="shipmentOrderType">
                <el-select v-model="form.shipmentOrderType" placeholder="请选择出库类型" clearable style="width: 100%" :disabled="isFromMovement">
                  <el-option v-for="item in wms_shipment_type" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
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
          </el-row>
          <el-row :gutter="24">
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
              <el-form-item label="出库日期" prop="shipmentDate">
                <el-date-picker v-model="form.shipmentDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" style="width: 100%" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="approverId">
                <template #label><span style="color: #f56c6c">*</span> 审批人</template>
                <el-select v-model="form.approverId" placeholder="请选择审批人" filterable clearable style="width: 100%" @change="handleApproverFieldChange">
                  <el-option v-for="u in userList" :key="u.userId" :label="u.nickName" :value="u.userId" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="form.remark"
                  placeholder="备注...100个字符以内"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 已审批/已出库：审批人+操作人只读 -->
          <el-row :gutter="24" v-if="[2, 3].includes(Number(form.shipmentOrderStatus)) && (form.approverId || form.executorId)">
            <el-col :span="6" v-if="form.executorId">
              <el-form-item label="操作人">
                <el-input :model-value="getNickNameById(form.executorId)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 已驳回：显示驳回原因 -->
          <el-row :gutter="24" v-if="Number(form.shipmentOrderStatus) === -2 && form.approveRemark">
            <el-col :span="12">
              <el-form-item label="驳回原因">
                <el-input :model-value="form.approveRemark" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 关联调拨单 -->
          <el-row :gutter="24" v-if="isFromMovement">
            <el-col :span="6">
              <el-form-item label="关联调拨单">
                <el-button link type="primary" @click="goToMovementOrder">{{ form.basisNo || '查看调拨单' }}</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <!-- 待审批：操作人 + 驳回原因（在 el-form 外部，不受 disabled 影响） -->
        <el-row :gutter="24" v-if="form.shipmentOrderStatus == 1 && !isViewMode" class="approval-controls">
          <el-col :span="6">
            <div class="approval-form-item">
              <label><span style="color: #f56c6c">*</span> 操作人：</label>
              <el-select v-model="form.executorId" placeholder="请指定操作人" filterable clearable style="width: 100%" @change="handleExecutorFieldChange">
                <el-option v-for="u in userList" :key="u.userId" :label="u.nickName" :value="u.userId" />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" v-if="rejectRemarkVisible">
            <div class="approval-form-item">
              <label>驳回原因：</label>
              <el-input v-model="rejectRemark" placeholder="请输入驳回原因" />
            </div>
          </el-col>
        </el-row>
      </el-card>
      <el-card header="器材明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8">
            <div>
              <el-tag type="info" v-if="isFromMovement">由调拨单自动创建，器材明细不可编辑</el-tag>
              <el-tag type="info" v-else>支持“选择器材实例”或扫码枪扫二维码直接新增，当前只允许选择在库实例</el-tag>
            </div>
            <div class="add-actions">
              <el-button type="primary" plain size="default" @click="showAddItemInstance" icon="Tickets" :disabled="formReadonly || isFromMovement">
                选择器材实例
              </el-button>
            </div>
          </div>
          <el-table
            :data="form.details"
            border
            empty-text="暂无器材明细"
            @row-click="handleDetailRowClick"
            style="cursor: pointer"
          >
            <el-table-column label="器材实例编码" prop="instanceCode" min-width="160" show-overflow-tooltip />
            <el-table-column label="器材名称" min-width="160">
              <template #default="{ row }">
                <span>{{ row.itemName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="仓库" min-width="120">
              <template #default="{ row }">
                <span>{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="库区" min-width="120">
              <template #default="{ row }">
                <span>{{ row.areaName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="货架" min-width="120">
              <template #default="{ row }">
                <span>{{ row.rackName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="货位" min-width="120">
              <template #default="{ row }">
                <span>{{ row.locationName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="请输入备注" :disabled="formReadonly" />
              </template>
            </el-table-column>
            <el-table-column v-if="!formReadonly && !isFromMovement" label="操作" width="88" align="right">
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
            <el-descriptions-item label="质量等级"><dict-tag :options="wms_quality_grade" :value="itemDetailDialog.data.qualityGrade" v-if="itemDetailDialog.data.qualityGrade" /><span v-else>-</span></el-descriptions-item>
            <el-descriptions-item label="状态">{{ itemDetailDialog.data.instanceStatus || '-' }}</el-descriptions-item>
          </el-descriptions>
          <el-empty v-else-if="!itemDetailDialog.loading" description="暂无器材详情" />
        </div>
        <template #footer>
          <el-button @click="itemDetailDialog.visible = false">关闭</el-button>
        </template>
      </el-dialog>
      <el-dialog v-model="itemInstanceDialog.visible" title="选择器材实例" width="1100px" append-to-body>
        <el-form :model="itemInstanceDialog.query" label-width="auto" class="item-instance-search-form">
          <el-row :gutter="12">
            <el-col :span="6">
              <el-form-item label="仓库">
                <el-select
                  v-model="itemInstanceDialog.query.warehouseId"
                  placeholder="全部仓库"
                  clearable filterable
                  style="width: 100%"
                  @change="handleDialogWarehouseChange"
                >
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="库区">
                <el-select
                  v-model="itemInstanceDialog.query.areaId"
                  placeholder="全部库区"
                  clearable filterable
                  style="width: 100%"
                  @change="getItemInstanceList"
                >
                  <el-option v-for="item in (!itemInstanceDialog.query.warehouseId ? useWmsStore().areaList : useWmsStore().areaList.filter(it => it.warehouseId === itemInstanceDialog.query.warehouseId))"
                             :key="item.id" :label="item.areaName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="货架">
                <RackSelect
                  v-model="itemInstanceDialog.query.rackId"
                  :warehouse-id="itemInstanceDialog.query.warehouseId"
                  :area-id="itemInstanceDialog.query.areaId"
                  placeholder="全部货架"
                  style="width: 100%"
                  @change="getItemInstanceList"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="器材名称">
                <el-input v-model="itemInstanceDialog.query.itemName" placeholder="器材名称" clearable style="width: 100%" @keyup.enter="getItemInstanceList" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="12">
            <el-col :span="6">
              <el-form-item label="器材编码">
                <el-input v-model="itemInstanceDialog.query.itemCode" placeholder="器材编码" clearable style="width: 100%" @keyup.enter="getItemInstanceList" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="器材实例编码">
                <el-input v-model="itemInstanceDialog.query.instanceCode" placeholder="器材实例编码" clearable style="width: 100%" @keyup.enter="getItemInstanceList" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; height: 100%;">
                <el-button type="primary" @click="getItemInstanceList" icon="Search">查询</el-button>
                <el-button @click="resetItemInstanceQuery" icon="Refresh">重置</el-button>
              </div>
            </el-col>
          </el-row>
        </el-form>
        <el-table v-loading="itemInstanceDialog.loading" :data="itemInstanceDialog.list" @selection-change="handleItemInstanceSelectionChange" border row-key="id">
          <el-table-column type="selection" width="55" :selectable="isItemInstanceSelectable" />
          <el-table-column label="仓库" width="120">
            <template #default="{ row }">
              <span>{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库区" width="120">
            <template #default="{ row }">
              <span>{{ useWmsStore().areaMap.get(row.areaId)?.areaName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="器材实例编码" prop="instanceCode" min-width="160" />
          <el-table-column label="器材编码" prop="itemCode" min-width="120" show-overflow-tooltip />
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
        <!-- 草稿/已驳回：暂存 + 提交审批 + 作废 -->
        <div v-if="!isViewMode && [0, -2].includes(Number(form.shipmentOrderStatus))">
          <el-button @click="save" type="primary">暂存</el-button>
          <el-button @click="handleSubmitApproval" type="warning">提交审批</el-button>
          <el-button @click="handleVoid" type="danger" v-if="form.id">作废</el-button>
        </div>
        <!-- 待审批：审批通过 + 驳回 -->
        <div v-if="!isViewMode && form.shipmentOrderStatus == 1">
          <el-button @click="handleApproveInEdit" type="success">审批通过</el-button>
          <el-button @click="handleRejectInEdit" type="danger">{{ rejectRemarkVisible ? '确认驳回' : '驳回' }}</el-button>
        </div>
        <!-- 已审批：完成出库（仅指定操作人可操作） -->
        <div v-if="!isViewMode && form.shipmentOrderStatus == 2 && isCurrentExecutor">
          <el-button @click="doShipment" type="primary">完成出库</el-button>
        </div>
        <div>
          <el-button @click="cancel" class="mr10">{{ isViewMode ? '关闭' : '取消' }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="ShipmentOrderEdit">
import {computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, toRefs} from "vue";
import {addShipmentOrder, getShipmentOrder, updateShipmentOrder, shipment, submitForApproval, approveOrder, rejectOrder, voidOrder} from "@/api/wms/shipmentOrder";
import {getUserSelectList} from "@/api/wms/common";
import {delShipmentOrderDetail} from "@/api/wms/shipmentOrderDetail";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import useUserStore from "@/store/modules/user";
import useTagsViewStore from "@/store/modules/tagsView";
import {useWmsStore} from '@/store/modules/wms'
import {numSub, parseTime} from '@/utils/ruoyi'
import {listInventoryDetailNoPage} from "@/api/wms/inventoryDetail";
import {getItemInstanceByCode, listItemInstance} from "@/api/wms/itemInstance";
import RackSelect from "@/views/components/RackSelect.vue";
import { resolveRoutePath } from '@/utils/routeResolver'

const {proxy} = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const tagsViewStore = useTagsViewStore();
// 当前用户是否为指定操作人
const isCurrentExecutor = computed(() => {
  if (!userStore.id || !form.value.executorId) return false
  return String(userStore.id) === String(form.value.executorId)
})
// 根据用户ID查找昵称
const getNickNameById = (userId) => {
  if (!userId) return '-'
  const u = userList.value.find(x => String(x.userId) === String(userId))
  return u ? u.nickName : '-'
}
const isViewMode = computed(() => route.query.mode === 'view');
// 是否由调拨单自动创建
const isFromMovement = computed(() => !!form.value.movementOrderId);
// 跳转关联调拨单
const goToMovementOrder = () => {
  if (!form.value.movementOrderId) return
  const path = resolveRoutePath(router, { preferredPaths: ['/movementOrderEdit'], titleKeywords: ['调拨'] }) || '/movementOrderEdit'
  router.push({ path, query: { id: form.value.movementOrderId, mode: 'view', returnFullPath: route.fullPath } })
}
// 表单只读：查看模式 或 非草稿/已驳回状态
const formReadonly = computed(() => {
  if (isViewMode.value) return true
  const s = Number(form.value.shipmentOrderStatus)
  return !isNaN(s) && s !== 0 && s !== -2
})
const statusLabel = computed(() => {
  if (!wms_shipment_status.value?.length) return ''
  const item = wms_shipment_status.value.find(i => String(i.value) === String(form.value.shipmentOrderStatus))
  return item?.label || ''
})
const {wms_item_instance_status, wms_shipment_type, wms_shipment_status, wms_quality_grade} = proxy.useDict(
  "wms_item_instance_status",
  "wms_shipment_type",
  "wms_shipment_status",
  "wms_quality_grade"
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
  totalQuantity: 0,
  details: [],
  workflowLogs: [],
  applicantId: undefined,
  applicantName: undefined,
  submitTime: undefined,
  approverId: undefined,
  approverName: undefined,
  approveTime: undefined,
  approveRemark: undefined,
  executorId: undefined,
  executorName: undefined,
  executeTime: undefined,
  movementOrderId: undefined,
}
const inventoryDetailCache = ref(new Map())
const userList = ref([])
const rejectRemark = ref('')
const rejectRemarkVisible = ref(false)
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
    itemCode: undefined,
    skuName: undefined
  }
})
const shipmentScanBuffer = reactive({
  value: '',
  lastTime: 0,
  pending: false
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
          itemName: res.data.itemName ?? row.itemName,
          instanceCode: res.data.instanceCode ?? row.instanceCode,
          itemCode: res.data.itemCode ?? row.itemCode,
          skuName: res.data.skuName ?? row.skuName,
          unit: res.data.unit ?? row.unit,
          productIdentifier: res.data.productIdentifier ?? row.productIdentifier,
          qualityGrade: res.data.qualityGrade ?? row.qualityGrade,
          instanceStatus: res.data.instanceStatus ?? '-'
        }
        return
      }
    }
    itemDetailDialog.data = {
      itemName: row.itemName,
      instanceCode: row.instanceCode,
      itemCode: row.itemCode,
      skuName: row.skuName,
      unit: row.unit,
      productIdentifier: row.productIdentifier,
      qualityGrade: row.qualityGrade,
      instanceStatus: '-'
    }
  } catch (e) {
    itemDetailDialog.data = {
      itemName: row.itemName,
      instanceCode: row.instanceCode,
      itemCode: row.itemCode,
      skuName: row.skuName,
      unit: row.unit,
      productIdentifier: row.productIdentifier,
      qualityGrade: row.qualityGrade,
      instanceStatus: '-'
    }
  } finally {
    itemDetailDialog.loading = false
  }
}
const data = reactive({
  form: {...initFormData},
  rules: {
    shipmentOrderType: [
      {required: true, message: "出库类型不能为空", trigger: "change"}
    ],
  }
});
const {form, rules} = toRefs(data);
const cancel = async () => {
  if (formReadonly.value) {
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
    qualityGrade: detail.qualityGrade,
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
  let inventory = null
  for (const list of inventoryDetailCache.value.values()) {
    inventory = list.find(it => it.id === inventoryDetailId)
    if (inventory) break
  }
  if (!inventory) return 0
  const usedQuantity = form.value.details.reduce((sum, detail) => {
    if (detail.inventoryDetailId === inventoryDetailId) {
      return sum + Number(detail.quantity || 0)
    }
    return sum
  }, 0)
  return Number(inventory.remainQuantity || 0) - usedQuantity - Number(extraUsage[inventoryDetailId] || 0)
}

const refreshInventoryOptions = async (warehouseId, areaId) => {
  if (!warehouseId) {
    inventoryDetailCache.value = new Map()
    return
  }
  const cacheKey = warehouseId + '_' + (areaId || '')
  if (inventoryDetailCache.value.has(cacheKey)) return
  const res = await listInventoryDetailNoPage({ warehouseId, areaId })
  inventoryDetailCache.value.set(cacheKey, res.data || [])
}

const matchInventoryDetail = (source, extraUsage = {}) => {
  const targetWarehouseId = source.warehouseId
  const targetAreaId = source.areaId
  const cachedKey = targetWarehouseId + '_' + (targetAreaId || '')
  if (!inventoryDetailCache.value.has(cachedKey)) {
    return null
  }
  const candidates = inventoryDetailCache.value.get(cachedKey).filter(it => {
    return it.skuId === source.skuId
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

const doSave = (shipmentOrderStatus = 0, onSuccess = null) => {
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
          warehouseId: it.warehouseId,
          areaId: it.areaId,
          rackId: it.rackId,
          locationId: it.locationId,
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
      approverId: form.value.approverId,
      approverName: form.value.approverName,
      details: details
    }
    if (params.id) {
      updateShipmentOrder(params).then((res) => {
        if (res.code === 200) {
          if (onSuccess) onSuccess()
          else { ElMessage.success(res.msg); close() }
        } else {
          ElMessage.error(res.msg)
        }
      })
    } else {
      addShipmentOrder(params).then((res) => {
        if (res.code === 200) {
          // 后端返回新建ID，更新到表单
          if (res.data) form.value.id = res.data
          if (onSuccess) onSuccess()
          else { ElMessage.success(res.msg); close() }
        } else {
          ElMessage.error(res.msg)
        }
      })
    }
  })
}


const updateToInvalid = async () => {
  // 已废弃，保留兼容
  await handleVoid()
}

/** 提交审批 */
const handleSubmitApproval = async () => {
  if (!form.value.approverId) {
    return ElMessage.warning('请先选择审批人')
  }
  await proxy?.$modal.confirm('确认提交审批吗？');
  const doSubmit = (id) => {
    submitForApproval(id, form.value.approverId, form.value.approverName).then((res) => {
      if (res.code === 200) {
        ElMessage.success('提交成功')
        close()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }
  if (!form.value.id) {
    doSave(0, () => doSubmit(form.value.id))
  } else {
    doSubmit(form.value.id)
  }
}

/** 审批人下拉变化时同步 approverName */
const handleApproverFieldChange = (userId) => {
  const u = userList.value.find(x => x.userId === userId)
  form.value.approverName = u ? u.nickName : ''
}

/** 操作人下拉变化时同步 executorName */
const handleExecutorFieldChange = (userId) => {
  const u = userList.value.find(x => x.userId === userId)
  form.value.executorName = u ? u.nickName : ''
}

/** 审批通过（编辑页内） */
const handleApproveInEdit = async () => {
  if (!form.value.executorId) {
    return ElMessage.warning('请先指定操作人')
  }
  await proxy?.$modal.confirm('确认审批通过吗？');
  // 清空驳回原因，避免误传
  rejectRemark.value = ''
  rejectRemarkVisible.value = false
  approveOrder(form.value.id, null, form.value.executorId, form.value.executorName).then((res) => {
    if (res.code === 200) {
      ElMessage.success('审批通过')
      close()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

/** 驳回（编辑页内） */
const handleRejectInEdit = () => {
  if (!rejectRemarkVisible.value) {
    rejectRemarkVisible.value = true
    return
  }
  rejectOrder(form.value.id, rejectRemark.value).then((res) => {
    if (res.code === 200) {
      ElMessage.success('已驳回')
      close()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

/** 作废 */
const handleVoid = async () => {
  await proxy?.$modal.confirm('确认作废出库单吗？');
  voidOrder(form.value.id).then((res) => {
    if (res.code === 200) {
      ElMessage.success('已作废')
      close()
    } else {
      ElMessage.error(res.msg)
    }
  })
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
        areaId: it.areaId,
        rackId: it.rackId,
        locationId: it.locationId
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
      shipmentDate: parseTime(new Date(), '{y}-{m}-{d}'),
      remark: form.value.remark,
      receivableAmount: form.value.receivableAmount,
      totalQuantity: form.value.totalQuantity,
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
  // 查看模式下修改标签页标题
  if (route.query.mode === 'view') {
    route.meta.title = '查看出库单'
    tagsViewStore.updateVisitedView(route)
  }
  window.addEventListener('keydown', handleShipmentScanKeydown)
  // 加载用户列表（审批人下拉用），加载完后再加载详情以确保回显
  const loadUserListPromise = getUserSelectList().then(res => {
    userList.value = (res.data || []).map(u => ({ userId: u.userId, nickName: u.nickName, userName: u.userName }))
  })
  const id = route.query && route.query.id;
  if (id) {
    loadUserListPromise.then(() => loadDetail(id))
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
    // 不再加载全量库存明细：已有的明细数据不需要 inventoryDetailOptions，
    // 添加新器材时会由 showAddItemInstance / addItemInstancesToShipment 按需加载
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleDialogWarehouseChange = () => {
  itemInstanceDialog.query.areaId = undefined
  itemInstanceDialog.query.rackId = undefined
  getItemInstanceList()
}

const resetItemInstanceQuery = () => {
  Object.assign(itemInstanceDialog.query, {
    warehouseId: undefined,
    areaId: undefined,
    rackId: undefined,
    instanceCode: undefined,
    itemName: undefined,
    itemCode: undefined,
    skuName: undefined
  })
  itemInstanceDialog.pageNum = 1
  getItemInstanceList()
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
  const extraUsage = {}
  const newRows = []
  for (const item of items) {
    if (form.value.details.some(detail => detail.instanceCode === item.instanceCode)) {
      throw new Error(`器材实例编码 ${item.instanceCode} 已添加`)
    }
    await refreshInventoryOptions(item.warehouseId, item.areaId)
    const matchedInventory = matchInventoryDetail({
      skuId: item.skuId,
      warehouseId: item.warehouseId,
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
      warehouseId: item.warehouseId,
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
  if (formReadonly.value || loading.value || shipmentScanBuffer.pending || isTypingTarget(event)) {
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
  itemInstanceDialog.query.warehouseId = undefined
  itemInstanceDialog.query.areaId = undefined
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
}

.item-instance-search-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.item-instance-search-form :deep(.el-form-item__label) {
  padding-right: 8px;
}

.approval-controls {
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 12px;
}

.approval-form-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 18px;

  > label {
    font-size: 14px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
    line-height: 32px;
    min-width: 80px;
    text-align: right;
  }

  .el-select,
  .el-input {
    flex: 1;
  }
}
</style>

