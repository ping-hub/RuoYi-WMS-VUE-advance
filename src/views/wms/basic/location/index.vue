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
        <el-form-item label="类型" prop="locationType">
          <el-select v-model="queryParams.locationType" placeholder="请选择类型" clearable style="width: 140px">
            <el-option v-for="dict in wms_location_type" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <el-col :span="6"><span style="font-size: large">货位管理</span></el-col>
        <el-col :span="2">
          <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wms:location:edit']">新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="locationList" border empty-text="暂无货位">
        <el-table-column label="编码" prop="locationCode" min-width="150" />
        <el-table-column label="名称" prop="locationName" min-width="150" />
        <el-table-column label="仓库" prop="warehouseName" min-width="120" />
        <el-table-column label="库区" prop="areaName" min-width="120" />
        <el-table-column label="所属货架" min-width="180">
          <template #default="{ row }">
            <div>{{ row.rackName }}</div>
            <div v-if="row.rackCode" class="sub-text">编码：{{ row.rackCode }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="locationStatus" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_location_status" :value="row.locationStatus" />
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="locationType" width="120">
          <template #default="{ row }">
            <dict-tag :options="wms_location_type" :value="row.locationType" />
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" align="right" width="240">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewStock(row)" v-hasPermi="['wms:location:list']">货位对象</el-button>
            <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['wms:location:edit']">修改</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(row)" v-hasPermi="['wms:location:edit']">删除</el-button>
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
      <el-form ref="locationRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="货位编码" prop="locationCode">
          <el-input v-model="form.locationCode" placeholder="请输入货位编码" />
        </el-form-item>
        <el-form-item label="货位名称" prop="locationName">
          <el-input v-model="form.locationName" placeholder="请输入货位名称" />
        </el-form-item>
        <el-form-item label="所属仓库" prop="warehouseId">
          <el-select v-model="form.warehouseId" placeholder="请选择仓库" filterable style="width: 100%" @change="handleFormWarehouseChange">
            <el-option
              v-for="item in wmsStore.warehouseList"
              :key="item.id"
              :label="item.warehouseName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属库区" prop="areaId">
          <el-select v-model="form.areaId" placeholder="请选择库区" filterable style="width: 100%" @change="handleFormAreaChange">
            <el-option
              v-for="item in formAreaOptions"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属货架" prop="rackId">
          <RackSelect v-model="form.rackId" :warehouse-id="form.warehouseId" :area-id="form.areaId" />
        </el-form-item>
        <el-form-item label="货位状态" prop="locationStatus">
          <el-select v-model="form.locationStatus" placeholder="请选择货位状态" style="width: 100%">
            <el-option v-for="dict in wms_location_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="货位类型" prop="locationType">
          <el-select v-model="form.locationType" placeholder="请选择货位类型" style="width: 100%">
            <el-option v-for="dict in wms_location_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
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

    <el-drawer title="货位对象" v-model="stockDialog.visible" append-to-body size="60%">
      <el-descriptions :column="3" border class="mb16">
        <el-descriptions-item label="货位">{{ stockDialog.data.locationName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货位编码">{{ stockDialog.data.locationCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{ stockDialog.data.warehouseName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="库区">{{ stockDialog.data.areaName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="货架">{{ stockDialog.data.rackName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="直存单品数">{{ stockDialog.data.directItemCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="箱体数">{{ stockDialog.data.boxCount || 0 }}</el-descriptions-item>
      </el-descriptions>

      <div class="detail-header">
        <span class="detail-title">直存单品</span>
      </div>
      <el-table :data="stockDialog.data.itemInstances || []" border empty-text="当前货位暂无直存单品" cell-class-name="vertical-top-cell">
        <el-table-column label="单品码" prop="instanceCode" min-width="170" />
        <el-table-column label="商品/规格" min-width="200">
          <template #default="{ row }">
            <div>{{ row.itemName || '-' }}</div>
            <div class="sub-text">{{ row.skuName || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="160">
          <template #default="{ row }">
            <el-tag size="small" :type="row.inBox === 1 ? 'warning' : 'info'">{{ row.inBox === 1 ? '在箱' : '直存' }}</el-tag>
            <el-tag size="small" class="ml5" :type="row.borrowed === 1 ? 'danger' : 'success'">{{ row.borrowed === 1 ? '已借出' : '在库' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品标识/所在单位" min-width="220">
          <template #default="{ row }">
            <div>{{ row.productMark || '-' }}</div>
            <div class="sub-text">{{ row.belongUnit || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleOpenItemInstance(row)">单品详情</el-button>
            <el-button link type="primary" @click="handleTraceItem(row)">追踪</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="detail-header mt20">
        <span class="detail-title">箱体对象</span>
      </div>
      <el-table :data="stockDialog.data.boxes || []" border empty-text="当前货位暂无箱体" cell-class-name="vertical-top-cell">
        <el-table-column label="箱码" prop="boxCode" min-width="170" />
        <el-table-column label="箱体名称" prop="boxName" min-width="150" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_box_status" :value="row.boxStatus" />
          </template>
        </el-table-column>
        <el-table-column label="箱内数量" prop="itemCount" min-width="100" align="right" />
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="140" align="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleOpenBox(row)">箱体详情</el-button>
            <el-button link type="primary" @click="handleTraceBox(row)">追踪</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup name="Location">
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { addLocation, delLocation, getLocation, getLocationStock, listLocation, updateLocation } from '@/api/wms/location';
import { useWmsStore } from '@/store/modules/wms';
import RackSelect from '@/views/components/RackSelect.vue';

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const { wms_location_status, wms_location_type, wms_box_status } = proxy.useDict('wms_location_status', 'wms_location_type', 'wms_box_status');
const wmsStore = useWmsStore();

const locationList = ref([]);
const open = ref(false);
const loading = ref(true);
const buttonLoading = ref(false);
const total = ref(0);
const title = ref('');
const ids = ref([]);
const stockDialog = reactive({
  visible: false,
  data: {}
});

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
    locationStatus: undefined,
    locationType: undefined
  },
  rules: {
    locationName: [
      { required: true, message: '货位名称不能为空', trigger: 'blur' }
    ],
    warehouseId: [
      { required: true, message: '所属仓库不能为空', trigger: 'change' }
    ],
    areaId: [
      { required: true, message: '所属库区不能为空', trigger: 'change' }
    ],
    rackId: [
      { required: true, message: '所属货架不能为空', trigger: 'change' }
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

const formAreaOptions = computed(() => {
  if (!form.value.warehouseId) {
    return [];
  }
  return wmsStore.areaList.filter(item => item.warehouseId === form.value.warehouseId);
});

function reset() {
  form.value = {
    id: undefined,
    locationCode: undefined,
    locationName: undefined,
    warehouseId: undefined,
    areaId: undefined,
    rackId: undefined,
    locationStatus: 'enabled',
    locationType: 'normal',
    remark: undefined
  };
  proxy.resetForm('locationRef');
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

function handleFormWarehouseChange() {
  form.value.areaId = undefined;
  form.value.rackId = undefined;
}

function handleFormAreaChange() {
  form.value.rackId = undefined;
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  proxy.resetForm('queryRef');
  handleQuery();
}

function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加货位';
}

async function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  const res = await getLocation(id);
  form.value = { ...res.data };
  open.value = true;
  title.value = '修改货位';
}

function submitForm() {
  proxy.$refs.locationRef.validate(async valid => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateLocation(form.value);
        proxy.$modal.msgSuccess('修改成功');
      } else {
        await addLocation(form.value);
        proxy.$modal.msgSuccess('新增成功');
      }
      open.value = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
}

function cancel() {
  open.value = false;
  reset();
}

async function handleDelete(row) {
  const id = row.id || ids.value[0];
  await proxy.$modal.confirm('确认删除货位【' + row.locationName + '】吗？');
  await delLocation(id);
  proxy.$modal.msgSuccess('删除成功');
  await getList();
}

async function handleViewStock(row) {
  const res = await getLocationStock(row.id);
  stockDialog.data = res.data || {};
  stockDialog.visible = true;
}

const handleOpenItemInstance = (row) => {
  router.push({ path: '/wms-item-instance/index', query: { instanceCode: row.instanceCode } });
};

const handleTraceItem = (row) => {
  router.push({ path: '/wms-trace-item/index', query: { instanceCode: row.instanceCode } });
};

const handleOpenBox = (row) => {
  router.push({ path: '/wms-box/index', query: { boxCode: row.boxCode } });
};

const handleTraceBox = (row) => {
  router.push({ path: '/wms-trace-box/index', query: { boxCode: row.boxCode } });
};

onMounted(async () => {
  await Promise.all([
    wmsStore.getWarehouseList(),
    wmsStore.getAreaList()
  ]);
  await getList();
  if (route.query.locationId) {
    await handleViewStock({ id: Number(route.query.locationId) });
  }
});
</script>

<style scoped>
.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
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
