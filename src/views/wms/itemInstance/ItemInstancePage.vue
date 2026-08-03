<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" label-width="112px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="器材识别码" prop="instanceCode">
              <el-input v-model="queryParams.instanceCode" placeholder="请输入器材识别码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="器材名称" prop="itemName">
              <el-input v-model="queryParams.itemName" placeholder="请输入器材名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="器材编码" prop="itemCode">
              <el-input v-model="queryParams.itemCode" placeholder="请输入器材编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="器材分类" prop="itemCategory">
              <el-tree-select
                v-model="queryParams.itemCategory"
                :data="wmsStore.itemCategoryTreeList"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                check-strictly
                placeholder="请选择器材分类"
                clearable
                filterable
                style="width: 100%"
                @change="handleQuery"
              />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="器材规格" prop="skuId">
              <el-select v-model="queryParams.skuId" placeholder="请选择器材规格" clearable filterable style="width: 100%" @change="handleQuery">
                <el-option
                  v-for="item in querySkuOptions"
                  :key="item.id"
                  :label="item.skuCode ? item.skuName + ' (' + item.skuCode + ')' : item.skuName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="器材状态" prop="instanceStatus">
              <el-select v-model="queryParams.instanceStatus" placeholder="请选择状态" clearable style="width: 100%" @change="handleQuery">
                <el-option v-for="dict in wms_item_instance_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
              <el-select v-model="queryParams.areaId" placeholder="请选择库区" clearable filterable style="width: 100%" @change="handleQuery">
                <el-option
                  v-for="item in queryAreaOptions"
                  :key="item.id"
                  :label="item.areaName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <div class="query-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              <el-button type="primary" plain icon="Upload" @click="handleImport" v-hasPermi="['wms:itemInstance:edit']">导入</el-button>
              <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['wms:itemInstance:list']">导出</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="8"><span style="font-size: large">库存明细</span></el-col>
        <el-col :span="8" style="text-align: right">
          <el-button type="success" plain icon="Position" :disabled="!selectedRows.length" @click="handleBatchRelocate" v-hasPermi="['wms:itemInstance:edit']">散件移位</el-button>
          <el-button type="primary" plain icon="Printer" :disabled="!selectedRows.length" :loading="printDialog.sending" @click="handleBatchPrint" v-hasPermi="['wms:itemInstance:list']">批量打印</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="itemInstanceList" border empty-text="暂无器材识别码" cell-class-name="vertical-top-cell" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" :selectable="canSelectRow" />
        <el-table-column label="器材识别码" prop="instanceCode" min-width="140" show-overflow-tooltip />
        <el-table-column label="器材名称" prop="itemName" min-width="110" show-overflow-tooltip />
        <el-table-column label="器材编码" prop="itemCode" min-width="100" show-overflow-tooltip />
        <el-table-column label="器材分类" min-width="80" show-overflow-tooltip>
          <template #default="{ row }">
            {{ resolveCategoryName(row) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="器材规格" prop="skuName" min-width="90" show-overflow-tooltip />
        <el-table-column label="质量等级" width="80">
          <template #default="{ row }">
            <dict-tag :options="wms_quality_grade" :value="row.qualityGrade" v-if="row.qualityGrade" />
          </template>
        </el-table-column>
        <el-table-column label="仓库" prop="warehouseName" width="80" show-overflow-tooltip />
        <el-table-column label="库区" prop="areaName" width="80" show-overflow-tooltip />
        <el-table-column label="器材状态" width="90">
          <template #default="{ row }">
            <dict-tag :options="wms_item_instance_status" :value="row.instanceStatus" />
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="60" show-overflow-tooltip />
        <el-table-column label="操作" align="right" width="130">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-popover
              placement="left"
              title="提示"
              :width="300"
              trigger="hover"
              :disabled="canEditRow(row)"
              :content="getEditDisabledMessage(row)"
            >
              <template #reference>
                <el-button link type="primary" :disabled="!canEditRow(row)" @click="handleUpdate(row)" v-hasPermi="['wms:itemInstance:edit']">修改</el-button>
              </template>
            </el-popover>
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

    <el-drawer :title="dialog.title" v-model="dialog.visible" size="55%" append-to-body :close-on-click-modal="false">
      <el-form ref="instanceFormRef" :model="form" :rules="rules" label-width="108px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="器材识别码" prop="instanceCode">
              <el-input v-model="form.instanceCode" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="器材状态" prop="instanceStatus">
              <el-input v-model="form.instanceStatus" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="器材名称">
              <el-input :model-value="form.itemName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="器材规格" prop="skuId">
              <el-input :model-value="form.skuName" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="箱码" prop="boxCode">
              <el-input v-model="form.boxCode" placeholder="未绑箱时可录入箱码" :disabled="hasBox(form)" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="位置">
              <el-input :model-value="`${form.warehouseName || '-'} / ${form.areaName || '-'} / ${form.rackName || '-'} / ${form.locationName || '-'}`" disabled />
            </el-form-item>
          </el-col>
        </el-row>
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

    <el-dialog title="器材详情" v-model="detailDialog.visible" width="720px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="器材识别码">{{ detailDialog.data.instanceCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="器材状态">
          <dict-tag :options="wms_item_instance_status" :value="detailDialog.data.instanceStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="器材名称">{{ detailDialog.data.itemName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="器材规格">{{ detailDialog.data.skuName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="借出状态">{{ isBorrowed(detailDialog.data) ? '已借出' : '未借出' }}</el-descriptions-item>
        <el-descriptions-item label="质量等级"><dict-tag :options="wms_quality_grade" :value="detailDialog.data.qualityGrade" v-if="detailDialog.data.qualityGrade" /><span v-else>-</span></el-descriptions-item>
        <el-descriptions-item label="质保期">{{ detailDialog.data.warrantyPeriod || '-' }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{ detailDialog.data.warehouseName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="库区">{{ detailDialog.data.areaName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货架">{{ detailDialog.data.rackName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货位">{{ detailDialog.data.locationName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="箱码">{{ detailDialog.data.boxCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="单号">{{ detailDialog.data.currentBusinessNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailDialog.data.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="printDialog.visible" title="批量打印器材二维码" width="520px" append-to-body :close-on-click-modal="false" @closed="handlePrintDialogClosed">
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

    <el-dialog :title="upload.title" v-model="upload.open" width="420px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <span>仅允许导入 xls、xlsx 格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 散件移位弹窗 -->
    <el-dialog title="散件批量移位" v-model="relocateDialog.visible" width="520px" append-to-body :close-on-click-modal="false">
      <el-alert
        v-if="relocateDialog.boxedItems.length"
        type="warning"
        :closable="false"
        class="mb16"
        :title="`已选择 ${relocateDialog.boxedItems.length} 个在箱器材，请先移除选择或使用箱体管理页的‘移位’功能`"
      />
      <el-form :model="relocateDialog.form" label-width="80px">
        <el-form-item label="目标仓库">
          <el-select v-model="relocateDialog.form.warehouseId" placeholder="请选择仓库" style="width:100%" @change="handleRelocateWarehouseChange">
            <el-option v-for="item in wmsStore.warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标库区">
          <el-select v-model="relocateDialog.form.areaId" placeholder="请选择库区" style="width:100%" clearable @change="handleRelocateAreaChange">
            <el-option v-for="item in relocateAreaList" :key="item.id" :label="item.areaName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标货架">
          <el-select v-model="relocateDialog.form.rackId" placeholder="请选择货架" style="width:100%" clearable @change="handleRelocateRackChange">
            <el-option v-for="item in relocateRackList" :key="item.id" :label="item.rackName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标货位">
          <el-select v-model="relocateDialog.form.locationId" placeholder="请选择货位" style="width:100%" clearable>
            <el-option v-for="item in relocateLocationList" :key="item.id" :label="item.locationName" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="relocateDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="relocateDialog.loading" @click="submitBatchRelocate">确认移位</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ItemInstance">
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getToken } from '@/utils/auth';
import {
  getItemInstance,
  listItemInstance,
  updateItemInstance,
  batchRelocateItemInstances
} from '@/api/wms/itemInstance';
import { listItemSku } from '@/api/wms/itemSku';
import { listRackNoPage } from '@/api/wms/rack';
import { listLocationNoPage } from '@/api/wms/location';
import { useWmsStore } from '@/store/modules/wms';
import { buildQrTscCommand, WssPrintClient, getPrintUrl } from '@/utils/wssPrintClient';

const { proxy } = getCurrentInstance();
const route = useRoute();
const { wms_item_instance_status, wms_quality_grade } = proxy.useDict('wms_item_instance_status', 'wms_quality_grade');
const wmsStore = useWmsStore();

const itemInstanceList = ref([]);
const querySkuOptions = ref([]);
const loading = ref(true);
const buttonLoading = ref(false);
const total = ref(0);
const queryRef = ref();
const instanceFormRef = ref();
const uploadRef = ref();
const selectedRows = ref([]);
const printCodes = ref([]);

const dialog = reactive({
  visible: false,
  title: ''
});

const detailDialog = reactive({
  visible: false,
  data: {}
});

const upload = reactive({
  open: false,
  title: '库存明细导入',
  isUploading: false,
  headers: { Authorization: 'Bearer ' + getToken() },
  url: import.meta.env.VITE_APP_BASE_API + '/wms/itemInstance/importData'
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
  instanceCode: undefined,
  itemName: undefined,
  skuName: undefined,
  instanceStatus: undefined,
  warehouseName: undefined,
  areaName: undefined,
  rackName: undefined,
  locationName: undefined,
  boxCode: undefined,
  remark: undefined
});

const data = reactive({
  form: initFormData(),
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    instanceCode: undefined,
    itemName: undefined,
    itemCode: undefined,
    itemCategory: undefined,
    skuId: undefined,
    instanceStatus: undefined,
    warehouseId: undefined,
    areaId: undefined,
    receiptOrderDetailId: undefined
  },
  rules: {}
});

const { form, queryParams, rules } = toRefs(data);

const queryAreaOptions = computed(() => {
  if (!queryParams.value.warehouseId) {
    return wmsStore.areaList;
  }
  return wmsStore.areaList.filter(item => item.warehouseId === queryParams.value.warehouseId);
});

const hasBox = (row) => !!row?.boxId;

const isBorrowed = (row) => row?.instanceStatus === '借出';

const resolveCategoryName = (row) => {
  if (!row) return ''
  if (row.categoryName) return row.categoryName
  if (row.itemCategoryName) return row.itemCategoryName
  const categoryId = row.itemCategory ?? row.itemCategoryId ?? row.categoryId ?? row.category?.id
  if (categoryId) {
    return wmsStore.itemCategoryMap.get(categoryId)?.categoryName || ''
  }
  return ''
}

const canEditRow = (row) => row?.instanceStatus === '在库';
const canSelectRow = (row) => row?.instanceStatus === '在库';

const getEditDisabledMessage = (row) => `器材识别码【${row?.instanceCode || '-'}】当前状态为【${row?.instanceStatus || '-'}】，无法修改！`;

const loadSkuOptions = async () => {
  const res = await listItemSku({});
  querySkuOptions.value = res.data || [];
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listItemInstance(queryParams.value);
    itemInstanceList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = async () => {
  proxy.resetForm('queryRef');
  queryParams.value.receiptOrderDetailId = undefined;
  queryParams.value.skuId = undefined;
  queryParams.value.itemCategory = undefined;
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  applyRouteQuery();
  await getList();
};

const applyRouteQuery = () => {
  const { receiptOrderDetailId, instanceCode, itemCode, skuId } = route.query;
  if (receiptOrderDetailId) {
    queryParams.value.receiptOrderDetailId = Number(receiptOrderDetailId);
  }
  if (instanceCode) {
    queryParams.value.instanceCode = instanceCode;
  }
  if (itemCode) {
    queryParams.value.itemCode = itemCode;
  }
  if (skuId) {
    queryParams.value.skuId = Number(skuId);
  }
};

const handleQueryWarehouseChange = () => {
  queryParams.value.areaId = undefined;
  handleQuery();
};

const reset = () => {
  form.value = initFormData();
  proxy.resetForm('instanceFormRef');
};

const handleUpdate = async (row) => {
  if (!canEditRow(row)) {
    proxy.$modal.msgWarning('仅在库状态的器材允许修改');
    return;
  }
  reset();
  const res = await getItemInstance(row.id);
  form.value = { ...initFormData(), ...res.data };
  dialog.visible = true;
  dialog.title = '修改库存明细';
};

const submitForm = () => {
  instanceFormRef.value.validate(async valid => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      await updateItemInstance(form.value);
      proxy.$modal.msgSuccess('修改成功');
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
  const res = await getItemInstance(row.id);
  detailDialog.data = res.data || {};
  detailDialog.visible = true;
};

const handleExport = () => {
  proxy.download('wms/itemInstance/export', { ...queryParams.value }, `item_instance_${new Date().getTime()}.xlsx`);
};

const handleImport = () => {
  upload.title = '库存明细导入';
  upload.open = true;
};

const importTemplate = () => {
  proxy.download('wms/itemInstance/importTemplate', {}, `item_instance_template_${new Date().getTime()}.xlsx`);
};

const handleFileUploadProgress = () => {
  upload.isUploading = true;
};

const handleFileSuccess = (response, file) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  proxy.$alert("<div style='overflow:auto;overflow-x:hidden;max-height:70vh;padding:10px 20px 0;'>" + response.msg + '</div>', '导入结果', {
    dangerouslyUseHTMLString: true
  });
  getList();
};

const submitFileForm = () => {
  uploadRef.value?.submit();
};

// ========== 打印二维码 ==========
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
    proxy.$modal.msgError('请先勾选要打印的器材');
    return;
  }
  const codes = selectedRows.value.map(item => item.instanceCode).filter(Boolean);
  if (!codes.length) {
    proxy.$modal.msgError('勾选数据中未找到器材识别码');
    return;
  }
  printCodes.value = codes;
  printDialog.total = codes.length;
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

watch(
  () => route.query,
  async () => {
    applyRouteQuery();
    await getList();
  }
);

onMounted(async () => {
  applyRouteQuery();
  await Promise.all([
    wmsStore.getWarehouseList(),
    wmsStore.getAreaList(),
    wmsStore.getItemCategoryTreeList(),
    wmsStore.getItemCategoryList(),
    loadSkuOptions()
  ]);
  await getList();
});

// ========== 散件批量移位 ==========
const relocateDialog = reactive({
  visible: false,
  loading: false,
  boxedItems: [],
  looseItems: [],
  form: {
    warehouseId: undefined,
    areaId: undefined,
    rackId: undefined,
    locationId: undefined
  }
});

const relocateAreaList = computed(() => {
  if (!relocateDialog.form.warehouseId) return wmsStore.areaList;
  return wmsStore.areaList.filter(a => a.warehouseId === relocateDialog.form.warehouseId);
});

const relocateRackList = ref([]);
const relocateLocationList = ref([]);

const handleBatchRelocate = () => {
  const sel = selectedRows.value.filter(r => r.instanceStatus === '在库');
  if (!sel.length) {
    proxy.$modal.msgWarning('请选择在库状态的器材进行移位');
    return;
  }
  const boxed = sel.filter(r => r.boxId);
  const loose = sel.filter(r => !r.boxId);
  if (boxed.length && !loose.length) {
    proxy.$modal.msgWarning('所选器材均在箱内，请使用箱体管理页的“移位”功能');
    return;
  }
  relocateDialog.boxedItems = boxed;
  relocateDialog.looseItems = loose;
  relocateDialog.form = { warehouseId: undefined, areaId: undefined, rackId: undefined, locationId: undefined };
  relocateRackList.value = [];
  relocateLocationList.value = [];
  relocateDialog.visible = true;
};

const handleRelocateWarehouseChange = () => {
  relocateDialog.form.areaId = undefined;
  relocateDialog.form.rackId = undefined;
  relocateDialog.form.locationId = undefined;
  relocateRackList.value = [];
  relocateLocationList.value = [];
};

const handleRelocateAreaChange = async () => {
  relocateDialog.form.rackId = undefined;
  relocateDialog.form.locationId = undefined;
  relocateLocationList.value = [];
  if (relocateDialog.form.areaId) {
    const res = await listRackNoPage({ areaId: relocateDialog.form.areaId });
    relocateRackList.value = res.data || [];
  } else {
    relocateRackList.value = [];
  }
};

const handleRelocateRackChange = async () => {
  relocateDialog.form.locationId = undefined;
  if (relocateDialog.form.rackId) {
    const res = await listLocationNoPage({ rackId: relocateDialog.form.rackId });
    relocateLocationList.value = res.data || [];
  } else {
    relocateLocationList.value = [];
  }
};

const submitBatchRelocate = async () => {
  const ids = relocateDialog.looseItems.map(r => r.id);
  if (!ids.length) {
    proxy.$modal.msgWarning('没有可移位的散件器材');
    return;
  }
  if (!relocateDialog.form.warehouseId) {
    proxy.$modal.msgWarning('请选择目标仓库');
    return;
  }
  relocateDialog.loading = true;
  try {
    await batchRelocateItemInstances({
      ids,
      warehouseId: relocateDialog.form.warehouseId,
      areaId: relocateDialog.form.areaId,
      rackId: relocateDialog.form.rackId,
      locationId: relocateDialog.form.locationId
    });
    proxy.$modal.msgSuccess(`成功移位 ${ids.length} 件器材`);
    relocateDialog.visible = false;
    await getList();
  } finally {
    relocateDialog.loading = false;
  }
};
</script>

<style scoped>
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

.query-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.query-form :deep(.el-form-item__label) {
  white-space: nowrap;
}

.query-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.vertical-top-cell {
  vertical-align: top;
}
</style>
