<template>
  <div class="app-container">
    <div class="item-layout">
      <!-- 左侧：器材分类树 -->
      <div class="category-panel">
        <div class="category-panel__header">
          <span class="category-panel__title">器材分类</span>
          <el-button link type="primary" icon="Plus" @click="handleAddType(true)" v-hasPermi="['wms:itemCategory:edit']">新增</el-button>
        </div>
        <div class="category-panel__all" :class="{ 'is-active': !queryParams.itemCategory }" @click="handleClearCategoryFilter">
          <el-icon><Menu /></el-icon>
          <span>全部分类</span>
        </div>
        <el-input v-model="categoryFilterText" placeholder="搜索分类" clearable size="small" prefix-icon="Search" class="category-panel__search" />
        <div class="category-panel__tree">
          <el-tree
            ref="categoryTreeRef"
            :data="categoryTreeOptions"
            :props="{ children: 'children', label: 'label' }"
            node-key="id"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            :filter-node-method="filterCategoryNode"
            @node-click="handleCategoryNodeClick"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span class="custom-tree-node__label">{{ node.label }}</span>
                <span class="custom-tree-node__actions" @click.stop>
                  <el-button link type="primary" icon="Plus" size="small" @click="handleAddChildCategory(data)" />
                  <el-button link type="primary" icon="Edit" size="small" @click="handleEditCategory(data)" />
                  <el-button link type="danger" icon="Delete" size="small" @click="handleDeleteCategory(data)" />
                </span>
              </span>
            </template>
          </el-tree>
          <el-empty v-if="!categoryTreeOptions.length" description="暂无分类" :image-size="64" />
        </div>
      </div>

      <!-- 右侧：搜索 + 器材列表 -->
      <div class="table-panel">
        <el-card>
          <el-form ref="queryRef" :model="queryParams" label-width="88px" class="query-form">
            <el-row :gutter="16">
              <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
                <el-form-item label="器材编码" prop="itemCode">
                  <el-input v-model="queryParams.itemCode" placeholder="请输入器材编码" clearable @keyup.enter="handleQuery" />
                </el-form-item>
              </el-col>
              <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
                <el-form-item label="器材名称" prop="itemName">
                  <el-input v-model="queryParams.itemName" placeholder="请输入器材名称" clearable @keyup.enter="handleQuery" />
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
          <div>
            <div class="panel-header">
              <span class="panel-title">器材管理</span>
              <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wms:item:edit']">新增器材</el-button>
            </div>

        <el-table v-loading="loading" :data="itemList" border empty-text="暂无器材">
          <el-table-column label="器材编码" prop="itemCode" min-width="120" show-overflow-tooltip />
          <el-table-column label="器材名称" prop="itemName" min-width="140" show-overflow-tooltip />
          <el-table-column label="规格信息" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <div v-if="row.sku?.length" class="sku-summary-cell">
                <el-tag v-for="sku in row.sku" :key="sku.id || sku.skuName" class="mr6 mb6" type="info">
                  {{ sku.skuName }}
                </el-tag>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="计量单位" prop="unit" min-width="100" show-overflow-tooltip />
          <el-table-column label="启用状态" min-width="100">
            <template #default="{ row }">
              <dict-tag :options="wms_item_status" :value="row.status" />
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
          <el-table-column label="操作" align="right" width="260" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" icon="Printer" @click="handleBatchPrintQrCode(row)">批量打印二维码</el-button>
              <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['wms:item:edit']">修改</el-button>
              <el-button link type="primary" icon="Delete" @click="handleDelete(row)" v-hasPermi="['wms:item:edit']">删除</el-button>
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
          </div>
        </el-card>
      </div>
    </div>

    <el-drawer :title="dialog.title" v-model="dialog.visible" size="78%" append-to-body :close-on-click-modal="false">
      <el-card>
        <template #header>
          <div class="panel-header">
            <span class="panel-title">器材基础信息</span>
          </div>
        </template>
        <el-form ref="itemFormRef" :model="form" :rules="rules" label-width="108px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="器材编码" prop="itemCode">
                <el-input v-model="form.itemCode" placeholder="请输入器材编码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="器材名称" prop="itemName">
                <el-input v-model="form.itemName" placeholder="请输入器材名称" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="器材分类" prop="itemCategory">
                <el-tree-select
                  v-model="form.itemCategory"
                  :data="categoryTreeOptions"
                  :props="{ value: 'id', label: 'label', children: 'children' }"
                  value-key="id"
                  check-strictly
                  clearable
                  placeholder="请选择器材分类"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计量单位" prop="unit">
                <el-input v-model="form.unit" placeholder="请输入计量单位 例:台/个/张/包" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="启用状态" prop="status">
                <el-radio-group v-model="form.status">
                  <el-radio v-for="item in wms_item_status" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <el-card class="mt20">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">器材规格信息</span>
            <el-button type="primary" plain icon="Plus" @click="handleAddSku">新增规格</el-button>
          </div>
        </template>
        <el-form ref="skuFormRef" :model="skuForm" :rules="skuRules" :show-message="false" label-width="110px">
          <div v-for="(sku, index) in skuForm.itemSkuList" :key="sku.id || `sku-${index}`" class="sku-edit-card">
            <div class="sku-edit-card__header">
              <span>规格{{ index + 1 }}</span>
              <el-button
                v-if="skuForm.itemSkuList.length > 1"
                link
                type="danger"
                icon="Delete"
                @click="handleRemoveSku(index)"
              >删除规格</el-button>
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item :prop="`itemSkuList.${index}.skuName`" :rules="skuRules.skuName" label="器材规格名称">
                  <el-input v-model="sku.skuName" placeholder="请输入器材规格名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="产品标识">
                  <el-input v-model="sku.productIdentifier" placeholder="请输入产品标识" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="状态">
                  <el-select v-model="sku.status" placeholder="请选择状态" style="width: 100%">
                    <el-option v-for="item in wms_item_sku_status" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </el-card>

      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-drawer>

    <el-dialog :title="categoryDialog.title" v-model="categoryDialog.visible" width="500px" append-to-body :close-on-click-modal="false">
      <el-form ref="itemCategoryFormRef" :model="categoryForm" :rules="typeRules" label-width="100px">
        <el-form-item label="上级分类" prop="parentId">
          <el-tree-select
            v-model="categoryForm.parentId"
            :data="categoryTreeOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            value-key="id"
            check-strictly
            clearable
            placeholder="请选择上级分类"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="categoryForm.categoryName" placeholder="请输入器材分类名称" @keyup.enter="submitCategoryForm" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitCategoryForm">确 定</el-button>
          <el-button @click="cancelType">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="printDialog.visible" title="批量打印器材二维码" width="520px" append-to-body :close-on-click-modal="false" @closed="handlePrintDialogClosed">
      <el-form label-width="90px">
        <el-form-item label="器材">
          <span>{{ printDialog.itemName || '-' }}</span>
        </el-form-item>
        <el-form-item label="打印规格">
          <el-select v-model="printDialog.skuId" placeholder="请选择规格" filterable style="width: 100%" :disabled="printDialog.loading || printDialog.sending">
            <el-option
              v-for="item in printDialog.skuOptions"
              :key="item.id"
              :label="formatPrintSkuLabel(item)"
              :value="item.id"
              :disabled="item.status === '0'"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="打印数量">
          <el-input-number
            v-model="printDialog.qrCodeCount"
            :min="1"
            :precision="0"
            :step="1"
            :disabled="printDialog.loading || printDialog.sending"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="打印机">
          <el-select v-model="printDialog.printerId" placeholder="请选择打印机" filterable style="width: 100%" :disabled="printDialog.loading || printDialog.sending">
            <el-option v-for="item in printDialog.printers" :key="item.printerId" :label="item.printerId" :value="item.printerId" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-alert v-if="printDialog.errorMessage" :title="printDialog.errorMessage" type="error" :closable="false" class="mb12" show-icon />
      <div v-if="printDialog.phase || printDialog.total" class="mb12">
        <span v-if="printDialog.phase === 'generating'">正在生成编码，请稍候…</span>
        <template v-else>
          <span>打印进度：{{ printDialog.current }}/{{ printDialog.total }}</span>
          <el-progress v-if="printDialog.total" :percentage="Math.round(printDialog.current / printDialog.total * 100)" :stroke-width="8" style="margin-top:4px" />
        </template>
      </div>
      <template #footer>
        <el-button :loading="printDialog.loading" :disabled="printDialog.sending" @click="loadPrinters">刷新</el-button>
        <el-button :disabled="printDialog.sending" @click="printDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="printDialog.sending" :disabled="!printDialog.printerId || !printDialog.printers.length" @click="handleConfirmPrint">开始打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Item">
