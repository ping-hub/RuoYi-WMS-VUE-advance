<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" label-width="88px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="箱码" prop="boxCode">
              <el-input v-model="queryParams.boxCode" placeholder="请输入箱码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="箱体名称" prop="boxName">
              <el-input v-model="queryParams.boxName" placeholder="请输入箱体名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="状态" prop="boxStatus">
              <el-select v-model="queryParams.boxStatus" placeholder="请选择状态" clearable style="width: 100%" @change="handleQuery">
                <el-option v-for="dict in wms_box_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="仓库" prop="warehouseId">
              <el-select v-model="queryParams.warehouseId" placeholder="请选择仓库" clearable filterable style="width: 100%" @change="handleQueryWarehouseChange">
                <el-option
                  v-for="item in wmsStore.warehouseList"
                  :key="item.id"
                  :label="item.warehouseName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="库区" prop="areaId">
              <el-select v-model="queryParams.areaId" placeholder="请选择库区" clearable filterable style="width: 100%" @change="handleQueryAreaChange">
                <el-option
                  v-for="item in queryAreaOptions"
                  :key="item.id"
                  :label="item.areaName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="货架" prop="rackId">
              <RackSelect v-model="queryParams.rackId" :warehouse-id="queryParams.warehouseId" :area-id="queryParams.areaId" @change="handleQueryRackChange" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="货位" prop="locationId">
              <LocationSelect
                v-model="queryParams.locationId"
                :warehouse-id="queryParams.warehouseId"
                :area-id="queryParams.areaId"
                :rack-id="queryParams.rackId"
                @change="handleQuery"
              />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <div class="query-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="8"><span style="font-size: large">箱体管理</span></el-col>
        <el-col :span="6" style="text-align: right">
          <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wms:box:edit']">新增</el-button>
          <el-button type="primary" plain icon="Printer" :disabled="!selectedRows.length" :loading="printDialog.sending" @click="handleBatchPrint" v-hasPermi="['wms:box:list']">批量打印</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="boxList" border empty-text="暂无箱体" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="箱码" prop="boxCode" min-width="100" show-overflow-tooltip />
        <el-table-column label="位置编码" prop="positionCode" min-width="110" show-overflow-tooltip />
        <el-table-column label="箱体名称" prop="boxName" min-width="100" show-overflow-tooltip />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <dict-tag :options="wms_box_status" :value="row.boxStatus" />
          </template>
        </el-table-column>
        <el-table-column label="仓库" prop="warehouseName" min-width="80" show-overflow-tooltip />
        <el-table-column label="库区" prop="areaName" min-width="80" show-overflow-tooltip />
        <el-table-column label="货架" prop="rackName" min-width="70" show-overflow-tooltip />
        <el-table-column label="货位" prop="locationName" min-width="80" show-overflow-tooltip />
        <el-table-column label="关联单据" min-width="120">
          <template #default="{ row }">
            <span v-if="row.outboundOrderType">
              {{ row.outboundOrderType === 'SHIPMENT' ? '出库单' : row.outboundOrderType === 'BORROW_ORDER' ? '借用单' : row.outboundOrderType }}
              #{{ row.outboundOrderId }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="出库时间" prop="outboundTime" min-width="100" show-overflow-tooltip />
        <el-table-column label="器材数" prop="itemCount" width="65" align="right" />
        <el-table-column label="备注" prop="remark" min-width="60" show-overflow-tooltip />
        <el-table-column label="操作" align="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button link type="primary" @click="handleRelocate(row)" v-hasPermi="['wms:box:edit']" :disabled="row.boxStatus === 'outbound'">移位</el-button>
            <el-button link type="primary" @click="handleUpdate(row)" v-hasPermi="['wms:box:edit']">修改</el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-hasPermi="['wms:box:edit']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <el-drawer :title="dialog.title" v-model="dialog.visible" size="45%" append-to-body :close-on-click-modal="false">
      <el-form ref="boxFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="箱码" prop="boxCode">
          <el-input v-model="form.boxCode" placeholder="不填则后端自动生成" />
        </el-form-item>
        <el-form-item label="位置编码" prop="positionCode">
          <el-input v-model="form.positionCode" placeholder="如 01-05-03-02" />
        </el-form-item>
        <el-form-item label="箱体名称" prop="boxName">
          <el-input v-model="form.boxName" placeholder="请输入箱体名称" />
        </el-form-item>
        <el-form-item label="箱体状态" prop="boxStatus">
          <el-select v-model="form.boxStatus" placeholder="请选择箱体状态" style="width: 100%">
            <el-option v-for="dict in wms_box_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="form.warehouseId" placeholder="请选择仓库" filterable style="width: 100%" @change="handleFormWarehouseChange">
            <el-option
              v-for="item in wmsStore.warehouseList"
              :key="item.id"
              :label="item.warehouseName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库区" prop="areaId">
          <el-select v-model="form.areaId" placeholder="请选择库区" clearable filterable style="width: 100%" @change="handleFormAreaChange">
            <el-option
              v-for="item in formAreaOptions"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="货架" prop="rackId">
          <RackSelect v-model="form.rackId" :warehouse-id="form.warehouseId" :area-id="form.areaId" @update:model-value="handleFormRackChange" />
        </el-form-item>
        <el-form-item label="货位" prop="locationId">
          <LocationSelect
            v-model="form.locationId"
            :warehouse-id="form.warehouseId"
            :area-id="form.areaId"
            :rack-id="form.rackId"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-drawer>

    <el-dialog title="箱体详情" v-model="detailDialog.visible" width="960px" append-to-body>
      <el-descriptions :column="3" border class="mb16">
        <el-descriptions-item label="箱码">{{ detailDialog.data.boxCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="位置编码">{{ detailDialog.data.positionCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="箱体名称">{{ detailDialog.data.boxName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="箱体状态">
          <dict-tag :options="wms_box_status" :value="detailDialog.data.boxStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="仓库">{{ detailDialog.data.warehouseName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="库区">{{ detailDialog.data.areaName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货架">{{ detailDialog.data.rackName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货位">{{ detailDialog.data.locationName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="器材数">{{ detailDialog.data.itemCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailDialog.data.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="detail-header">
        <span class="detail-title">器材清单</span>
      </div>
      <el-table :data="detailDialog.data.items || []" border empty-text="箱内暂无器材">
        <el-table-column label="器材识别码" prop="instanceCode" min-width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleOpenItemInstance(row)">{{ row.instanceCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="器材名称" prop="itemName" min-width="120" show-overflow-tooltip />
        <el-table-column label="规格型号" prop="skuName" min-width="120" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <dict-tag :options="itemInstanceStatusOptions" :value="row.instanceStatus" />
          </template>
        </el-table-column>
      </el-table>

      <div class="detail-header">
        <span class="detail-title">流转日志</span>
      </div>
      <el-table :data="detailDialog.logs" border empty-text="暂无流转日志">
        <el-table-column label="事件类型" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_box_event_type" :value="row.eventType" />
          </template>
        </el-table-column>
        <el-table-column label="关联单据" min-width="150">
          <template #default="{ row }">
            <span v-if="row.relatedOrderType">
              {{ row.relatedOrderType === 'SHIPMENT' ? '出库单' : row.relatedOrderType === 'BORROW_ORDER' ? '借用单' : row.relatedOrderType }}
              #{{ row.relatedOrderId }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="从" prop="fromLocationName" min-width="130" show-overflow-tooltip />
        <el-table-column label="到" prop="toLocationName" min-width="130" show-overflow-tooltip />
        <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作人" prop="createBy" width="80" />
        <el-table-column label="时间" prop="createTime" width="150" />
      </el-table>
    </el-dialog>

    <!-- 移位弹窗 -->
    <el-dialog title="库内移位" v-model="relocateDialog.visible" width="520px" append-to-body :close-on-click-modal="false">
      <el-descriptions :column="2" border class="mb16">
        <el-descriptions-item label="箱码">{{ relocateDialog.row?.boxCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="当前位置">
          {{ [relocateDialog.row?.warehouseName, relocateDialog.row?.areaName, relocateDialog.row?.rackName, relocateDialog.row?.locationName].filter(Boolean).join(' / ') || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <el-form label-width="90px" :model="relocateDialog.form">
        <el-form-item label="仓库">
          <el-input :model-value="relocateDialog.row?.warehouseName" disabled />
        </el-form-item>
        <el-form-item label="目标货架">
          <RackSelect
            v-model="relocateDialog.form.rackId"
            :warehouse-id="relocateDialog.row?.warehouseId"
            :area-id="relocateDialog.row?.areaId"
            placeholder="选择目标货架"
            @update:model-value="handleRelocateRackChange"
          />
        </el-form-item>
        <el-form-item label="目标货位">
          <LocationSelect
            v-model="relocateDialog.form.locationId"
            :warehouse-id="relocateDialog.row?.warehouseId"
            :area-id="relocateDialog.row?.areaId"
            :rack-id="relocateDialog.form.rackId"
            placeholder="选择目标货位"
          />
        </el-form-item>
        <el-form-item label="同步器材">
          <el-checkbox v-model="relocateDialog.form.syncItems">同时将箱内在库器材移至新位置</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="relocateDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="relocateDialog.loading" @click="submitRelocate">确认移位</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="printDialog.visible" title="批量打印箱码" width="520px" append-to-body :close-on-click-modal="false" @closed="handlePrintDialogClosed">
      <el-form label-width="90px">
        <el-form-item label="打印数量">
          <span>{{ printCodes.length }} 条</span>
        </el-form-item>
        <el-form-item label="打印机">
          <el-select v-model="printDialog.printerId" placeholder="请选择打印机" filterable style="width: 100%" :disabled="printDialog.loading || printDialog.sending">
            <el-option v-for="item in printDialog.printers" :key="item.printerId" :label="item.printerId" :value="item.printerId" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-alert v-if="printDialog.errorMessage" :title="printDialog.errorMessage" type="error" :closable="false" class="mb12" show-icon />
      <div v-if="printDialog.total" class="mb12">进度：{{ printDialog.current }}/{{ printDialog.total }}</div>
      <template #footer>
        <el-button :loading="printDialog.loading" :disabled="printDialog.sending" @click="loadPrinters">刷新</el-button>
        <el-button :disabled="printDialog.sending" @click="printDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="printDialog.sending" :disabled="!printDialog.printerId || !printDialog.printers.length" @click="handleConfirmPrint">开始打印</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="Box">
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { addBox, delBox, getBox, getBoxLogs, listBox, relocateBox, updateBox } from '@/api/wms/box';
import { useWmsStore } from '@/store/modules/wms';
import RackSelect from '@/views/components/RackSelect.vue';
import LocationSelect from '@/views/components/LocationSelect.vue';
import { buildQrTscCommand, buildBoxLabelTscCommand, WssPrintClient, getPrintUrl } from '@/utils/wssPrintClient';

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const { wms_box_status, wms_item_instance_status, wms_box_event_type } = proxy.useDict('wms_box_status', 'wms_item_instance_status', 'wms_box_event_type');
const wmsStore = useWmsStore();

const loading = ref(true);
const buttonLoading = ref(false);
const total = ref(0);
const boxList = ref([]);
const queryRef = ref();
const boxFormRef = ref();
const selectedRows = ref([]);
const printCodes = ref([]);

const dialog = reactive({
  visible: false,
  title: ''
});

const detailDialog = reactive({
  visible: false,
  data: {},
  logs: []
});

const printDialog = reactive({
  visible: false,
  loading: false,
  sending: false,
  printers: [],
  printerId: '',
  total: 0,
  current: 0,
  errorMessage: ''
});

let printClient;

const initFormData = () => ({
  id: undefined,
  boxCode: undefined,
  boxName: undefined,
  boxStatus: 'idle',
  warehouseId: undefined,
  areaId: undefined,
  rackId: undefined,
  locationId: undefined,
  positionCode: undefined,
  remark: undefined
});

const data = reactive({
  form: initFormData(),
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    boxCode: undefined,
    boxName: undefined,
    boxStatus: undefined,
    warehouseId: undefined,
    areaId: undefined,
    rackId: undefined,
    locationId: undefined
  },
  rules: {
    boxName: [
      { required: true, message: '箱体名称不能为空', trigger: 'blur' }
    ]
  }
});

const { form, queryParams, rules } = toRefs(data);

const itemInstanceStatusOptions = computed(() => wms_item_instance_status.value);

const applyRouteQuery = () => {
  if (route.query.boxCode) {
    queryParams.value.boxCode = route.query.boxCode;
  }
};

const queryAreaOptions = computed(() => {
  if (!queryParams.value.warehouseId) {
    return wmsStore.areaList;
  }
  return wmsStore.areaList.filter(item => item.warehouseId === queryParams.value.warehouseId);
});

const formAreaOptions = computed(() => {
  if (!form.value.warehouseId) {
    return [];
  }
  return wmsStore.areaList.filter(item => item.warehouseId === form.value.warehouseId);
});

const getList = async () => {
  loading.value = true;
  try {
    const res = await listBox(queryParams.value);
    boxList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  proxy.resetForm('queryRef');
  handleQuery();
};

const handleQueryWarehouseChange = () => {
  queryParams.value.areaId = undefined;
  queryParams.value.rackId = undefined;
  queryParams.value.locationId = undefined;
  handleQuery();
};

const handleQueryAreaChange = () => {
  queryParams.value.rackId = undefined;
  queryParams.value.locationId = undefined;
  handleQuery();
};

const handleQueryRackChange = () => {
  queryParams.value.locationId = undefined;
  handleQuery();
};

const reset = () => {
  form.value = initFormData();
  proxy.resetForm('boxFormRef');
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增箱体';
};

const originalLocation = ref({});

const handleUpdate = async (row) => {
  reset();
  const res = await getBox(row.id);
  form.value = { ...initFormData(), ...res.data };
  originalLocation.value = {
    warehouseId: res.data.warehouseId,
    areaId: res.data.areaId,
    rackId: res.data.rackId,
    locationId: res.data.locationId,
  };
  dialog.visible = true;
  dialog.title = '修改箱体';
};

const handleFormWarehouseChange = () => {
  form.value.areaId = undefined;
  form.value.rackId = undefined;
  form.value.locationId = undefined;
};

const handleFormAreaChange = () => {
  form.value.rackId = undefined;
  form.value.locationId = undefined;
};

const handleFormRackChange = () => {
  form.value.locationId = undefined;
};

const isLocationChanged = () => {
  const orig = originalLocation.value;
  return form.value.warehouseId !== orig.warehouseId
    || form.value.areaId !== orig.areaId
    || form.value.rackId !== orig.rackId
    || form.value.locationId !== orig.locationId;
};

const submitForm = () => {
  boxFormRef.value.validate(async valid => {
    if (!valid) {
      return;
    }
    // 修改时检测位置变更
    if (form.value.id && isLocationChanged()) {
      try {
        await ElMessageBox.confirm(
          '修改箱体位置后，箱内器材的位置不会随之变动，确认继续？',
          '提示',
          { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
        );
      } catch { return; }
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateBox(form.value);
        proxy.$modal.msgSuccess('修改成功');
      } else {
        await addBox(form.value);
        proxy.$modal.msgSuccess('新增成功');
      }
      dialog.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const cancel = () => {
  dialog.visible = false;
  reset();
};

const handleView = async (row) => {
  const res = await getBox(row.id);
  detailDialog.data = res.data || {};
  const logsRes = await getBoxLogs(row.id);
  detailDialog.logs = logsRes.data || [];
  detailDialog.visible = true;
};

// ========== 库内移位 ==========
const relocateDialog = reactive({
  visible: false,
  loading: false,
  row: null,
  form: {
    rackId: undefined,
    locationId: undefined,
    syncItems: true
  }
});

const handleRelocate = async (row) => {
  const res = await getBox(row.id);
  relocateDialog.row = res.data || row;
  relocateDialog.form = { rackId: undefined, locationId: undefined, syncItems: true };
  relocateDialog.visible = true;
};

const handleRelocateRackChange = () => {
  relocateDialog.form.locationId = undefined;
};

const submitRelocate = async () => {
  if (!relocateDialog.form.rackId && !relocateDialog.form.locationId) {
    proxy.$modal.msgError('请至少选择目标货架或货位');
    return;
  }
  relocateDialog.loading = true;
  try {
    await relocateBox(relocateDialog.row.id, {
      rackId: relocateDialog.form.rackId,
      locationId: relocateDialog.form.locationId,
      syncItems: relocateDialog.form.syncItems
    });
    proxy.$modal.msgSuccess('移位成功');
    relocateDialog.visible = false;
    await getList();
  } catch (e) {
    // 错误已在 response 拦截器处理
  } finally {
    relocateDialog.loading = false;
  }
};

const handleDelete = async (row) => {
  const hasItems = row.itemCount > 0;
  const msg = hasItems
    ? '确认删除箱体【' + row.boxCode + '】吗？箱内器材将自动解除装箱关系，器材自身位置不受影响。'
    : '确认删除箱体【' + row.boxCode + '】吗？';
  await proxy.$modal.confirm(msg);
  await delBox(row.id);
  proxy.$modal.msgSuccess('删除成功');
  await getList();
};

const handleOpenItemInstance = (row) => {
  router.push({ path: '/inventoryCenter/inventoryDetail', query: { instanceCode: row.instanceCode } });
};

// ========== 打印箱码 ==========
async function ensurePrintClient() {
  if (!printClient) {
    const url = await getPrintUrl();
    printClient = new WssPrintClient({ url });
  }
  await printClient.connect();
}

async function loadPrinters() {
  printDialog.errorMessage = '';
  printDialog.loading = true;
  try {
    await ensurePrintClient();
    const printers = await printClient.listDevices();
    printDialog.printers = printers;
    const savedPrinterId = localStorage.getItem('wss_print_printer_id') || '';
    if (!printDialog.printerId && savedPrinterId && printers.some(item => item.printerId === savedPrinterId)) {
      printDialog.printerId = savedPrinterId;
    }
    if (!printDialog.printerId && printers.length) {
      printDialog.printerId = printers[0].printerId;
    }
  } catch (e) {
    printDialog.errorMessage = e?.message || '获取打印机列表失败';
    try {
      printClient?.disconnect();
    } finally {
      printClient = undefined;
    }
  } finally {
    printDialog.loading = false;
  }
}

function handleSelectionChange(selection) {
  selectedRows.value = selection || [];
}

const handleBatchPrint = async () => {
  if (!selectedRows.value.length) {
    proxy.$modal.msgError('请先勾选要打印的箱体');
    return;
  }
  const items = selectedRows.value.filter(item => item.boxCode);
  if (!items.length) {
    proxy.$modal.msgError('勾选数据中未找到箱码');
    return;
  }
  printCodes.value = items;
  printDialog.total = items.length;
  printDialog.current = 0;
  printDialog.errorMessage = '';
  printDialog.visible = true;
  await loadPrinters();
};

async function handleConfirmPrint() {
  if (!printDialog.printerId) {
    proxy.$modal.msgError('请选择打印机');
    return;
  }
  if (!printCodes.value.length) {
    proxy.$modal.msgError('没有可打印的数据');
    return;
  }
  localStorage.setItem('wss_print_printer_id', printDialog.printerId);
  printDialog.sending = true;
  printDialog.errorMessage = '';
  try {
    await ensurePrintClient();
    for (const item of printCodes.value) {
      const command = buildBoxLabelTscCommand(item.boxCode, item.positionCode);
      const res = await printClient.sendData(command, printDialog.printerId);
      if (Number(res?.code) <= 0) {
        throw new Error(res?.msg || '打印失败');
      }
      printDialog.current += 1;
    }
    await printClient.closePrinter(printDialog.printerId);
    proxy.$modal.msgSuccess(`已发送 ${printDialog.total} 条打印任务`);
    printDialog.visible = false;
  } catch (e) {
    printDialog.errorMessage = e?.message || '打印失败';
    try {
      await printClient?.closePrinter(printDialog.printerId);
    } catch {
      return;
    }
  } finally {
    printDialog.sending = false;
    try {
      printClient?.disconnect();
    } finally {
      printClient = undefined;
    }
  }
}

function handlePrintDialogClosed() {
  printDialog.errorMessage = '';
  printDialog.loading = false;
  printDialog.sending = false;
  printDialog.printers = [];
  printDialog.printerId = '';
  printDialog.total = 0;
  printDialog.current = 0;
  printCodes.value = [];
  try {
    printClient?.disconnect();
  } finally {
    printClient = undefined;
  }
}

onMounted(async () => {
  applyRouteQuery();
  await Promise.all([
    wmsStore.getWarehouseList(),
    wmsStore.getAreaList()
  ]);
  await getList();
});

watch(
  () => route.query,
  async () => {
    applyRouteQuery();
    await getList();
  }
);
</script>

<style scoped>
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.detail-title {
  font-size: 16px;
  line-height: 16px;
}

.mb16 {
  margin-bottom: 16px;
}

.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
