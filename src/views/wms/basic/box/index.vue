<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="80px">
        <el-form-item label="箱码" prop="boxCode">
          <el-input v-model="queryParams.boxCode" placeholder="请输入箱码" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="箱体名称" prop="boxName">
          <el-input v-model="queryParams.boxName" placeholder="请输入箱体名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="boxStatus">
          <el-select v-model="queryParams.boxStatus" placeholder="请选择状态" clearable style="width: 160px">
            <el-option v-for="dict in wms_box_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="8"><span style="font-size: large">箱体管理</span></el-col>
        <el-col :span="2">
          <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wms:box:edit']">新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="boxList" border empty-text="暂无箱体" cell-class-name="vertical-top-cell">
        <el-table-column label="箱码" prop="boxCode" min-width="180" />
        <el-table-column label="箱体名称" prop="boxName" min-width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_box_status" :value="row.boxStatus" />
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
        <el-table-column label="箱内数量" prop="itemCount" width="100" align="right" />
        <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" align="right" width="260">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button link type="primary" @click="handleTrace(row)" v-hasPermi="['wms:box:list']">追踪</el-button>
            <el-button link type="primary" @click="handlePack(row)" v-hasPermi="['wms:box:edit']">装箱</el-button>
            <el-button link type="primary" @click="handleUnpack(row)" v-hasPermi="['wms:box:edit']">拆箱</el-button>
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
        <el-descriptions-item label="箱体名称">{{ detailDialog.data.boxName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="箱体状态">
          <dict-tag :options="wms_box_status" :value="detailDialog.data.boxStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="仓库">{{ detailDialog.data.warehouseName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="库区">{{ detailDialog.data.areaName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货架">{{ detailDialog.data.rackName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货位">{{ detailDialog.data.locationName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="箱内数量">{{ detailDialog.data.itemCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailDialog.data.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="detail-header">
        <span class="detail-title">箱内单品</span>
      </div>
      <el-table :data="detailDialog.data.items || []" border empty-text="箱内暂无单品" cell-class-name="vertical-top-cell">
        <el-table-column label="单品码" prop="instanceCode" min-width="180" />
        <el-table-column label="商品/规格" min-width="220">
          <template #default="{ row }">
            <div>{{ row.itemName || '-' }}</div>
            <div v-if="row.skuName" class="sub-text">规格：{{ row.skuName }}</div>
            <div v-if="row.productMark" class="sub-text">标识：{{ row.productMark }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <dict-tag :options="itemInstanceStatusOptions" :value="row.instanceStatus" />
          </template>
        </el-table-column>
        <el-table-column label="质量/单位" min-width="180">
          <template #default="{ row }">
            <div>{{ row.qualityGrade || '-' }}</div>
            <div class="sub-text">{{ row.belongUnit || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="批号/日期" min-width="180">
          <template #default="{ row }">
            <div v-if="row.batchNo">批号：{{ row.batchNo }}</div>
            <div v-if="row.productionDate" class="sub-text">生产：{{ parseTime(row.productionDate, '{y}-{m}-{d}') }}</div>
            <div v-if="row.expirationDate" class="sub-text">过期：{{ parseTime(row.expirationDate, '{y}-{m}-{d}') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleOpenItemInstance(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog title="装箱" v-model="packDialog.visible" width="1100px" append-to-body :close-on-click-modal="false">
      <el-alert
        :closable="false"
        type="info"
        class="mb16"
        :title="packDialog.boxCode ? '当前箱体：' + packDialog.boxCode : '请选择需要装箱的单品实例'"
      />
      <el-form :inline="true" :model="packDialog.query" label-width="80px">
        <el-form-item label="单品码">
          <el-input v-model="packDialog.query.instanceCode" placeholder="请输入单品码" clearable @keyup.enter="getPackCandidates" />
        </el-form-item>
        <el-form-item label="商品">
          <el-select v-model="packDialog.query.itemId" placeholder="请选择商品" clearable filterable style="width: 180px" @change="handlePackItemChange">
            <el-option
              v-for="item in itemOptions"
              :key="item.id"
              :label="item.itemCode ? item.itemName + ' (' + item.itemCode + ')' : item.itemName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规格">
          <el-select v-model="packDialog.query.skuId" placeholder="请选择规格" clearable filterable style="width: 180px">
            <el-option
              v-for="item in packDialog.skuOptions"
              :key="item.id"
              :label="item.skuCode ? item.skuName + ' (' + item.skuCode + ')' : item.skuName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getPackCandidates">搜索</el-button>
          <el-button icon="Refresh" @click="resetPackQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        ref="packTableRef"
        v-loading="packDialog.loading"
        :data="packDialog.list"
        border
        class="mt20"
        empty-text="暂无可装箱单品"
        @selection-change="handlePackSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="单品码" prop="instanceCode" min-width="180" />
        <el-table-column label="商品/规格" min-width="220">
          <template #default="{ row }">
            <div>{{ row.itemName || '-' }}</div>
            <div v-if="row.skuName" class="sub-text">规格：{{ row.skuName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <dict-tag :options="itemInstanceStatusOptions" :value="row.instanceStatus" />
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
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitPack">确 定</el-button>
          <el-button @click="packDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="拆箱" v-model="unpackDialog.visible" width="960px" append-to-body :close-on-click-modal="false">
      <el-alert
        :closable="false"
        type="warning"
        class="mb16"
        :title="unpackDialog.boxCode ? '当前箱体：' + unpackDialog.boxCode : '请选择要拆出的单品实例'"
      />
      <el-table
        ref="unpackTableRef"
        v-loading="unpackDialog.loading"
        :data="unpackDialog.list"
        border
        empty-text="箱内暂无可拆出的单品"
        @selection-change="handleUnpackSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="单品码" prop="instanceCode" min-width="180" />
        <el-table-column label="商品/规格" min-width="220">
          <template #default="{ row }">
            <div>{{ row.itemName || '-' }}</div>
            <div v-if="row.skuName" class="sub-text">规格：{{ row.skuName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <dict-tag :options="itemInstanceStatusOptions" :value="row.instanceStatus" />
          </template>
        </el-table-column>
        <el-table-column label="批号/日期" min-width="180">
          <template #default="{ row }">
            <div v-if="row.batchNo">批号：{{ row.batchNo }}</div>
            <div v-if="row.productionDate" class="sub-text">生产：{{ parseTime(row.productionDate, '{y}-{m}-{d}') }}</div>
            <div v-if="row.expirationDate" class="sub-text">过期：{{ parseTime(row.expirationDate, '{y}-{m}-{d}') }}</div>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitUnpack">确 定</el-button>
          <el-button @click="unpackDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Box">
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { addBox, delBox, getBox, listBox, packBox, unpackBox, updateBox } from '@/api/wms/box';
import { listItem } from '@/api/wms/item';
import { listItemSku } from '@/api/wms/itemSku';
import { listItemInstance } from '@/api/wms/itemInstance';
import { useWmsStore } from '@/store/modules/wms';
import RackSelect from '@/views/components/RackSelect.vue';
import LocationSelect from '@/views/components/LocationSelect.vue';

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const { wms_box_status, wms_item_instance_status } = proxy.useDict('wms_box_status', 'wms_item_instance_status');
const wmsStore = useWmsStore();

const loading = ref(true);
const buttonLoading = ref(false);
const total = ref(0);
const boxList = ref([]);
const itemOptions = ref([]);
const queryRef = ref();
const boxFormRef = ref();
const packTableRef = ref();
const unpackTableRef = ref();

const dialog = reactive({
  visible: false,
  title: ''
});

const detailDialog = reactive({
  visible: false,
  data: {}
});

const packDialog = reactive({
  visible: false,
  boxId: undefined,
  boxCode: '',
  loading: false,
  list: [],
  selectedIds: [],
  skuOptions: [],
  query: {
    instanceCode: undefined,
    itemId: undefined,
    skuId: undefined,
    inBox: 0,
    borrowed: 0
  }
});

const unpackDialog = reactive({
  visible: false,
  boxId: undefined,
  boxCode: '',
  loading: false,
  list: [],
  selectedIds: []
});

const initFormData = () => ({
  id: undefined,
  boxCode: undefined,
  boxName: undefined,
  boxStatus: 'idle',
  warehouseId: undefined,
  areaId: undefined,
  rackId: undefined,
  locationId: undefined,
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

const loadItemOptions = async () => {
  const res = await listItem({});
  itemOptions.value = res.data || [];
};

const loadPackSkuOptions = async () => {
  packDialog.query.skuId = undefined;
  if (!packDialog.query.itemId) {
    packDialog.skuOptions = [];
    return;
  }
  const res = await listItemSku({ itemId: packDialog.query.itemId });
  packDialog.skuOptions = res.data || [];
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
};

const handleQueryAreaChange = () => {
  queryParams.value.rackId = undefined;
  queryParams.value.locationId = undefined;
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

const handleUpdate = async (row) => {
  reset();
  const res = await getBox(row.id);
  form.value = { ...initFormData(), ...res.data };
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

const submitForm = () => {
  boxFormRef.value.validate(async valid => {
    if (!valid) {
      return;
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
  detailDialog.visible = true;
};

const handleDelete = async (row) => {
  await proxy.$modal.confirm('确认删除箱体【' + row.boxCode + '】吗？');
  try {
    await delBox(row.id);
    proxy.$modal.msgSuccess('删除成功');
    await getList();
  } catch (e) {
    if (e === 409) {
      return ElMessageBox.alert(
        '<div>箱体【' + row.boxCode + '】内仍有单品，不能删除。</div><div>请先执行拆箱操作。</div>',
        '系统提示',
        { dangerouslyUseHTMLString: true }
      );
    }
    throw e;
  }
};

const handlePack = async (row) => {
  packDialog.visible = true;
  packDialog.boxId = row.id;
  packDialog.boxCode = row.boxCode;
  packDialog.selectedIds = [];
  packDialog.query.instanceCode = undefined;
  packDialog.query.itemId = undefined;
  packDialog.query.skuId = undefined;
  packDialog.skuOptions = [];
  await getPackCandidates();
};

const handlePackItemChange = async () => {
  await loadPackSkuOptions();
};

const resetPackQuery = async () => {
  packDialog.query.instanceCode = undefined;
  packDialog.query.itemId = undefined;
  packDialog.query.skuId = undefined;
  packDialog.skuOptions = [];
  await getPackCandidates();
};

const getPackCandidates = async () => {
  packDialog.loading = true;
  try {
    const res = await listItemInstance({
      pageNum: 1,
      pageSize: 200,
      instanceCode: packDialog.query.instanceCode,
      itemId: packDialog.query.itemId,
      skuId: packDialog.query.skuId,
      inBox: 0,
      borrowed: 0
    });
    packDialog.list = res.rows.filter(item => item.instanceStatus !== 'disabled' && item.instanceStatus !== 'outbound');
  } finally {
    packDialog.loading = false;
  }
};

const handlePackSelectionChange = (selection) => {
  packDialog.selectedIds = selection.map(item => item.id);
};

const submitPack = async () => {
  if (!packDialog.selectedIds.length) {
    proxy.$modal.msgError('请先选择要装箱的单品实例');
    return;
  }
  buttonLoading.value = true;
  try {
    await packBox({
      boxId: packDialog.boxId,
      itemInstanceIds: packDialog.selectedIds
    });
    proxy.$modal.msgSuccess('装箱成功');
    packDialog.visible = false;
    await Promise.all([getList(), refreshDetailIfOpened(packDialog.boxId)]);
  } finally {
    buttonLoading.value = false;
  }
};

const handleUnpack = async (row) => {
  unpackDialog.visible = true;
  unpackDialog.boxId = row.id;
  unpackDialog.boxCode = row.boxCode;
  unpackDialog.selectedIds = [];
  await getUnpackItems(row.id);
};

const getUnpackItems = async (boxId) => {
  unpackDialog.loading = true;
  try {
    const res = await getBox(boxId);
    unpackDialog.list = res.data?.items || [];
  } finally {
    unpackDialog.loading = false;
  }
};

const handleUnpackSelectionChange = (selection) => {
  unpackDialog.selectedIds = selection.map(item => item.id);
};

const submitUnpack = async () => {
  if (!unpackDialog.selectedIds.length) {
    proxy.$modal.msgError('请先选择要拆出的单品实例');
    return;
  }
  buttonLoading.value = true;
  try {
    await unpackBox({
      boxId: unpackDialog.boxId,
      itemInstanceIds: unpackDialog.selectedIds
    });
    proxy.$modal.msgSuccess('拆箱成功');
    unpackDialog.visible = false;
    await Promise.all([getList(), refreshDetailIfOpened(unpackDialog.boxId)]);
  } finally {
    buttonLoading.value = false;
  }
};

const refreshDetailIfOpened = async (boxId) => {
  if (detailDialog.visible && detailDialog.data.id === boxId) {
    const res = await getBox(boxId);
    detailDialog.data = res.data || {};
  }
};

const handleOpenItemInstance = (row) => {
  router.push({ path: '/wms-item-instance/index', query: { instanceCode: row.instanceCode } });
};

const handleTrace = (row) => {
  router.push({ path: '/wms-trace-box/index', query: { boxCode: row.boxCode } });
};

onMounted(async () => {
  applyRouteQuery();
  await Promise.all([
    wmsStore.getWarehouseList(),
    wmsStore.getAreaList(),
    loadItemOptions()
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
.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.vertical-top-cell {
  vertical-align: top;
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
</style>