import { computed, getCurrentInstance, nextTick, onMounted, reactive, ref, toRefs, watch } from 'vue';
import { Menu } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { addItem, batchPrintItemQrCode, delItem, getItem, listItemPage, updateItem } from '@/api/wms/item';
import { addItemCategory, delItemCategory, updateItemCategory } from '@/api/wms/itemCategory';
import { useWmsStore } from '@/store/modules/wms';
import { buildQrTscCommand, WssPrintClient, getPrintUrl } from '@/utils/wssPrintClient';

const route = useRoute();
const { proxy } = getCurrentInstance();
const wmsStore = useWmsStore();
const { wms_item_status, wms_item_sku_status } = proxy.useDict(
  'wms_item_status',
  'wms_item_sku_status'
);

const itemList = ref([]);
const loading = ref(true);
const buttonLoading = ref(false);
const total = ref(0);
const queryRef = ref();
const itemFormRef = ref();
const skuFormRef = ref();
const itemCategoryFormRef = ref();
const categoryTreeRef = ref();
const categoryFilterText = ref('');

const dialog = reactive({
  visible: false,
  title: ''
});

const categoryDialog = reactive({
  visible: false,
  title: ''
});

const printDialog = reactive({
  visible: false,
  loading: false,
  sending: false,
  row: null,
  itemName: '',
  skuId: undefined,
  skuOptions: [],
  qrCodeCount: 1,
  printers: [],
  printerId: '',
  total: 0,
  current: 0,
  phase: '',
  errorMessage: ''
});

