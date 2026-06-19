<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" label-width="112px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="器材实例编码" prop="instanceCode">
              <el-input v-model="queryParams.instanceCode" placeholder="请输入器材实例编码" clearable @keyup.enter="handleQuery" />
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
      </el-row>

      <el-table v-loading="loading" :data="itemInstanceList" border empty-text="暂无器材实例编码" cell-class-name="vertical-top-cell">
        <el-table-column label="器材实例编码" prop="instanceCode" min-width="160" show-overflow-tooltip />
        <el-table-column label="器材名称" prop="itemName" min-width="120" show-overflow-tooltip />
        <el-table-column label="器材编码" prop="itemCode" min-width="110" show-overflow-tooltip />
        <el-table-column label="器材规格" prop="skuName" min-width="110" show-overflow-tooltip />
        <el-table-column label="仓库" prop="warehouseName" min-width="90" show-overflow-tooltip />
        <el-table-column label="库区" prop="areaName" min-width="90" show-overflow-tooltip />
        <el-table-column label="器材状态" width="90">
          <template #default="{ row }">
            <dict-tag :options="wms_item_instance_status" :value="row.instanceStatus" />
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="80" show-overflow-tooltip />
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
            <el-form-item label="器材实例编码" prop="instanceCode">
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

    <el-dialog title="器材实例编码详情" v-model="detailDialog.visible" width="720px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="器材实例编码">{{ detailDialog.data.instanceCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="器材状态">
          <dict-tag :options="wms_item_instance_status" :value="detailDialog.data.instanceStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="器材名称">{{ detailDialog.data.itemName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="器材规格">{{ detailDialog.data.skuName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="在箱状态">{{ hasBox(detailDialog.data) ? '在箱' : '不在箱' }}</el-descriptions-item>
        <el-descriptions-item label="借出状态">{{ isBorrowed(detailDialog.data) ? '已借出' : '未借出' }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{ detailDialog.data.warehouseName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="库区">{{ detailDialog.data.areaName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货架">{{ detailDialog.data.rackName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货位">{{ detailDialog.data.locationName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="箱码">{{ detailDialog.data.boxCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="单号">{{ detailDialog.data.currentBusinessNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailDialog.data.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
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
  </div>
</template>

<script setup name="ItemInstance">
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getToken } from '@/utils/auth';
import {
  getItemInstance,
  listItemInstance,
  updateItemInstance
} from '@/api/wms/itemInstance';
import { listItemSku } from '@/api/wms/itemSku';
import { useWmsStore } from '@/store/modules/wms';

const { proxy } = getCurrentInstance();
const route = useRoute();
const { wms_item_instance_status } = proxy.useDict('wms_item_instance_status');
const wmsStore = useWmsStore();

const itemInstanceList = ref([]);
const querySkuOptions = ref([]);
const loading = ref(true);
const buttonLoading = ref(false);
const total = ref(0);
const queryRef = ref();
const instanceFormRef = ref();
const uploadRef = ref();

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

const canEditRow = (row) => row?.instanceStatus === '在库';

const getEditDisabledMessage = (row) => `器材实例【${row?.instanceCode || '-'}】当前状态为【${row?.instanceStatus || '-'}】，无法修改！`;

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
    proxy.$modal.msgWarning('仅在库状态的器材实例允许修改');
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
    loadSkuOptions()
  ]);
  await getList();
});
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
