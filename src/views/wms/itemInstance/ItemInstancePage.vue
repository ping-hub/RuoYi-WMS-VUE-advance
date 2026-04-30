<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="88px">
        <el-form-item label="单品码" prop="instanceCode">
          <el-input v-model="queryParams.instanceCode" placeholder="请输入单品码" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="商品" prop="itemId">
          <el-select v-model="queryParams.itemId" placeholder="请选择商品" clearable filterable style="width: 200px" @change="handleQueryItemChange">
            <el-option
              v-for="item in itemOptions"
              :key="item.id"
              :label="item.itemCode ? item.itemName + ' (' + item.itemCode + ')' : item.itemName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规格" prop="skuId">
          <el-select v-model="queryParams.skuId" placeholder="请选择规格" clearable filterable style="width: 180px">
            <el-option
              v-for="item in querySkuOptions"
              :key="item.id"
              :label="item.skuCode ? item.skuName + ' (' + item.skuCode + ')' : item.skuName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单品状态" prop="instanceStatus">
          <el-select v-model="queryParams.instanceStatus" placeholder="请选择状态" clearable style="width: 160px">
            <el-option v-for="dict in wms_item_instance_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="在箱状态" prop="inBox">
          <el-select v-model="queryParams.inBox" placeholder="请选择" clearable style="width: 120px">
            <el-option v-for="item in yesNoOptions" :key="'box-' + item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="借出状态" prop="borrowed">
          <el-select v-model="queryParams.borrowed" placeholder="请选择" clearable style="width: 120px">
            <el-option v-for="item in yesNoOptions" :key="'borrow-' + item.value" :label="item.label" :value="item.value" />
          </el-select>
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
              v-for="item in queryAreaOptions"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="货架" prop="rackId">
          <RackSelect v-model="queryParams.rackId" :warehouse-id="queryParams.warehouseId" :area-id="queryParams.areaId" />
        </el-form-item>
        <el-form-item label="货位" prop="locationId">
          <LocationSelect
            v-model="queryParams.locationId"
            :warehouse-id="queryParams.warehouseId"
            :area-id="queryParams.areaId"
            :rack-id="queryParams.rackId"
          />
        </el-form-item>
        <el-form-item label="来源单ID" prop="sourceOrderId">
          <el-input v-model="queryParams.sourceOrderId" placeholder="请输入来源单据ID" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="8"><span style="font-size: large">单品实例</span></el-col>
        <el-col :span="2">
          <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wms:itemInstance:edit']">新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="itemInstanceList" border empty-text="暂无单品实例" cell-class-name="vertical-top-cell">
        <el-table-column label="单品码" prop="instanceCode" min-width="180" />
        <el-table-column label="商品/规格" min-width="220">
          <template #default="{ row }">
            <div>{{ row.itemName || '-' }}</div>
            <div v-if="row.skuName" class="sub-text">规格：{{ row.skuName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_item_instance_status" :value="row.instanceStatus" />
          </template>
        </el-table-column>
        <el-table-column label="位置" min-width="220">
          <template #default="{ row }">
            <div v-if="row.warehouseName">仓库：{{ row.warehouseName }}</div>
            <div v-if="row.areaName">库区：{{ row.areaName }}</div>
            <div v-if="row.rackName">货架：{{ row.rackName }}</div>
            <div v-if="row.locationName">货位：{{ row.locationName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="在箱/借出" width="120">
          <template #default="{ row }">
            <div><el-tag :type="row.inBox === 1 ? 'warning' : 'info'">{{ row.inBox === 1 ? '在箱' : '不在箱' }}</el-tag></div>
            <div class="mt5"><el-tag :type="row.borrowed === 1 ? 'danger' : 'success'">{{ row.borrowed === 1 ? '已借出' : '未借出' }}</el-tag></div>
          </template>
        </el-table-column>
        <el-table-column label="来源信息" min-width="180">
          <template #default="{ row }">
            <div>{{ formatSourceType(row.sourceType) }}</div>
            <div v-if="row.sourceOrderNo" class="sub-text">单号：{{ row.sourceOrderNo }}</div>
            <div v-if="row.receiptOrderDetailId" class="sub-text">明细ID：{{ row.receiptOrderDetailId }}</div>
          </template>
        </el-table-column>
        <el-table-column label="批号/日期" min-width="180">
          <template #default="{ row }">
            <div v-if="row.batchNo">批号：{{ row.batchNo }}</div>
            <div v-if="row.productionDate" class="sub-text">生产：{{ parseTime(row.productionDate, '{y}-{m}-{d}') }}</div>
            <div v-if="row.expirationDate" class="sub-text">过期：{{ parseTime(row.expirationDate, '{y}-{m}-{d}') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" align="right" width="240">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button link type="primary" @click="handleUpdate(row)" v-hasPermi="['wms:itemInstance:edit']">修改</el-button>
            <el-button link type="primary" @click="handleUpdateStatus(row)" v-hasPermi="['wms:itemInstance:edit']">状态</el-button>
            <el-button link type="primary" @click="handleUpdateLocation(row)" v-hasPermi="['wms:itemInstance:edit']">位置</el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-hasPermi="['wms:itemInstance:edit']">删除</el-button>
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
            <el-form-item label="单品码" prop="instanceCode">
              <el-input v-model="form.instanceCode" placeholder="不填则后端自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单品状态" prop="instanceStatus">
              <el-select v-model="form.instanceStatus" placeholder="请选择单品状态" style="width: 100%">
                <el-option v-for="dict in wms_item_instance_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品" prop="itemId">
              <el-select v-model="form.itemId" placeholder="请选择商品" filterable style="width: 100%" @change="handleFormItemChange">
                <el-option
                  v-for="item in itemOptions"
                  :key="item.id"
                  :label="item.itemCode ? item.itemName + ' (' + item.itemCode + ')' : item.itemName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格" prop="skuId">
              <el-select v-model="form.skuId" placeholder="请选择规格" filterable style="width: 100%">
                <el-option
                  v-for="item in formSkuOptions"
                  :key="item.id"
                  :label="item.skuCode ? item.skuName + ' (' + item.skuCode + ')' : item.skuName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="在箱状态" prop="inBox">
              <el-radio-group v-model="form.inBox">
                <el-radio :label="1">在箱</el-radio>
                <el-radio :label="0">不在箱</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="借出状态" prop="borrowed">
              <el-radio-group v-model="form.borrowed">
                <el-radio :label="1">已借出</el-radio>
                <el-radio :label="0">未借出</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
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
          </el-col>
          <el-col :span="12">
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
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="货架" prop="rackId">
              <RackSelect v-model="form.rackId" :warehouse-id="form.warehouseId" :area-id="form.areaId" @update:model-value="handleFormRackChange" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货位" prop="locationId">
              <LocationSelect
                v-model="form.locationId"
                :warehouse-id="form.warehouseId"
                :area-id="form.areaId"
                :rack-id="form.rackId"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="批号" prop="batchNo">
              <el-input v-model="form.batchNo" placeholder="请输入批号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源单号" prop="sourceOrderNo">
              <el-input v-model="form.sourceOrderNo" placeholder="请输入来源单号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产日期" prop="productionDate">
              <el-date-picker
                v-model="form.productionDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期日期" prop="expirationDate">
              <el-date-picker
                v-model="form.expirationDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
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

    <el-dialog title="单品实例详情" v-model="detailDialog.visible" width="720px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="单品码">{{ detailDialog.data.instanceCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="单品状态">
          <dict-tag :options="wms_item_instance_status" :value="detailDialog.data.instanceStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="商品">{{ detailDialog.data.itemName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="规格">{{ detailDialog.data.skuName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="在箱状态">{{ detailDialog.data.inBox === 1 ? '在箱' : '不在箱' }}</el-descriptions-item>
        <el-descriptions-item label="借出状态">{{ detailDialog.data.borrowed === 1 ? '已借出' : '未借出' }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{ detailDialog.data.warehouseName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="库区">{{ detailDialog.data.areaName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货架">{{ detailDialog.data.rackName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货位">{{ detailDialog.data.locationName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="来源类型">{{ formatSourceType(detailDialog.data.sourceType) }}</el-descriptions-item>
        <el-descriptions-item label="来源单号">{{ detailDialog.data.sourceOrderNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="来源明细ID">{{ detailDialog.data.receiptOrderDetailId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="批号">{{ detailDialog.data.batchNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="生产日期">{{ detailDialog.data.productionDate ? parseTime(detailDialog.data.productionDate, '{y}-{m}-{d}') : '-' }}</el-descriptions-item>
        <el-descriptions-item label="过期日期">{{ detailDialog.data.expirationDate ? parseTime(detailDialog.data.expirationDate, '{y}-{m}-{d}') : '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailDialog.data.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog title="更新单品状态" v-model="statusDialog.visible" width="420px" append-to-body>
      <el-form ref="statusFormRef" :model="statusDialog.form" label-width="88px">
        <el-form-item label="单品码">
          <el-input :model-value="statusDialog.instanceCode" disabled />
        </el-form-item>
        <el-form-item label="目标状态" prop="targetStatus">
          <el-select v-model="statusDialog.form.targetStatus" placeholder="请选择目标状态" style="width: 100%">
            <el-option v-for="dict in wms_item_instance_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitStatus">确 定</el-button>
          <el-button @click="statusDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="更新单品位置" v-model="locationDialog.visible" width="520px" append-to-body>
      <el-form ref="locationFormRef" :model="locationDialog.form" label-width="88px">
        <el-form-item label="单品码">
          <el-input :model-value="locationDialog.instanceCode" disabled />
        </el-form-item>
        <el-form-item label="仓库">
          <el-select v-model="locationDialog.form.warehouseId" placeholder="请选择仓库" filterable style="width: 100%" @change="handleLocationWarehouseChange">
            <el-option
              v-for="item in wmsStore.warehouseList"
              :key="item.id"
              :label="item.warehouseName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库区">
          <el-select v-model="locationDialog.form.areaId" placeholder="请选择库区" clearable filterable style="width: 100%" @change="handleLocationAreaChange">
            <el-option
              v-for="item in locationAreaOptions"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="货架">
          <RackSelect
            v-model="locationDialog.form.rackId"
            :warehouse-id="locationDialog.form.warehouseId"
            :area-id="locationDialog.form.areaId"
            @update:model-value="handleLocationRackChange"
          />
        </el-form-item>
        <el-form-item label="货位">
          <LocationSelect
            v-model="locationDialog.form.locationId"
            :warehouse-id="locationDialog.form.warehouseId"
            :area-id="locationDialog.form.areaId"
            :rack-id="locationDialog.form.rackId"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitLocation">确 定</el-button>
          <el-button @click="locationDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ItemInstance">
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import {
  addItemInstance,
  delItemInstance,
  getItemInstance,
  listItemInstance,
  updateItemInstance,
  updateItemInstanceLocation,
  updateItemInstanceStatus
} from '@/api/wms/itemInstance';
import { listItem } from '@/api/wms/item';
import { listItemSku } from '@/api/wms/itemSku';
import { useWmsStore } from '@/store/modules/wms';
import RackSelect from '@/views/components/RackSelect.vue';
import LocationSelect from '@/views/components/LocationSelect.vue';

const { proxy } = getCurrentInstance();
const route = useRoute();
const { wms_item_instance_status } = proxy.useDict('wms_item_instance_status');
const wmsStore = useWmsStore();

const yesNoOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 0 }
];

const itemInstanceList = ref([]);
const itemOptions = ref([]);
const querySkuOptions = ref([]);
const formSkuOptions = ref([]);
const loading = ref(true);
const buttonLoading = ref(false);
const total = ref(0);
const queryRef = ref();
const instanceFormRef = ref();
const statusFormRef = ref();
const locationFormRef = ref();

const dialog = reactive({
  visible: false,
  title: ''
});

const detailDialog = reactive({
  visible: false,
  data: {}
});

const statusDialog = reactive({
  visible: false,
  instanceCode: '',
  form: {
    id: undefined,
    targetStatus: undefined
  }
});

const locationDialog = reactive({
  visible: false,
  instanceCode: '',
  form: {
    id: undefined,
    warehouseId: undefined,
    areaId: undefined,
    rackId: undefined,
    locationId: undefined
  }
});

const initFormData = () => ({
  id: undefined,
  instanceCode: undefined,
  itemId: undefined,
  skuId: undefined,
  instanceStatus: 'in_stock',
  inBox: 0,
  borrowed: 0,
  warehouseId: undefined,
  areaId: undefined,
  rackId: undefined,
  locationId: undefined,
  sourceType: undefined,
  sourceOrderId: undefined,
  sourceOrderNo: undefined,
  receiptOrderDetailId: undefined,
  batchNo: undefined,
  productionDate: undefined,
  expirationDate: undefined,
  remark: undefined
});

const data = reactive({
  form: initFormData(),
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    instanceCode: undefined,
    itemId: undefined,
    skuId: undefined,
    instanceStatus: undefined,
    inBox: undefined,
    borrowed: undefined,
    warehouseId: undefined,
    areaId: undefined,
    rackId: undefined,
    locationId: undefined,
    sourceOrderId: undefined,
    receiptOrderDetailId: undefined
  },
  rules: {
    itemId: [
      { required: true, message: '商品不能为空', trigger: 'change' }
    ],
    skuId: [
      { required: true, message: '规格不能为空', trigger: 'change' }
    ]
  }
});

const { form, queryParams, rules } = toRefs(data);

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

const locationAreaOptions = computed(() => {
  if (!locationDialog.form.warehouseId) {
    return [];
  }
  return wmsStore.areaList.filter(item => item.warehouseId === locationDialog.form.warehouseId);
});

const formatSourceType = (value) => {
  if (value === 'receipt') {
    return '入库单';
  }
  return value || '-';
};

const loadItemOptions = async () => {
  const res = await listItem({});
  itemOptions.value = res.data || [];
};

const loadSkuOptions = async (itemId, target = 'query') => {
  if (!itemId) {
    if (target === 'query') {
      querySkuOptions.value = [];
    } else {
      formSkuOptions.value = [];
    }
    return;
  }
  const res = await listItemSku({ itemId });
  const list = res.data || [];
  if (target === 'query') {
    querySkuOptions.value = list;
  } else {
    formSkuOptions.value = list;
  }
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
  queryParams.value.sourceOrderId = undefined;
  queryParams.value.receiptOrderDetailId = undefined;
  queryParams.value.inBox = undefined;
  queryParams.value.borrowed = undefined;
  queryParams.value.itemId = undefined;
  queryParams.value.skuId = undefined;
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  querySkuOptions.value = [];
  applyRouteQuery();
  await getList();
};

const applyRouteQuery = () => {
  const { sourceOrderId, receiptOrderDetailId, instanceCode, inBox, borrowed, itemId, skuId } = route.query;
  if (sourceOrderId) {
    queryParams.value.sourceOrderId = Number(sourceOrderId);
  }
  if (receiptOrderDetailId) {
    queryParams.value.receiptOrderDetailId = Number(receiptOrderDetailId);
  }
  if (instanceCode) {
    queryParams.value.instanceCode = instanceCode;
  }
  if (inBox !== undefined) {
    queryParams.value.inBox = Number(inBox);
  }
  if (borrowed !== undefined) {
    queryParams.value.borrowed = Number(borrowed);
  }
  if (itemId) {
    queryParams.value.itemId = Number(itemId);
  }
  if (skuId) {
    queryParams.value.skuId = Number(skuId);
  }
};

const handleQueryItemChange = async () => {
  queryParams.value.skuId = undefined;
  await loadSkuOptions(queryParams.value.itemId, 'query');
};

const handleQueryWarehouseChange = () => {
  queryParams.value.areaId = undefined;
  queryParams.value.rackId = undefined;
  queryParams.value.locationId = undefined;
};

const handleQueryAreaChange = () => {
  queryParams.value.rackId = undefined;
  queryParams.value.locationId = undefined;
};

const reset = () => {
  form.value = initFormData();
  formSkuOptions.value = [];
  proxy.resetForm('instanceFormRef');
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增单品实例';
};

const handleFormItemChange = async () => {
  form.value.skuId = undefined;
  await loadSkuOptions(form.value.itemId, 'form');
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

const handleUpdate = async (row) => {
  reset();
  const res = await getItemInstance(row.id);
  form.value = { ...initFormData(), ...res.data };
  await loadSkuOptions(form.value.itemId, 'form');
  dialog.visible = true;
  dialog.title = '修改单品实例';
};

const submitForm = () => {
  instanceFormRef.value.validate(async valid => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateItemInstance(form.value);
        proxy.$modal.msgSuccess('修改成功');
      } else {
        await addItemInstance(form.value);
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
  const res = await getItemInstance(row.id);
  detailDialog.data = res.data || {};
  detailDialog.visible = true;
};

const handleUpdateStatus = (row) => {
  statusDialog.instanceCode = row.instanceCode;
  statusDialog.form = {
    id: row.id,
    targetStatus: row.instanceStatus
  };
  statusDialog.visible = true;
};

const submitStatus = async () => {
  buttonLoading.value = true;
  try {
    await updateItemInstanceStatus(statusDialog.form);
    proxy.$modal.msgSuccess('状态更新成功');
    statusDialog.visible = false;
    await getList();
  } finally {
    buttonLoading.value = false;
  }
};

const handleUpdateLocation = (row) => {
  locationDialog.instanceCode = row.instanceCode;
  locationDialog.form = {
    id: row.id,
    warehouseId: row.warehouseId,
    areaId: row.areaId,
    rackId: row.rackId,
    locationId: row.locationId
  };
  locationDialog.visible = true;
};

const handleLocationWarehouseChange = () => {
  locationDialog.form.areaId = undefined;
  locationDialog.form.rackId = undefined;
  locationDialog.form.locationId = undefined;
};

const handleLocationAreaChange = () => {
  locationDialog.form.rackId = undefined;
  locationDialog.form.locationId = undefined;
};

const handleLocationRackChange = () => {
  locationDialog.form.locationId = undefined;
};

const submitLocation = async () => {
  buttonLoading.value = true;
  try {
    await updateItemInstanceLocation(locationDialog.form);
    proxy.$modal.msgSuccess('位置更新成功');
    locationDialog.visible = false;
    await getList();
  } finally {
    buttonLoading.value = false;
  }
};

const handleDelete = async (row) => {
  await proxy.$modal.confirm('确认删除单品实例【' + row.instanceCode + '】吗？');
  try {
    await delItemInstance(row.id);
    proxy.$modal.msgSuccess('删除成功');
    await getList();
  } catch (e) {
    if (e === 409) {
      return ElMessageBox.alert('单品实例已被业务数据引用，不能删除。', '系统提示');
    }
    throw e;
  }
};

watch(
  () => route.query,
  async () => {
    applyRouteQuery();
    if (queryParams.value.itemId) {
      await loadSkuOptions(queryParams.value.itemId, 'query');
    } else {
      querySkuOptions.value = [];
    }
    await getList();
  }
);

onMounted(async () => {
  applyRouteQuery();
  await Promise.all([
    wmsStore.getWarehouseList(),
    wmsStore.getAreaList(),
    loadItemOptions()
  ]);
  if (queryParams.value.itemId) {
    await loadSkuOptions(queryParams.value.itemId, 'query');
  }
  await getList();
});
</script>

<style scoped>
.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.vertical-top-cell {
  vertical-align: top;
}
</style>
