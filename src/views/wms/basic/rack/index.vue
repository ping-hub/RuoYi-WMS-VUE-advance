<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="编码" prop="rackCode">
          <el-input v-model="queryParams.rackCode" placeholder="请输入货架编码" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="名称" prop="rackName">
          <el-input v-model="queryParams.rackName" placeholder="请输入货架名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="queryParams.warehouseId" placeholder="请选择仓库" clearable filterable style="width: 180px">
            <el-option
              v-for="item in wmsStore.warehouseList"
              :key="item.id"
              :label="item.warehouseName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库区" prop="areaId">
          <el-select v-model="queryParams.areaId" placeholder="请选择库区" clearable filterable style="width: 180px">
            <el-option
              v-for="item in areaOptions"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="rackStatus">
          <el-select v-model="queryParams.rackStatus" placeholder="请选择状态" clearable style="width: 140px">
            <el-option v-for="dict in wms_rack_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="rackType">
          <el-select v-model="queryParams.rackType" placeholder="请选择类型" clearable style="width: 140px">
            <el-option v-for="dict in wms_rack_type" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <el-col :span="6"><span style="font-size: large">货架管理</span></el-col>
        <el-col :span="2">
          <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wms:rack:edit']">新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="rackList" border empty-text="暂无货架">
        <el-table-column label="编码" prop="rackCode" min-width="140" />
        <el-table-column label="名称" prop="rackName" min-width="140" />
        <el-table-column label="仓库" prop="warehouseName" min-width="120" />
        <el-table-column label="库区" prop="areaName" min-width="120" />
        <el-table-column label="状态" prop="rackStatus" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_rack_status" :value="row.rackStatus" />
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="rackType" width="120">
          <template #default="{ row }">
            <dict-tag :options="wms_rack_type" :value="row.rackType" />
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" align="right" width="160">
          <template #default="{ row }">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['wms:rack:edit']">修改</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(row)" v-hasPermi="['wms:rack:edit']">删除</el-button>
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
      <el-form ref="rackRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="货架编码" prop="rackCode">
          <el-input v-model="form.rackCode" placeholder="请输入货架编码" />
        </el-form-item>
        <el-form-item label="货架名称" prop="rackName">
          <el-input v-model="form.rackName" placeholder="请输入货架名称" />
        </el-form-item>
        <el-form-item label="所属仓库" prop="warehouseId">
          <el-select v-model="form.warehouseId" placeholder="请选择仓库" filterable style="width: 100%" @change="handleWarehouseChange">
            <el-option
              v-for="item in wmsStore.warehouseList"
              :key="item.id"
              :label="item.warehouseName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属库区" prop="areaId">
          <el-select v-model="form.areaId" placeholder="请选择库区" filterable style="width: 100%">
            <el-option
              v-for="item in formAreaOptions"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="货架状态" prop="rackStatus">
          <el-select v-model="form.rackStatus" placeholder="请选择货架状态" style="width: 100%">
            <el-option v-for="dict in wms_rack_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="货架类型" prop="rackType">
          <el-select v-model="form.rackType" placeholder="请选择货架类型" style="width: 100%">
            <el-option v-for="dict in wms_rack_type" :key="dict.value" :label="dict.label" :value="dict.value" />
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
  </div>
</template>

<script setup name="Rack">
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import { ElMessageBox } from 'element-plus';
import { addRack, delRack, getRack, listRack, updateRack } from '@/api/wms/rack';
import { useWmsStore } from '@/store/modules/wms';

const { proxy } = getCurrentInstance();
const { wms_rack_status, wms_rack_type } = proxy.useDict('wms_rack_status', 'wms_rack_type');
const wmsStore = useWmsStore();

const rackList = ref([]);
const open = ref(false);
const loading = ref(true);
const buttonLoading = ref(false);
const total = ref(0);
const title = ref('');
const ids = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    rackCode: undefined,
    rackName: undefined,
    warehouseId: undefined,
    areaId: undefined,
    rackStatus: undefined,
    rackType: undefined
  },
  rules: {
    rackName: [
      { required: true, message: '货架名称不能为空', trigger: 'blur' }
    ],
    warehouseId: [
      { required: true, message: '所属仓库不能为空', trigger: 'change' }
    ],
    areaId: [
      { required: true, message: '所属库区不能为空', trigger: 'change' }
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
    rackCode: undefined,
    rackName: undefined,
    warehouseId: undefined,
    areaId: undefined,
    rackStatus: 'enabled',
    rackType: 'standard',
    remark: undefined
  };
  proxy.resetForm('rackRef');
}

async function getList() {
  loading.value = true;
  try {
    const res = await listRack(queryParams.value);
    rackList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleWarehouseChange() {
  form.value.areaId = undefined;
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
  title.value = '添加货架';
}

async function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  const res = await getRack(id);
  form.value = { ...res.data };
  open.value = true;
  title.value = '修改货架';
}

function submitForm() {
  proxy.$refs.rackRef.validate(async valid => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateRack(form.value);
        proxy.$modal.msgSuccess('修改成功');
      } else {
        await addRack(form.value);
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
  await proxy.$modal.confirm('确认删除货架【' + row.rackName + '】吗？');
  try {
    await delRack(id);
    proxy.$modal.msgSuccess('删除成功');
    await getList();
  } catch (e) {
    if (e === 409) {
      return ElMessageBox.alert(
        '<div>货架【' + row.rackName + '】下已存在货位，不能删除！</div><div>请先清理关联数据。</div>',
        '系统提示',
        { dangerouslyUseHTMLString: true }
      );
    }
    throw e;
  }
}

onMounted(async () => {
  await Promise.all([
    wmsStore.getWarehouseList(),
    wmsStore.getAreaList()
  ]);
  await getList();
});
</script>