const printCodes = ref([]);
let printClient;

const initFormData = () => ({
  id: undefined,
  itemCode: undefined,
  itemName: undefined,
  itemCategory: undefined,
  unit: undefined,
  status: '1',
  remark: undefined,
  sku: []
});

const initCategoryFormData = () => ({
  id: undefined,
  parentId: undefined,
  categoryName: undefined
});

const createEmptySku = () => ({
  id: undefined,
  itemId: undefined,
  skuName: '',
  productIdentifier: '',
  status: '1'
});

const data = reactive({
  form: initFormData(),
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    itemCode: undefined,
    itemName: undefined,
    itemCategory: undefined,
    orderByColumn: 'createTime',
    isAsc: 'asc'
  },
  rules: {
    itemCode: [
      { required: true, message: '器材编码不能为空', trigger: 'blur' }
    ],
    itemName: [
      { required: true, message: '器材名称不能为空', trigger: 'blur' }
    ]
  }
});

const categoryData = reactive({
  form: initCategoryFormData(),
  rules: {
    categoryName: [
      { required: true, message: '分类名称不能为空', trigger: 'blur' }
    ]
  }
});

const skuForm = reactive({
  itemSkuList: [createEmptySku()]
});

const skuRules = {
  skuName: [
    { required: true, message: '器材规格名称不能为空', trigger: 'blur' }
  ]
};

const { form, queryParams, rules } = toRefs(data);
const { form: categoryForm, rules: typeRules } = toRefs(categoryData);

const categoryTreeOptions = computed(() => wmsStore.itemCategoryTreeList || []);

watch(categoryFilterText, (val) => {
  categoryTreeRef.value?.filter(val);
});

const filterCategoryNode = (value, data) => {
  if (!value) return true;
  return data.label?.includes(value);
};

const handleCategoryNodeClick = (data) => {
  queryParams.value.itemCategory = data.id;
  queryParams.value.pageNum = 1;
  getList();
};

const handleAddChildCategory = (parentData) => {
  resetType();
  categoryForm.value.parentId = parentData.id;
  categoryDialog.title = '新增器材分类';
  categoryDialog.visible = true;
};

const handleEditCategory = async (data) => {
  resetType();
  categoryForm.value = { id: data.id, parentId: data.parentId, categoryName: data.label };
  categoryDialog.title = '修改器材分类';
  categoryDialog.visible = true;
};

const handleDeleteCategory = async (data) => {
  await proxy.$modal.confirm('确认删除分类【' + data.label + '】吗？');
  try {
    await delItemCategory(data.id);
    proxy.$modal.msgSuccess('删除成功');
    await refreshCategoryData();
    // 如果删除的是当前筛选的分类，清除筛选
    if (queryParams.value.itemCategory === data.id) {
      queryParams.value.itemCategory = undefined;
    }
    await getList();
  } catch (e) {
    if (e === 409) {
      return ElMessageBox.alert(
        '<div>分类【' + data.label + '】下存在器材或子分类，不能删除！</div>',
        '系统提示',
        { dangerouslyUseHTMLString: true }
      );
    }
    throw e;
  }
};

const resolveCategoryOption = (categoryId) => {
  if (categoryId === undefined || categoryId === null || categoryId === '') {
    return undefined;
  }
  return wmsStore.itemCategoryList.find(item => String(item.id) === String(categoryId));
};

