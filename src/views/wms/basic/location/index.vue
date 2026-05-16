<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="编码" prop="locationCode">
          <el-input v-model="queryParams.locationCode" placeholder="请输入货位编码" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="名称" prop="locationName">
          <el-input v-model="queryParams.locationName" placeholder="请输入货位名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="queryParams.warehouseId" placeholder="请选择仓库" clearable filterable style="width: 180px" @change="handleQueryWarehouseChange">
            <el-option
              v-for="item in wmsStore.warehouseList"
              :key="item.id"
              :label="item.warehouseName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库区" prop="areaId">
          <el-select v-model="queryParams.areaId" placeholder="请选择库区" clearable filterable style="width: 180px" @change="handleQueryAreaChange">
            <el-option
              v-for="item in areaOptions"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="货架" prop="rackId">
          <RackSelect v-model="queryParams.rackId" :warehouse-id="queryParams.warehouseId" :area-id="queryParams.areaId" />
        </el-form-item>
        <el-form-item label="状态" prop="locationStatus">
          <el-select v-model="queryParams.locationStatus" placeholder="请选择状态" clearable style="width: 140px">
            <el-option v-for="dict in wms_location_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="14">
          <div class="page-title">货位维护</div>
          <div class="sub-text">货位由货架自动生成，当前页面用于查看、维护和异常修正；结构字段仅展示，不支持手工改档。</div>
        </el-col>
        <el-col :span="10" class="toolbar-actions">
          <el-button type="primary" plain icon="Printer" :disabled="!selectedRows.length" :loading="printDialog.sending" @click="handleBatchPrintLocation" v-hasPermi="['wms:location:list']">批量打印</el-button>
          <el-button type="primary" plain icon="RefreshRight" :disabled="!queryParams.rackId" :loading="rackActionLoading" @click="handleRebuildByRack" v-hasPermi="['wms:location:edit']">按货架重建</el-button>
          <el-button plain icon="Search" :disabled="!queryParams.rackId" :loading="healthCheckLoading" @click="handleHealthCheckByRack" v-hasPermi="['wms:location:list']">按货架体检</el-button>
        </el-col>
      </el-row>
      
      <el-table v-loading="loading" :data="locationList" border empty-text="暂无货位" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="名称" prop="locationName" min-width="120" />
        <el-table-column label="编码" prop="locationCode" min-width="120" show-overflow-tooltip />
        <el-table-column label="仓库" prop="warehouseName" min-width="120" />
        <el-table-column label="库区" prop="areaName" min-width="120" />
        <el-table-column label="所属货架" min-width="120">
          <template #default="{ row }">
            <div>{{ row.rackName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="locationStatus" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_location_status" :value="row.locationStatus" />
          </template>
        </el-table-column>
        <el-table-column label="行号" prop="rowNo" width="80" align="center" />
        <el-table-column label="列号" prop="columnNo" width="80" align="center" />
        <el-table-column label="长(cm)" prop="length" width="90" align="center" />
        <el-table-column label="宽(cm)" prop="width" width="90" align="center" />
        <el-table-column label="高(cm)" prop="height" width="90" align="center" />
        <el-table-column label="占用状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="Number(row.occupiedFlag) === 1 ? 'warning' : 'success'">
              {{ Number(row.occupiedFlag) === 1 ? '已占用' : '空闲' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序号" prop="sortNo" width="90" align="center" />
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" align="right" width="160">
          <template #default="{ row }">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['wms:location:edit']">修改</el-button>
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

    <el-drawer :title="title" v-model="open" append-to-body size="40%" :close-on-click-modal="false">
      <div class="form-tip">当前仅支持维护型修改；仓库、库区、货架、行列、编码名称等结构字段仅供查看。</div>
      <el-descriptions :column="2" border class="mb16">
        <el-descriptions-item label="货位名称">{{ form.locationName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所属仓库">{{ getWarehouseName(form.warehouseId) }}</el-descriptions-item>
        <el-descriptions-item label="所属库区">{{ getAreaName(form.areaId) }}</el-descriptions-item>
        <el-descriptions-item label="所属货架">{{ getRackDisplayText() }}</el-descriptions-item>
        <el-descriptions-item label="格子坐标">{{ `第 ${form.rowNo || '-'} 行 / 第 ${form.columnNo || '-'} 列` }}</el-descriptions-item>
      </el-descriptions>
      <el-form ref="locationRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="货位状态" prop="locationStatus">
          <el-select v-model="form.locationStatus" placeholder="请选择货位状态" style="width: 100%">
            <el-option v-for="dict in wms_location_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="length">
          <template #label>
            <FormLabelHelp label="长" purpose="记录货位物理长度，用于容量与布局摘要展示。" example="60" />
          </template>
          <el-input-number v-model="form.length" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item prop="width">
          <template #label>
            <FormLabelHelp label="宽" purpose="货位宽度与所属货架宽度保持一致，当前页面不允许单独调整。" example="40" />
          </template>
          <el-input-number v-model="form.width" :min="0" :precision="2" style="width: 100%" disabled />
        </el-form-item>
        <el-form-item prop="height">
          <template #label>
            <FormLabelHelp label="高" purpose="记录货位物理高度，用于容量与布局摘要展示。" example="50" />
          </template>
          <el-input-number v-model="form.height" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="占用状态" prop="occupiedFlag">
          <el-radio-group v-model="form.occupiedFlag">
            <el-radio :label="0">空闲</el-radio>
            <el-radio :label="1">已占用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="sortNo">
          <template #label>
            <FormLabelHelp label="排序号" purpose="控制同货架下货位的展示顺序。" example="20" />
          </template>
          <el-input-number v-model="form.sortNo" :min="0" :precision="0" style="width: 100%" />
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

    <el-dialog v-model="resultDialog.visible" :title="resultDialog.title" width="720px" append-to-body>
      <el-descriptions v-if="resultDialog.data" :column="2" border>
        <el-descriptions-item label="货架编码">{{ resultDialog.data.rackCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货架名称">{{ resultDialog.data.rackName || '-' }}</el-descriptions-item>
        <template v-if="resultDialog.type === 'rebuild'">
          <el-descriptions-item label="应有货位数">{{ resultDialog.data.expectedLocationCount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="已存在数">{{ resultDialog.data.existingLocationCount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="新生成数">{{ resultDialog.data.createdLocationCount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="被阻止数">{{ resultDialog.data.blockedLocationCount ?? 0 }}</el-descriptions-item>
        </template>
        <template v-else>
          <el-descriptions-item label="应有货位数">{{ resultDialog.data.expectedLocationCount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="实际货位数">{{ resultDialog.data.actualLocationCount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="缺失数">{{ resultDialog.data.missingLocationCount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="重复格子数">{{ resultDialog.data.duplicateGridCount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="重复编码数">{{ resultDialog.data.duplicateCodeCount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="越界数">{{ resultDialog.data.outOfRangeCount ?? 0 }}</el-descriptions-item>
        </template>
      </el-descriptions>

      <div class="detail-header mt20">
        <span class="detail-title">结果说明</span>
      </div>
      <el-empty v-if="!resultDialog.data?.messages?.length" description="后端未返回额外说明" />
      <el-alert
        v-for="(message, index) in resultDialog.data?.messages || []"
        :key="`${resultDialog.type}-${index}`"
        :title="message"
        type="warning"
        :closable="false"
        class="mb12"
        show-icon
      />
      <template #footer>
        <el-button type="primary" @click="resultDialog.visible = false">我知道了</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="printDialog.visible" title="选择打印机" width="520px" append-to-body :close-on-click-modal="false" @closed="handlePrintDialogClosed">
      <el-form label-width="90px">
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

<script setup name="Location">
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import { getLocation, healthCheckByRack, listLocation, listLocationNoPage, rebuildByRack, updateLocation } from '@/api/wms/location';
import { getRack } from '@/api/wms/rack';
import { useWmsStore } from '@/store/modules/wms';
import RackSelect from '@/views/components/RackSelect.vue';
import FormLabelHelp from '@/views/components/FormLabelHelp.vue'
import { buildQrTscCommand, WssPrintClient } from '@/utils/wssPrintClient';

const { proxy } = getCurrentInstance();
const route = useRoute();
const { wms_location_status } = proxy.useDict('wms_location_status');
const wmsStore = useWmsStore();

const locationList = ref([]);
const open = ref(false);
const loading = ref(true);
const buttonLoading = ref(false);
const rackActionLoading = ref(false);
const healthCheckLoading = ref(false);
const total = ref(0);
const title = ref('');
const ids = ref([]);
const selectedRows = ref([]);
const originalDimension = ref({
  length: undefined,
  height: undefined
});
const resultDialog = reactive({
  visible: false,
  title: '',
  type: 'rebuild',
  data: {}
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

const printCodes = ref([]);
let printClient;

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    locationCode: undefined,
    locationName: undefined,
    warehouseId: undefined,
    areaId: undefined,
    rackId: undefined,
    locationStatus: undefined
  },
  rules: {
    locationStatus: [
      { required: true, message: '货位状态不能为空', trigger: 'change' }
    ]
  }
});

const { form, queryParams, rules } = toRefs(data);

const areaOptions = computed(() => {
  if (!queryParams.value.warehouseId) {
    return wmsStore.areaList;
  }
  return wmsStore.areaList.filter(item => item.warehouseId === queryParams.value.warehouseId);
});

function reset() {
  form.value = {
    id: undefined,
    locationName: undefined,
    warehouseId: undefined,
    areaId: undefined,
    rackId: undefined,
    locationStatus: 'enabled',
    rowNo: 1,
    columnNo: 1,
    length: undefined,
    width: undefined,
    height: undefined,
    occupiedFlag: 0,
    sortNo: 0,
    remark: undefined
  };
  originalDimension.value = {
    length: undefined,
    height: undefined
  };
  proxy.resetForm('locationRef');
}

function getWarehouseName(warehouseId) {
  return wmsStore.warehouseList.find(item => item.id === warehouseId)?.warehouseName || '-';
}

function getAreaName(areaId) {
  return wmsStore.areaList.find(item => item.id === areaId)?.areaName || '-';
}

function getRackDisplayText() {
  if (!form.value.rackId) {
    return '-';
  }
  const rackCode = form.value.rackCode ? ` / ${form.value.rackCode}` : '';
  return `${form.value.rackName || '未命名货架'}${rackCode}`;
}

function buildLocationUpdatePayload() {
  return {
    id: form.value.id,
    locationName: form.value.locationName,
    warehouseId: form.value.warehouseId,
    areaId: form.value.areaId,
    rackId: form.value.rackId,
    rowNo: form.value.rowNo,
    columnNo: form.value.columnNo,
    locationCode: form.value.locationCode,
    locationStatus: form.value.locationStatus,
    length: form.value.length,
    width: form.value.width,
    height: form.value.height,
    occupiedFlag: form.value.occupiedFlag,
    sortNo: form.value.sortNo,
    remark: form.value.remark
  };
}

function toSafeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

async function getList() {
  loading.value = true;
  try {
    const res = await listLocation(queryParams.value);
    locationList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleQueryWarehouseChange() {
  queryParams.value.areaId = undefined;
  queryParams.value.rackId = undefined;
}

function handleQueryAreaChange() {
  queryParams.value.rackId = undefined;
}

function handleSelectionChange(selection) {
  selectedRows.value = selection || [];
}

async function ensurePrintClient() {
  if (!printClient) {
    printClient = new WssPrintClient();
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

async function openPrintDialog() {
  printDialog.total = printCodes.value.length;
  printDialog.current = 0;
  printDialog.errorMessage = '';
  printDialog.visible = true;
  await loadPrinters();
}

async function handleBatchPrintLocation() {
  if (!selectedRows.value.length) {
    proxy.$modal.msgError('请先勾选要打印的货位');
    return;
  }
  const codes = selectedRows.value.map(item => item.locationCode).filter(Boolean);
  if (!codes.length) {
    proxy.$modal.msgError('勾选数据中未找到货位编码');
    return;
  }
  printCodes.value = codes;
  await openPrintDialog();
}

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
    for (const code of printCodes.value) {
      const command = buildQrTscCommand(code);
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
  printDialog.total = 0;
  printDialog.current = 0;
  try {
    printClient?.disconnect();
  } finally {
    printClient = undefined;
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  proxy.resetForm('queryRef');
  handleQuery();
}

async function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  const res = await getLocation(id);
  form.value = { ...res.data };
  originalDimension.value = {
    length: form.value.length,
    height: form.value.height
  };
  open.value = true;
  title.value = '维护货位';
}

async function submitForm() {
  const valid = await proxy.$refs.locationRef.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const lengthChanged = Number(form.value.length) !== Number(originalDimension.value.length);
  const heightChanged = Number(form.value.height) !== Number(originalDimension.value.height);

  // 长度校验: 当前货位所在行的长度之和不能超过货架实际长度。
  // 不能直接汇总整个货架，否则多行货架会天然超长并导致误判。
  if ((lengthChanged || heightChanged) && form.value.rackId != null) {
    try {
      const [rackRes, locationRes] = await Promise.all([
        getRack(form.value.rackId),
        listLocationNoPage({ rackId: form.value.rackId })
      ]);
      const locations = locationRes.data || [];
      const currentId = form.value.id == null ? undefined : String(form.value.id);

      if (lengthChanged && form.value.length != null && form.value.rowNo != null) {
        const rackLength = rackRes.data?.length;
        const currentRowNo = String(form.value.rowNo);
        const sameRowLocations = locations.filter(loc => String(loc.rowNo) === currentRowNo);
        const totalLength = sameRowLocations.reduce((sum, loc) => {
          const isCurrentLocation = currentId !== undefined && String(loc.id) === currentId;
          const locLength = isCurrentLocation ? form.value.length : loc.length;
          return sum + toSafeNumber(locLength);
        }, 0);
        if (rackLength != null && totalLength > toSafeNumber(rackLength)) {
          proxy.$modal.msgError(`货位长度之和不能超过货架实际长度(${rackLength}cm)`);
          return;
        }
      }

      // 高度校验: 当前货位所在列的高度之和不能超过货架实际高度。
      if (heightChanged && form.value.height != null && form.value.columnNo != null) {
        const rackHeight = rackRes.data?.height;
        const currentColumnNo = String(form.value.columnNo);
        const sameColumnLocations = locations.filter(loc => String(loc.columnNo) === currentColumnNo);
        const totalHeight = sameColumnLocations.reduce((sum, loc) => {
          const isCurrentLocation = currentId !== undefined && String(loc.id) === currentId;
          const locHeight = isCurrentLocation ? form.value.height : loc.height;
          return sum + toSafeNumber(locHeight);
        }, 0);
        if (rackHeight != null && totalHeight > toSafeNumber(rackHeight)) {
          proxy.$modal.msgError(`货位高度之和不能超过货架实际高度(${rackHeight}cm)`);
          return;
        }
      }
    } catch (e) {
      // 如果查询失败，不阻止提交，让后端兜底
      console.error('货位尺寸校验查询失败', e);
    }
  }

  buttonLoading.value = true;
  try {
    await updateLocation(buildLocationUpdatePayload());
    proxy.$modal.msgSuccess('维护修改成功');
    open.value = false;
    await getList();
  } finally {
    buttonLoading.value = false;
  }
}

function cancel() {
  open.value = false;
  reset();
}

function showResultDialog(type, data) {
  resultDialog.type = type;
  resultDialog.title = type === 'rebuild' ? '按货架重建结果' : '按货架体检结果';
  resultDialog.data = data || {};
  resultDialog.visible = true;
}

async function handleRebuildByRack() {
  if (!queryParams.value.rackId) {
    proxy.$modal.msgError('请先选择要重建的货架');
    return;
  }
  try {
    await proxy.$modal.confirm('确认按当前筛选货架执行重建吗？缺失货位会自动补建，后端返回的结果说明将完整展示。');
  } catch {
    return;
  }
  rackActionLoading.value = true;
  try {
    const res = await rebuildByRack(queryParams.value.rackId);
    showResultDialog('rebuild', res.data);
    proxy.$modal.msgSuccess('货架重建完成');
    await getList();
  } finally {
    rackActionLoading.value = false;
  }
}

async function handleHealthCheckByRack() {
  if (!queryParams.value.rackId) {
    proxy.$modal.msgError('请先选择要体检的货架');
    return;
  }
  healthCheckLoading.value = true;
  try {
    const res = await healthCheckByRack(queryParams.value.rackId);
    showResultDialog('health', res.data);
  } finally {
    healthCheckLoading.value = false;
  }
}

onMounted(async () => {
  await Promise.all([
    wmsStore.getWarehouseList(),
    wmsStore.getAreaList()
  ]);
  if (route.query.rackId) {
    queryParams.value.rackId = Number(route.query.rackId);
  }
  await getList();
});
</script>

<style scoped>
.sub-text,
.form-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.page-title {
  font-size: large;
  margin-bottom: 4px;
}

.form-tip {
  margin-bottom: 12px;
}

.toolbar-actions {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

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

.mb12 {
  margin-bottom: 12px;
}
</style>
