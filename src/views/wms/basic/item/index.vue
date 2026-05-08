<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="80px">
        <el-form-item label="类型编码" prop="itemCode">
          <el-input v-model="queryParams.itemCode" placeholder="请输入器材类型编码" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="器材名称" prop="itemName">
          <el-input v-model="queryParams.itemName" placeholder="请输入器材名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="装备名称" prop="equipmentName">
          <el-input v-model="queryParams.equipmentName" placeholder="请输入装备名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="规格型号" prop="modelText">
          <el-input v-model="queryParams.modelText" placeholder="请输入规格型号" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="装载模式" prop="itemType">
          <el-select v-model="queryParams.itemType" placeholder="请选择装载模式" clearable style="width: 160px">
            <el-option v-for="dict in wms_item_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="器材类型" prop="equipmentType">
          <el-input v-model="queryParams.equipmentType" placeholder="请输入器材类型" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="明细模式" prop="defaultTrackingMode">
          <el-select v-model="queryParams.defaultTrackingMode" placeholder="请选择器材明细生成方式" clearable style="width: 160px">
            <el-option v-for="dict in wms_tracking_mode" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="允许装箱" prop="allowBox">
          <el-select v-model="queryParams.allowBox" placeholder="请选择" clearable style="width: 120px">
            <el-option v-for="item in allowBoxOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属单位" prop="defaultBelongUnit">
          <el-input v-model="queryParams.defaultBelongUnit" placeholder="请输入默认所属单位" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="质量等级" prop="defaultQualityGrade">
          <el-select v-model="queryParams.defaultQualityGrade" placeholder="请选择质量等级" clearable style="width: 160px">
            <el-option v-for="dict in wms_quality_grade" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-table-column label="类型编码" prop="itemCode" min-width="120" />
            <el-table-column label="器材名称" prop="itemName" min-width="180" />
            <el-table-column label="装备名称" prop="equipmentName" min-width="160" show-overflow-tooltip />
            <el-table-column label="器材类型" prop="equipmentType" min-width="140" show-overflow-tooltip />
            <el-table-column label="器材分类" min-width="140">
              <template #default="{ row }">
                {{ getCategoryName(row.itemCategory) }}
              </template>
            </el-table-column>
            <el-table-column label="器材品牌" min-width="120">
              <template #default="{ row }">
                {{ getBrandName(row.itemBrand) }}
              </template>
            </el-table-column>
            <el-table-column label="单位" prop="unit" width="100" />
            <el-table-column label="装载模式" width="110">
              <template #default="{ row }">
                <dict-tag :options="wms_item_type" :value="row.itemType" />
              </template>
            </el-table-column>
            <el-table-column label="明细模式" width="110">
              <template #default="{ row }">
                <dict-tag :options="wms_tracking_mode" :value="row.defaultTrackingMode || row.trackingMode" />
              </template>
            </el-table-column>
            <el-table-column label="允许装箱" width="100">
              <template #default="{ row }">
                <el-tag :type="row.allowBox === 1 ? 'success' : 'info'">{{ row.allowBox === 1 ? '允许' : '不允许' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="所属单位" prop="defaultBelongUnit" min-width="140" show-overflow-tooltip />
            <el-table-column label="启用状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '0' ? 'info' : 'success'">{{ row.status === '0' ? '停用' : '启用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="默认质量等级" width="130">
              <template #default="{ row }">
                <dict-tag :options="wms_quality_grade" :value="row.defaultQualityGrade" />
              </template>
            </el-table-column>
            <el-table-column label="产品标识规则" prop="productMarkRule" min-width="160" show-overflow-tooltip />
            <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" align="right" width="160">
              <template #default="{ row }">
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
              <el-form-item label="类型编码" prop="itemCode">
                <el-input v-model="form.itemCode" placeholder="请输入器材类型编码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="器材单位" prop="unit">
                <el-input v-model="form.unit" placeholder="请输入器材单位" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="器材品牌" prop="itemBrand">
                <el-select v-model="form.itemBrand" clearable filterable style="width: 100%" placeholder="请选择器材品牌">
                  <el-option
                    v-for="item in wmsStore.itemBrandList"
                    :key="item.id"
                    :label="item.brandName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="装备名称" prop="equipmentName">
                <el-input v-model="form.equipmentName" placeholder="请输入装备名称" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="装载模式" prop="itemType">
                <el-select v-model="form.itemType" placeholder="请选择通装/专装" style="width: 100%">
                  <el-option v-for="dict in wms_item_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="器材类型" prop="equipmentType">
                <el-input v-model="form.equipmentType" placeholder="请输入器材类型" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="明细模式" prop="defaultTrackingMode">
                <el-select v-model="form.defaultTrackingMode" placeholder="请选择器材明细生成方式" style="width: 100%">
                  <el-option v-for="dict in wms_tracking_mode" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="允许装箱" prop="allowBox">
                <el-radio-group v-model="form.allowBox">
                  <el-radio :label="1">允许</el-radio>
                  <el-radio :label="0">不允许</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="所属单位" prop="defaultBelongUnit">
                <el-input v-model="form.defaultBelongUnit" placeholder="请输入默认所属单位" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="默认质量等级" prop="defaultQualityGrade">
                <el-select v-model="form.defaultQualityGrade" placeholder="请选择质量等级" clearable style="width: 100%">
                  <el-option v-for="dict in wms_quality_grade" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="启用状态" prop="status">
                <el-radio-group v-model="form.status">
                  <el-radio label="1">启用</el-radio>
                  <el-radio label="0">停用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="产品标识规则" prop="productMarkRule">
                <el-input v-model="form.productMarkRule" placeholder="请输入产品标识规则" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <el-card class="mt20">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">器材规格</span>
          </div>
        </template>
        <el-form ref="skuFormRef" :model="skuForm" :rules="skuRules" :show-message="false">
          <el-table :data="skuForm.itemSkuList" border empty-text="暂无器材规格" cell-class-name="my-cell">
            <el-table-column label="器材规格名称" min-width="160">
              <template #default="{ row, $index }">
                <el-form-item :prop="'itemSkuList.' + $index + '.skuName'" :rules="skuRules.skuName" style="margin-bottom: 0">
                  <el-input v-model="row.skuName" placeholder="请输入器材规格名称" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="规格型号/默认单价" width="240">
              <template #default="{ row }">
                <div class="flex-center">
                  <span class="field-label">型号</span>
                  <el-input v-model="row.specModel" placeholder="规格型号" />
                </div>
                <div class="flex-center mt5">
                  <span class="field-label">单价</span>
                  <el-input-number v-model="row.defaultUnitPrice" :controls="false" :min="0" :precision="2" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="编号/条码" width="260">
              <template #default="{ row }">
                <div class="flex-center">
                  <span class="field-label">编号</span>
                  <el-input v-model="row.skuCode" />
                </div>
                <div class="flex-center mt5">
                  <span class="field-label">条码</span>
                  <el-input v-model="row.barcode" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="长/宽/高(cm)" width="220">
              <template #default="{ row }">
                <div class="flex-center">
                  <span class="mini-label">长</span>
                  <el-input-number v-model="row.length" :controls="false" :min="0" :precision="1" class="mr5" />
                </div>
                <div class="flex-center mt5">
                  <span class="mini-label">宽</span>
                  <el-input-number v-model="row.width" :controls="false" :min="0" :precision="1" class="mr5" />
                </div>
                <div class="flex-center mt5">
                  <span class="mini-label">高</span>
                  <el-input-number v-model="row.height" :controls="false" :min="0" :precision="1" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="质量等级/状态" width="220">
              <template #default="{ row }">
                <div class="flex-center">
                  <span class="field-label">质等</span>
                  <el-select v-model="row.defaultQualityGrade" placeholder="质量等级" clearable style="width: 100%">
                    <el-option v-for="dict in wms_quality_grade" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </div>
                <div class="flex-center mt5">
                  <span class="field-label">状态</span>
                  <el-select v-model="row.status" placeholder="状态" style="width: 100%">
                    <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="净重/毛重(kg)" width="220">
              <template #default="{ row }">
                <div class="flex-center">
                  <span class="mini-label">净重</span>
                  <el-input-number v-model="row.netWeight" :controls="false" :min="0" :precision="3" />
                </div>
                <div class="flex-center mt5">
                  <span class="mini-label">毛重</span>
                  <el-input-number v-model="row.grossWeight" :controls="false" :min="0" :precision="3" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="体积/成本销售(元)" width="260">
              <template #default="{ row }">
                <div class="flex-center">
                  <span class="field-label">体积</span>
                  <el-input :model-value="formatVolume(row)" disabled />
                </div>
                <div class="flex-center mt5">
                  <span class="field-label">成本价</span>
                  <el-input-number v-model="row.costPrice" :controls="false" :min="0" :precision="2" />
                </div>
                <div class="flex-center mt5">
                  <span class="field-label">销售价</span>
                  <el-input-number v-model="row.sellingPrice" :controls="false" :min="0" :precision="2" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90" align="right">
              <template #default="{ row, $index }">
                <el-button link type="primary" icon="Delete" @click="handleDeleteItemSku(row, $index)">删除</el-button>
              </template>
            </el-table-column>
            <template #append>
              <div class="append-btn-wrap">
                <el-button text type="primary" icon="Plus" @click="onAppendBtnClick">添加器材规格</el-button>
              </div>
            </template>
          </el-table>
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
  </div>
</template>

<script setup name="Item">
import { computed, getCurrentInstance, nextTick, onMounted, reactive, ref, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { addItem, delItem, getItem, listItemPage, updateItem } from '@/api/wms/item';
import { addItemCategory, delItemCategory, updateItemCategory, updateOrderNum } from '@/api/wms/itemCategory';
import { delItemSku } from '@/api/wms/itemSku';
import { useWmsStore } from '@/store/modules/wms';

const route = useRoute();
const { proxy } = getCurrentInstance();
const { wms_item_type, wms_tracking_mode, wms_quality_grade } = proxy.useDict(
  'wms_item_type',
  'wms_tracking_mode',
  'wms_quality_grade'
);
const wmsStore = useWmsStore();

const allowBoxOptions = [
  { label: '允许', value: 1 },
  { label: '不允许', value: 0 }
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

const initFormData = () => ({
  id: undefined,
  itemCode: undefined,
  itemName: undefined,
  itemCategory: undefined,
  unit: undefined,
  itemBrand: undefined,
  itemType: 'normal',
  trackingMode: 'batch',
  allowBox: 0,
  equipmentName: undefined,
  equipmentType: undefined,
  status: '1',
  defaultTrackingMode: 'batch',
  defaultBelongUnit: undefined,
  defaultQualityGrade: undefined,
  productMarkRule: undefined,
  modelText: undefined,
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
  skuCode: '',
  barcode: '',
  specModel: '',
  defaultUnitPrice: undefined,
  defaultQualityGrade: undefined,
  status: '1',
  volume: undefined,
  length: undefined,
  width: undefined,
  height: undefined,
  grossWeight: undefined,
  netWeight: undefined,
  costPrice: undefined,
  sellingPrice: undefined
});

const data = reactive({
  form: initFormData(),
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    itemCode: undefined,
    itemName: undefined,
    equipmentName: undefined,
    modelText: undefined,
    itemCategory: undefined,
    itemType: undefined,
    trackingMode: undefined,
    defaultTrackingMode: undefined,
    allowBox: undefined,
    equipmentType: undefined,
    defaultBelongUnit: undefined,
    defaultQualityGrade: undefined
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

const getCategoryName = (categoryId) => {
  if (!categoryId) {
    return '';
  }
  return wmsStore.itemCategoryMap.get(Number(categoryId))?.categoryName || '';
};

const getBrandName = (brandId) => {
  if (!brandId) {
    return '';
  }
  return wmsStore.itemBrandMap.get(brandId)?.brandName || '';
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

const formatVolume = (row) => {
  const length = Number(row.length || 0);
  const width = Number(row.width || 0);
  const height = Number(row.height || 0);
  if (!length || !width || !height) {
    return '-';
  }
  return (length * width * height / 1000000).toFixed(4);
};

const normalizeSkuList = () => skuForm.itemSkuList.map(item => ({
  ...item,
  volume: item.volume ?? (formatVolume(item) === '-' ? undefined : Number(formatVolume(item)))
}));

const normalizeItemPayload = () => ({
  ...form.value,
  trackingMode: form.value.defaultTrackingMode,
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
    defaultTrackingMode: res.data.defaultTrackingMode || res.data.trackingMode || 'batch',
    equipmentType: res.data.equipmentType || res.data.itemType,
    status: res.data.status || '1'
  };
  skuForm.itemSkuList = res.data.sku?.length ? res.data.sku.map(item => ({ ...item })) : [createEmptySku()];
  dialog.visible = true;
  dialog.title = '修改器材';
};

const onAppendBtnClick = () => {
  skuForm.itemSkuList.push(createEmptySku());
};

const handleDeleteItemSku = async (row, index) => {
  if (skuForm.itemSkuList.length === 1) {
    proxy.$modal.msgError('至少包含一个器材规格');
    return;
  }
  if (!row.id) {
    skuForm.itemSkuList.splice(index, 1);
    return;
  }
  await proxy.$modal.confirm('确认删除规格【' + row.skuName + '】吗？');
  try {
    await delItemSku(row.id);
  } catch (e) {
    if (e === 409) {
      return ElMessageBox.alert(
        '<div>规格【' + row.skuName + '】已有业务数据关联，不能删除！</div><div>请联系管理员处理。</div>',
        '系统提示',
        { dangerouslyUseHTMLString: true }
      );
    }
    throw e;
  }
  proxy.$modal.msgSuccess('删除成功');
  const res = await getItem(form.value.id);
  skuForm.itemSkuList = res.data.sku?.length ? res.data.sku.map(item => ({ ...item })) : [createEmptySku()];
};

const validateSkuForm = async () => {
  if (!skuForm.itemSkuList.length) {
    proxy.$modal.msgError('至少包含一个器材规格');
    return false;
  }
  const skuNames = skuForm.itemSkuList.map(item => item.skuName).filter(Boolean);
  if (new Set(skuNames).size !== skuNames.length) {
    proxy.$modal.msgError('器材规格名称不能重复');
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
  await Promise.all([
    refreshCategoryData(),
    wmsStore.getItemBrandList()
  ]);
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

.my-cell {
  vertical-align: top;
}

.append-btn-wrap {
  padding: 8px 0;
  text-align: center;
}

.field-label {
  width: 52px;
  flex-shrink: 0;
}

.mini-label {
  width: 28px;
  flex-shrink: 0;
}
</style>