const resolveCategoryId = (source = {}) => {
  const categoryId = source.itemCategory ?? source.categoryId ?? source.itemCategoryId ?? source.category?.id;
  if (categoryId === undefined || categoryId === null || categoryId === '') {
    return undefined;
  }
  return resolveCategoryOption(categoryId)?.id ?? categoryId;
};

const getCategoryName = (categoryId) => {
  if (!categoryId) {
    return '';
  }
  return resolveCategoryOption(categoryId)?.categoryName || '';
};

const refreshCategoryData = async () => {
  await Promise.all([
    wmsStore.getItemCategoryList(),
    wmsStore.getItemCategoryTreeList()
  ]);
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listItemPage(queryParams.value);
    itemList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const resetSkuList = () => {
  skuForm.itemSkuList = [createEmptySku()];
};

const normalizeSkuItem = (item) => {
  if (!item) {
    return createEmptySku();
  }
  const {
    length,
    width,
    height,
    grossWeight,
    netWeight,
    costPrice,
    sellingPrice,
    ...rest
  } = item;
  return {
    ...createEmptySku(),
    ...rest
  };
};

const normalizeSkuList = () => skuForm.itemSkuList.map(item => normalizeSkuItem(item));

const normalizeItemPayload = () => ({
  ...form.value,
  itemCategory: resolveCategoryId(form.value),
  sku: normalizeSkuList()
});

const reset = () => {
  form.value = initFormData();
  resetSkuList();
  proxy.resetForm('itemFormRef');
  nextTick(() => {
    proxy.resetForm('skuFormRef');
  });
};

const resetType = () => {
  categoryForm.value = initCategoryFormData();
  proxy.resetForm('itemCategoryFormRef');
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  proxy.resetForm('queryRef');
  resetCategoryFilter();
  handleQuery();
};

const handleAddType = (clearParent = false) => {
  resetType();
  categoryDialog.title = '新增器材分类';
  categoryDialog.visible = true;
  if (clearParent) {
    categoryForm.value.parentId = undefined;
  }
};

const handleClearCategoryFilter = () => {
  queryParams.value.itemCategory = undefined;
  queryParams.value.pageNum = 1;
  categoryTreeRef.value?.setCurrentKey(null);
  getList();
};

const resetCategoryFilter = () => {
  queryParams.value.itemCategory = undefined;
  categoryTreeRef.value?.setCurrentKey(null);
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增器材';
};

const handleAddSku = () => {
  skuForm.itemSkuList.push(createEmptySku());
};

const handleRemoveSku = (index) => {
  if (skuForm.itemSkuList.length <= 1) {
    proxy.$modal.msgError('至少保留一个器材规格');
    return;
  }
  skuForm.itemSkuList.splice(index, 1);
};

const handleUpdate = async (row) => {
  reset();
  const res = await getItem(row.id);
  form.value = {
    ...initFormData(),
    ...res.data,
    itemCategory: resolveCategoryId(res.data),
    status: res.data.status || '1'
  };
  skuForm.itemSkuList = res.data.sku?.length ? res.data.sku.map(item => normalizeSkuItem(item)) : [createEmptySku()];
  dialog.visible = true;
  dialog.title = '修改器材';
};

const handleBatchPrintQrCode = async (row) => {
  let skuOptions = row.sku || [];
  if (!skuOptions.length) {
    const res = await getItem(row.id);
    skuOptions = res.data?.sku || [];
  }
  if (!skuOptions.length) {
    proxy.$modal.msgError('当前器材未维护规格，无法批量打印二维码');
    return;
  }
  const defaultSku = skuOptions.find(item => item.status !== '0') || skuOptions[0];
  printDialog.row = {
    id: row.id,
    itemCode: row.itemCode,
    itemName: row.itemName,
    remark: row.remark
  };
  printDialog.itemName = row.itemName;
  printDialog.skuOptions = skuOptions;
  printDialog.skuId = defaultSku?.id;
  printDialog.qrCodeCount = 1;
  printDialog.visible = true;
  await loadPrinters();
};

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

async function openPrintDialog() {
  printDialog.total = printCodes.value.length;
  printDialog.current = 0;
  printDialog.errorMessage = '';
}

async function handleConfirmPrint() {
  if (!printDialog.printerId) {
    proxy.$modal.msgError('请选择打印机');
    return;
  }
  if (!printDialog.skuId) {
    proxy.$modal.msgError('请选择打印规格');
    return;
  }
  if (!Number.isInteger(Number(printDialog.qrCodeCount)) || Number(printDialog.qrCodeCount) <= 0) {
    proxy.$modal.msgError('请输入正确的打印数量');
    return;
  }
  localStorage.setItem('wss_print_printer_id', printDialog.printerId);
  printDialog.sending = true;
  printDialog.errorMessage = '';
  printDialog.phase = 'generating';
  try {
    const payload = {
      row: { ...printDialog.row },
      skuId: printDialog.skuId,
      qrCodeCount: Number(printDialog.qrCodeCount)
    };
    // 后端已批量优化，增大超时保护大批量场景（60秒）
    const res = await batchPrintItemQrCode(payload, { timeout: 60000 });
    const details = res?.data?.details || [];
    const codes = details.map(item => item.instanceCode).filter(Boolean);
    if (!codes.length) {
      proxy.$modal.msgError('后端未返回可打印的器材实例明细');
      return;
    }
    printCodes.value = codes;
    openPrintDialog();
    printDialog.phase = 'printing';
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
    printDialog.phase = '';
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
  printDialog.phase = '';
  printDialog.row = null;
  printDialog.itemName = '';
  printDialog.skuId = undefined;
  printDialog.skuOptions = [];
  printDialog.qrCodeCount = 1;
  printDialog.printers = [];
  printDialog.total = 0;
  printDialog.current = 0;
  printCodes.value = [];
  try {
    printClient?.disconnect();
  } finally {
    printClient = undefined;
  }
}

const validateSkuForm = async () => {
  if (!skuForm.itemSkuList.length) {
    proxy.$modal.msgError('至少包含一个器材规格');
    return false;
  }
  let valid = true;
  await skuFormRef.value.validate(result => {
    valid = result;
  });
  return valid;
};

const submitForm = () => {
  itemFormRef.value.validate(async valid => {
    if (!valid) {
      return;
    }
    const skuValid = await validateSkuForm();
    if (!skuValid) {
      return;
    }
    buttonLoading.value = true;
    const payload = normalizeItemPayload();
    try {
      if (form.value.id) {
        await updateItem(payload);
        proxy.$modal.msgSuccess('修改成功');
      } else {
        await addItem(payload);
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

const submitCategoryForm = () => {
  itemCategoryFormRef.value.validate(async valid => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      if (categoryForm.value.id) {
        await updateItemCategory(categoryForm.value);
        proxy.$modal.msgSuccess('修改成功');
      } else {
        await addItemCategory(categoryForm.value);
        proxy.$modal.msgSuccess('新增成功');
      }
      categoryDialog.visible = false;
      await refreshCategoryData();
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const cancelType = () => {
  categoryDialog.visible = false;
  resetType();
};

const handleDelete = async (row) => {
  await proxy.$modal.confirm('确认删除器材【' + row.itemName + '】吗？');
  try {
    await delItem(row.id);
  } catch (e) {
    if (e === 409) {
      return ElMessageBox.alert(
        '<div>器材【' + row.itemName + '】已有业务数据关联，不能删除！</div><div>请联系管理员处理。</div>',
        '系统提示',
        { dangerouslyUseHTMLString: true }
      );
    }
    throw e;
  }
  proxy.$modal.msgSuccess('删除成功');
  await getList();
};

onMounted(async () => {
  await refreshCategoryData();
  await getList();
  if (route.query.openDrawer) {
    handleAdd();
  }
});

const formatPrintSkuLabel = (sku) => {
  if (!sku) {
    return '';
  }
  const extras = [sku.productIdentifier].filter(Boolean).join(' / ');
  return extras ? `${sku.skuName} (${extras})` : sku.skuName;
};
</script>

<style scoped>
.item-layout {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

/* ===== 左侧分类面板 ===== */
.category-panel {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.category-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.category-panel__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.category-panel__all {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: var(--el-text-color-regular);
  transition: all 0.2s;
}

.category-panel__all:hover {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9, #ecf5ff);
}

.category-panel__all.is-active {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9, #ecf5ff);
  font-weight: 500;
}

.category-panel__search {
  padding: 0 12px;
  margin-bottom: 8px;
}

.category-panel__tree {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

/* ===== 树节点自定义 ===== */
.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 4px;
}

.custom-tree-node__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.custom-tree-node__actions {
  display: none;
  gap: 2px;
  flex-shrink: 0;
}

.custom-tree-node:hover .custom-tree-node__actions {
  display: inline-flex;
}

/* ===== 右侧表格面板 ===== */
.table-panel {
  flex: 1;
  min-width: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel-title {
  font-size: 16px;
  line-height: 16px;
}

.sku-edit-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 16px 16px 0;
}

.sku-edit-card + .sku-edit-card {
  margin-top: 16px;
}

.sku-edit-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
</style>

