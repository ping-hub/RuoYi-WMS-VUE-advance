<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" :class="{ 'is-view-mode': isViewMode }" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="入库单基本信息">
        <el-form label-width="108px" :model="form" ref="receiptForm" :rules="rules" :disabled="isViewMode">
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="入库单号" prop="receiptOrderNo">
                <el-input v-model="form.receiptOrderNo" placeholder="保存后自动生成" disabled style="width: 100%"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="入库类型" prop="receiptOrderType">
                <el-select v-model="form.receiptOrderType" placeholder="请选择入库类型" clearable style="width: 100%">
                  <el-option v-for="item in wms_receipt_type" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
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
              <el-form-item label="入库日期" prop="receiptDate">
                <el-date-picker v-model="form.receiptDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" style="width: 100%" />
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
        </el-form>
      </el-card>
      <el-card header="入库明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8 receipt-toolbar">
            <div>
              <el-tag type="info">
                入库按器材实例执行。支持"选择器材实例"或扫码枪扫二维码直接新增；货位支持扫码录入（先扫器材码添加，再扫货位码绑定）。
              </el-tag>
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
            @row-click="handleDetailRowClick"
            style="cursor: pointer"
          >
            <el-table-column label="器材实例编码" min-width="160">
              <template #default="{ row }">
                <span>{{ row.instanceCode || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="器材名称" min-width="160">
              <template #default="{ row }">
                <span>{{ row.itemName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="货位" min-width="160">
              <template #default="{ row }">
                <LocationSelect
                  v-model="row.locationId"
                  :warehouse-id="form.warehouseId"
                  :area-id="form.areaId"
                  :options="locationOptions"
                  placeholder="货位"
                  :disabled="isViewMode"
                  @change="(val) => handleLocationSelectChange(row, val)"
                />
              </template>
            </el-table-column>
            <el-table-column label="质量等级" min-width="120">
              <template #default="{ row }">
                <el-select v-model="row.qualityGrade" placeholder="质量等级" :disabled="isViewMode" clearable style="width: 100%">
                  <el-option v-for="item in wms_quality_grade" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="质保期" min-width="160">
              <template #default="{ row }">
                <el-date-picker
                  v-model="row.warrantyPeriod"
                  type="date"
                  placeholder="选择质保期"
                  value-format="YYYY-MM-DD"
                  :disabled="isViewMode"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="请输入备注" :disabled="isViewMode" />
              </template>
            </el-table-column>
            <el-table-column v-if="!isViewMode" label="操作" width="88" align="right">
              <template #default="scope">
                <el-button icon="Delete" type="danger" plain size="small" @click.stop="handleDeleteDetail(scope.row, scope.$index)" link>删除</el-button>
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
      <el-dialog v-model="itemInstanceSelectDialog.visible" title="选择器材实例" width="1200px" append-to-body>
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
          <el-form-item label="器材实例编码" label-width="100px">
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
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <span>{{ row.locationName ? '已入库' : '待入库' }}</span>
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
import {computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, toRefs} from "vue";
import {addReceiptOrder, getReceiptOrder, updateReceiptOrder, warehousing} from "@/api/wms/receiptOrder";
import {ElMessage} from "element-plus";
import LocationSelect from "@/views/components/LocationSelect.vue";
import { getLocation, listLocationNoPage } from '@/api/wms/location'
import {useRoute} from "vue-router";
import useTagsViewStore from "@/store/modules/tagsView";
import {useWmsStore} from '@/store/modules/wms'
import { numSub } from '@/utils/ruoyi'
import { delReceiptOrderDetail } from '@/api/wms/receiptOrderDetail'
import { listReceiptTargets } from '@/api/wms/storageLayout'
import { listItem } from "@/api/wms/item";
import { getItemInstanceByCode, listItemInstance } from "@/api/wms/itemInstance";

const {proxy} = getCurrentInstance();
const route = useRoute();
const tagsViewStore = useTagsViewStore();
const isViewMode = computed(() => route.query.mode === 'view');
const { wms_receipt_type, wms_quality_grade } = proxy.useDict("wms_receipt_type", "wms_quality_grade");
const loading = ref(false)
/** 统一加载的货位列表，传给 LocationSelect 避免 N 次重复请求 */
const locationOptions = ref([])
const loadLocationOptions = async () => {
  if (!form.value.warehouseId) {
    locationOptions.value = []
    return
  }
  try {
    const query = { warehouseId: form.value.warehouseId }
    if (form.value.areaId) {
      query.areaId = form.value.areaId
    }
    const res = await listLocationNoPage(query)
    locationOptions.value = res.data || []
  } catch (e) {
    locationOptions.value = []
  }
}
const initFormData = {
  id: undefined,
  receiptOrderNo: undefined,
  receiptOrderType: undefined,
  basisNo: undefined,
  dispatchMode: undefined,
  noticeOrg: undefined,
  receiveUnit: undefined,
  purchaseDate: undefined,
  receiptDate: undefined,
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
const receiptScanBuffer = reactive({
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
  remark: instance.remark ?? ''
})

const createReceiptDetailFromInstance = (item = {}) => syncReceiptDetail({
  instanceCode: item.instanceCode,
  boxCode: item.boxCode ?? '',
  itemId: item.itemId,
  skuId: item.skuId,
  itemName: item.itemName,
  itemCode: item.itemCode,
  skuName: item.skuName,
  unit: item.unit,
  productIdentifier: item.productIdentifier,
  qualityGrade: item.qualityGrade,
  quantity: 1,
  warehouseId: form.value.warehouseId,
  areaId: form.value.areaId,
  rackId: undefined,
  locationId: undefined,
  generateItemInstance: 1,
  generatedInstanceQuantity: 0,
  receiptItemInstances: [normalizeReceiptInstance({
    id: item.id ?? item.instanceCode,
    instanceCode: item.instanceCode,
    boxCode: item.boxCode ?? '',
    remark: item.remark
  })]
})

const syncReceiptDetail = (detail) => {
  const firstReceiptInstance = detail.receiptItemInstances?.[0] || {}
  const unitPrice = detail.unitPrice
  const lineAmount = detail.lineAmount ?? calcLineAmount(detail.quantity, unitPrice)
  return {
    ...detail,
    itemId: detail.itemId ?? detail.itemSku?.item?.id,
    skuId: detail.skuId ?? detail.itemSku?.id,
    itemName: detail.itemName ?? detail.itemSku?.item?.itemName,
    itemCode: detail.itemCode ?? detail.itemSku?.item?.itemCode,
    skuName: detail.skuName ?? detail.itemSku?.skuName,
    unit: detail.unit ?? detail.itemSku?.item?.unit,
    productIdentifier: detail.productIdentifier ?? detail.itemSku?.productIdentifier,
    qualityGrade: detail.qualityGrade,
    instanceCode: detail.instanceCode ?? firstReceiptInstance.instanceCode ?? '',
    boxCode: detail.boxCode ?? firstReceiptInstance.boxCode ?? '',
    quantity: Number(detail.quantity || 1),
    generateItemInstance: 1,
    rackId: detail.rackId,
    locationId: detail.locationId,
    receiptItemInstances: (detail.receiptItemInstances || []).map(it => normalizeReceiptInstance(it)),
    recommendTargets: detail.recommendTargets ?? [],
    unitPrice,
    lineAmount
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

/**
 * 批量加载推荐货位：按查询参数分组，每组只发一次请求
 * 替代 Promise.all(details.map(loadRecommendTargets))
 */
const batchLoadRecommendTargets = async (details) => {
  if (!form.value.warehouseId || !details.length) return
  // 按查询参数分组
  const groups = new Map()
  details.forEach(detail => {
    const q = buildRecommendQuery(detail)
    const key = `${q.warehouseId || ''}_${q.areaId || ''}_${q.rackId || ''}`
    if (!groups.has(key)) {
      groups.set(key, { query: q, details: [] })
    }
    groups.get(key).details.push(detail)
  })
  // 每组发一次请求
  await Promise.all(
    Array.from(groups.values()).map(async ({ query, details: groupDetails }) => {
      try {
        const res = await listReceiptTargets(query)
        const targets = (res.data || []).slice(0, 5)
        groupDetails.forEach(d => { d.recommendTargets = targets })
      } catch (e) {
        groupDetails.forEach(d => { d.recommendTargets = [] })
      }
    })
  )
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
  getReceiptItemInstanceList()
}

const getReceiptItemInstanceList = () => {
  itemInstanceSelectDialog.loading = true
  listItemInstance({
    pageNum: itemInstanceSelectDialog.pageNum,
    pageSize: itemInstanceSelectDialog.pageSize,
    itemCategory: itemInstanceSelectDialog.query.itemCategory,
    itemId: itemInstanceSelectDialog.query.itemId,
    instanceCode: itemInstanceSelectDialog.query.instanceCode,
    unreceivedOnly: true,
    instanceStatus: '待入库'
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
  return !form.value.details.some(detail => detail.instanceCode === row.instanceCode)
}

const handleConfirmReceiptItemInstance = () => {
  if (!itemInstanceSelectDialog.selection.length) {
    ElMessage.error('请选择器材实例')
    return
  }
  const newDetails = itemInstanceSelectDialog.selection.map(item => createReceiptDetailFromInstance(item))
  form.value.details.push(...newDetails)
  itemInstanceSelectDialog.visible = false
  batchLoadRecommendTargets(newDetails)
  recalculateOrderSummary()
}
// 选择器材实例 end

const isTypingTarget = (event) => {
  const tagName = event?.target?.tagName
  return ['INPUT', 'TEXTAREA'].includes(tagName) || event?.target?.isContentEditable
}

const handleScanAddReceiptInstance = async (instanceCode) => {
  if (!form.value.warehouseId || !form.value.areaId) {
    ElMessage.warning('请先选择仓库和库区后再扫码')
    return false
  }
  if (form.value.details.some(detail => detail.instanceCode === instanceCode)) {
    ElMessage.warning(`器材实例 ${instanceCode} 已在当前单据中`)
    return false
  }
  try {
    const res = await getItemInstanceByCode(instanceCode, { unreceivedOnly: true, instanceStatus: '待入库' })
    const item = res.data
    if (!item?.id) {
      return false
    }
    if (form.value.details.some(detail => detail.instanceCode === item.instanceCode)) {
      ElMessage.warning(`器材实例 ${instanceCode} 已在当前单据中`)
      return false
    }
    const detail = createReceiptDetailFromInstance(item)
    form.value.details.push(detail)
    await loadRecommendTargets(detail)
    recalculateOrderSummary()
    ElMessage.success(`已扫码添加：${instanceCode}`)
    return true
  } catch (e) {
    return false
  }
}

const handleScanLocation = async (locationCode) => {
  if (!form.value.warehouseId) {
    ElMessage.warning('请先选择仓库')
    return false
  }
  if (!form.value.details.length) {
    ElMessage.warning('请先添加器材后再扫码货位')
    return false
  }
  try {
    const res = await listLocationNoPage({
      warehouseId: form.value.warehouseId,
      locationCode
    })
    const locations = res.data || []
    const location = locations.find(l => l.locationCode === locationCode) || locations[0]
    if (!location?.id) {
      ElMessage.error(`未找到货位：${locationCode}`)
      return false
    }
    // 赋值给最后一条明细（最新添加的），自动带出货架、库区
    const lastDetail = form.value.details[form.value.details.length - 1]
    applyLocationToDetail(lastDetail, location)
    ElMessage.success(`已设置货位：${location.locationName || locationCode}`)
    return true
  } catch (e) {
    ElMessage.error(`未找到货位：${locationCode}`)
    return false
  }
}

/** 将货位信息应用到明细行，自动带出货架、库区 */
const applyLocationToDetail = (detail, location) => {
  detail.locationId = location.id
  if (location.rackId) {
    detail.rackId = location.rackId
  }
  if (location.areaId) {
    detail.areaId = location.areaId
  }
}

/** 货位下拉选择变化时，自动带出货架、库区信息 */
const handleLocationSelectChange = async (detail, locationId) => {
  if (!locationId) {
    detail.rackId = undefined
    detail.locationId = undefined
    return
  }
  try {
    const res = await getLocation(locationId)
    if (res.data) {
      applyLocationToDetail(detail, res.data)
    }
  } catch (e) {
    // 取不到时保持现状
  }
}

const handleReceiptScanKeydown = async (event) => {
  if (isViewMode.value || loading.value || receiptScanBuffer.pending || isTypingTarget(event)) {
    return
  }
  const now = Date.now()
  if (now - receiptScanBuffer.lastTime > 120) {
    receiptScanBuffer.value = ''
  }
  receiptScanBuffer.lastTime = now
  if (event.key === 'Enter') {
    const scannedCode = receiptScanBuffer.value.trim()
    receiptScanBuffer.value = ''
    if (!scannedCode) {
      return
    }
    receiptScanBuffer.pending = true
    try {
      // 优先尝试作为器材实例编码
      const added = await handleScanAddReceiptInstance(scannedCode)
      if (!added) {
        // 未匹配到器材实例，尝试作为货位编码
        await handleScanLocation(scannedCode)
      }
    } finally {
      receiptScanBuffer.pending = false
    }
    return
  }
  if (event.key.length === 1) {
    receiptScanBuffer.value += event.key
  }
}

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
      return '当前入库模式按器材实例执行，明细数量必须为1'
    }
    const instanceCode = String(detail.instanceCode || detail.receiptItemInstances?.[0]?.instanceCode || '').trim()
    if (!instanceCode) {
      return '请先选择器材实例'
    }
    const uniqueKey = `CODE:${instanceCode}`
    if (instanceSet.has(uniqueKey)) {
      duplicatedInstances.add(instanceCode)
    }
    instanceSet.add(uniqueKey)
  }
  if (duplicatedInstances.size) {
    return `器材实例重复：${Array.from(duplicatedInstances).join('、')}`
  }
  return ''
}

const buildReceiptItemInstances = (detail) => [{
  id: detail.receiptItemInstances?.[0]?.id,
  instanceCode: detail.instanceCode ?? detail.receiptItemInstances?.[0]?.instanceCode,
  boxCode: detail.boxCode ?? detail.receiptItemInstances?.[0]?.boxCode,
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
        instanceCode: it.instanceCode,
        quantity: 1,
        itemCode: it.itemCode,
        itemName: it.itemName,
        skuName: it.skuName,
        unit: it.unit,
        productIdentifier: it.productIdentifier,
        qualityGrade: it.qualityGrade,
        unitPrice: it.unitPrice,
        lineAmount: it.lineAmount,
        boxCode: it.boxCode,
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
      basisNo: form.value.basisNo,
      dispatchMode: form.value.dispatchMode,
      noticeOrg: form.value.noticeOrg,
      receiveUnit: form.value.receiveUnit,
      purchaseDate: form.value.purchaseDate,
      receiptDate: form.value.receiptDate,
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
        instanceCode: it.instanceCode,
        quantity: 1,
        itemCode: it.itemCode,
        itemName: it.itemName,
        skuName: it.skuName,
        unit: it.unit,
        productIdentifier: it.productIdentifier,
        qualityGrade: it.qualityGrade,
        unitPrice: it.unitPrice,
        lineAmount: it.lineAmount,
        boxCode: it.boxCode,
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
      basisNo: form.value.basisNo,
      dispatchMode: form.value.dispatchMode,
      noticeOrg: form.value.noticeOrg,
      receiveUnit: form.value.receiveUnit,
      purchaseDate: form.value.purchaseDate,
      receiptDate: form.value.receiptDate,
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
  if (route.query.mode === 'view') {
    route.meta.title = '查看入库单'
    tagsViewStore.updateVisitedView(route)
  }
  window.addEventListener('keydown', handleReceiptScanKeydown)
  const id = route.query && route.query.id;
  if (id) {
    loadDetail(id)
  } else {
    form.value.receiptOrderType = wms_receipt_type.value?.[0]?.value
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleReceiptScanKeydown)
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
    // 统一加载一次货位列表，避免每行明细各自请求
    loadLocationOptions()
    batchLoadRecommendTargets(form.value.details)
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
  // 仓库切换后重新加载货位列表
  loadLocationOptions()
}

const handleChangeArea = (e) => {
  form.value.details.forEach(it => {
    it.areaId = e
    it.rackId = undefined
    it.locationId = undefined
  })
  // 库区切换后重新加载货位列表
  loadLocationOptions()
  batchLoadRecommendTargets(form.value.details)
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
  line-height: 1.5;
}

.item-title {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
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
