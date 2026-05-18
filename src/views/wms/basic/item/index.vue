<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="80px">
        <el-form-item label="器材名称" prop="itemName">
          <el-input v-model="queryParams.itemName" placeholder="请输入器材名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="器材类型" prop="equipmentType">
          <el-select v-model="queryParams.equipmentType" placeholder="请选择器材类型" clearable style="width: 120px">
            <el-option v-for="item in equipmentTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <div class="item-layout">
        <div class="category-panel">
          <div class="panel-header">
            <span class="panel-title">器材分类</span>
            <el-button type="primary" plain icon="Plus" @click="handleAddType(false)">新增分类</el-button>
          </div>
          <el-tree
            :data="categoryTreeWithRoot"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            node-key="id"
            default-expand-all
            highlight-current
            current-node-key="-1"
            draggable
            :allow-drop="collapse"
            :expand-on-click-node="false"
            @node-click="handleQueryType"
            @node-drop="handleNodeDrop"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span>{{ node.label }}</span>
                <span>
                  <el-button
                    v-if="data.id !== -1 && node.level < 2"
                    link
                    type="primary"
                    icon="Plus"
                    style="font-size: 12px"
                    @click.stop="append(data)"
                  >新增子分类</el-button>
                  <el-button
                    v-if="data.id !== -1"
                    link
                    type="primary"
                    icon="Edit"
                    style="font-size: 12px"
                    @click.stop="edit(node, data)"
                  >修改</el-button>
                  <el-button
                    v-if="data.id !== -1"
                    link
                    type="primary"
                    icon="Delete"
                    style="font-size: 12px"
                    @click.stop="remove(data)"
                  >删除</el-button>
                </span>
              </span>
            </template>
          </el-tree>
        </div>

        <div class="table-panel">
          <div class="panel-header">
            <span class="panel-title">器材管理</span>
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wms:item:edit']">新增器材</el-button>
          </div>

          <el-table v-loading="loading" :data="itemList" border empty-text="暂无器材">
            <el-table-column label="器材名称" prop="itemName" min-width="180" />
            <el-table-column label="器材类型" prop="equipmentType" min-width="140" show-overflow-tooltip />
            <el-table-column label="器材分类" min-width="140">
              <template #default="{ row }">
                {{ getCategoryName(resolveCategoryId(row)) }}
              </template>
            </el-table-column>
            <el-table-column label="计量单位" prop="unit" width="100" />
            <el-table-column label="启用状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '0' ? 'info' : 'success'">{{ row.status === '0' ? '停用' : '启用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" align="right" width="260">
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
      </div>
    </el-card>

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
              <el-form-item label="器材名称" prop="itemName">
                <el-input v-model="form.itemName" placeholder="请输入器材名称" />
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="器材分类" prop="itemCategory">
                <el-tree-select
                  v-model="form.itemCategory"
                  :data="categoryTreeOptions"
                  :props="{ value: 'id', label: 'label', children: 'children' }"
                  value-key="id"
                  check-strictly
                  placeholder="请选择器材分类"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="2">
              <el-button link type="primary" icon="Plus" @click="handleAddType(true)">新增分类</el-button>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="器材单位" prop="unit">
                <el-input v-model="form.unit" placeholder="请输入器材单位" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
            </el-col>
            <el-col :span="12">
              <el-form-item label="器材类型" prop="equipmentType">
                <el-select v-model="form.equipmentType" placeholder="请选择器材类型" clearable style="width: 100%">
                  <el-option v-for="item in equipmentTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
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
                  <el-radio label="1">启用</el-radio>
                  <el-radio label="0">停用</el-radio>
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
          </div>
        </template>
        <el-form ref="skuFormRef" :model="skuForm" :rules="skuRules" :show-message="false" label-width="110px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item prop="itemSkuList.0.skuName" :rules="skuRules.skuName" label="器材规格名称">
                <el-input v-model="skuForm.itemSkuList[0].skuName" placeholder="请输入器材规格名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="规格型号">
                <el-input v-model="skuForm.itemSkuList[0].specModel" placeholder="请输入规格型号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="状态">
                <el-select v-model="skuForm.itemSkuList[0].status" placeholder="请选择状态" style="width: 100%">
                  <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
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

<script setup name="Item">
import { computed, getCurrentInstance, nextTick, onMounted, reactive, ref, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { addItem, batchPrintItemQrCode, delItem, getItem, listItemPage, updateItem } from '@/api/wms/item';
import { addItemCategory, delItemCategory, updateItemCategory, updateOrderNum } from '@/api/wms/itemCategory';
import { useWmsStore } from '@/store/modules/wms';
import { buildQrTscCommand, WssPrintClient } from '@/utils/wssPrintClient';

const route = useRoute();
const { proxy } = getCurrentInstance();
const wmsStore = useWmsStore();


const equipmentTypeOptions = [
  { label: '通装', value: '通装' },
  { label: '专装', value: '专装' }
];

const statusOptions = [
  { label: '启用', value: '1' },
  { label: '停用', value: '0' }
];

const itemList = ref([]);
const loading = ref(true);
const buttonLoading = ref(false);
const total = ref(0);
const queryRef = ref();
const itemFormRef = ref();
const skuFormRef = ref();
const itemCategoryFormRef = ref();

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
  printers: [],
  printerId: '',
  total: 0,
  current: 0,
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
  equipmentType: undefined,
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
  specModel: '',
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
    equipmentType: undefined
  },
  rules: {
    itemName: [
      { required: true, message: '器材名称不能为空', trigger: 'blur' }
    ],
    itemCategory: [
      { required: true, message: '器材分类不能为空', trigger: 'change' }
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
const categoryTreeWithRoot = computed(() => {
  return [
    {
      id: -1,
      label: '全部',
      children: categoryTreeOptions.value
    }
  ];
});

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

const normalizeSkuList = () => skuForm.itemSkuList.slice(0, 1).map(item => normalizeSkuItem(item));

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
  handleQuery();
};

const handleQueryType = (data) => {
  queryParams.value.pageNum = 1;
  queryParams.value.itemCategory = data.id === -1 ? undefined : data.id;
  getList();
};

const handleAddType = (clearParent = false) => {
  resetType();
  categoryDialog.title = '新增器材分类';
  categoryDialog.visible = true;
  if (clearParent) {
    categoryForm.value.parentId = undefined;
  }
};

const append = (data) => {
  resetType();
  categoryDialog.title = '新增子分类';
  categoryDialog.visible = true;
  categoryForm.value.parentId = data.id;
};

const edit = (node, data) => {
  resetType();
  categoryDialog.title = '修改器材分类';
  categoryDialog.visible = true;
  categoryForm.value.id = data.id;
  categoryForm.value.categoryName = data.label;
  categoryForm.value.parentId = node.level > 1 ? node.parent.data.id : undefined;
};

const remove = async (data) => {
  await proxy.$modal.confirm('确认删除分类【' + data.label + '】吗？');
  await delItemCategory(data.id);
  proxy.$modal.msgSuccess('删除成功');
  await refreshCategoryData();
  await getList();
};

const collapse = (draggingNode, dropNode, type) => {
  if (draggingNode.data.id === -1) {
    return false;
  }
  if (draggingNode.level === dropNode.level && draggingNode.parent.id === dropNode.parent.id) {
    if (dropNode.data.id === -1) {
      return type === 'next';
    }
    return type === 'prev' || type === 'next';
  }
  return false;
};

const handleNodeDrop = async (draggingNode, dropNode) => {
  if (dropNode.level === 1) {
    await updateOrderNum(dropNode.parent.data.filter(item => item.id !== -1));
  } else {
    await updateOrderNum(dropNode.parent.data.children);
  }
  await refreshCategoryData();
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增器材';
};

const handleUpdate = async (row) => {
  reset();
  const res = await getItem(row.id);
  form.value = {
    ...initFormData(),
    ...res.data,
    itemCategory: resolveCategoryId(res.data),
    equipmentType: res.data.equipmentType || res.data.itemType,
    status: res.data.status || '1'
  };
  skuForm.itemSkuList = res.data.sku?.length ? [normalizeSkuItem(res.data.sku[0])] : [createEmptySku()];
  dialog.visible = true;
  dialog.title = '修改器材';
};

const handleBatchPrintQrCode = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt(
      '请输入要打印的二维码个数',
      '批量打印器材二维码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        inputValue: '1',
        inputPattern: /^[1-9]\d*$/,
        inputErrorMessage: '请输入大于0的整数'
      }
    );
    const payload = {
      row: { ...row },
      qrCodeCount: Number(value)
    };
    const res = await batchPrintItemQrCode(payload);
    const details = res?.data?.details || [];
    const codes = details.map(item => item.instanceCode).filter(Boolean);
    if (!codes.length) {
      proxy.$modal.msgError('后端未返回可打印的器材实例明细');
      return;
    }
    printCodes.value = codes;
    await openPrintDialog();
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return;
    }
    throw error;
  }
};

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
</script>

<style scoped>
.item-layout {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.category-panel {
  width: 360px;
  flex-shrink: 0;
}

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

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.el-tree-node__content {
  height: 35px;
}
</style>

