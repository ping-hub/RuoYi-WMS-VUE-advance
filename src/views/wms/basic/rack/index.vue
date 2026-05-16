<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
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
        <el-table-column label="名称" prop="rackName" min-width="140" />
        <el-table-column label="编码" prop="rackCode" min-width="120" show-overflow-tooltip />
        <el-table-column label="仓库" prop="warehouseName" min-width="120" />
        <el-table-column label="库区" prop="areaName" min-width="120" />
        <el-table-column label="状态" prop="rackStatus" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_rack_status" :value="row.rackStatus" />
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="rackType" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_rack_type" :value="row.rackType" />
          </template>
        </el-table-column>
        <el-table-column label="行数" prop="rowCount" width="80" align="center" />
        <el-table-column label="列数" prop="columnCount" width="80" align="center" />
        <el-table-column label="长(cm)" prop="length" width="68" align="center" />
        <el-table-column label="宽(cm)" prop="width" width="68" align="center" />
        <el-table-column label="高(cm)" prop="height" width="68" align="center" />
        <el-table-column label="排序" prop="orderNum" width="55" align="center" />
        <el-table-column label="备注" prop="remark" min-width="80" show-overflow-tooltip />
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
      <div class="form-tip">带 * 为必填项，货架保存成功后将自动生成或同步货位。</div>
      <el-form ref="rackRef" :model="form" :rules="rules" label-width="110px">
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
        <el-form-item prop="rackType">
          <template #label>
            <FormLabelHelp label="货架类型" purpose="区分货架使用形态，便于布局和维护时识别不同存储方式。" example="标准货架、平面堆位" />
          </template>
          <el-select v-model="form.rackType" placeholder="请选择货架类型" style="width: 100%">
            <el-option v-for="dict in wms_rack_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="rowCount">
          <template #label>
            <FormLabelHelp label="行数" purpose="用于生成货架二维格子图的纵向行数。" example="4" />
          </template>
          <el-input-number v-model="form.rowCount" :min="1" :precision="0" style="width: 100%" />
        </el-form-item>
        <el-form-item prop="columnCount">
          <template #label>
            <FormLabelHelp label="列数" purpose="用于生成货架二维格子图的横向列数。" example="6" />
          </template>
          <el-input-number v-model="form.columnCount" :min="1" :precision="0" style="width: 100%" />
        </el-form-item>
        <el-form-item prop="length">
          <template #label>
            <FormLabelHelp label="长" purpose="记录货架物理长度，便于基础资料和布局摘要展示。" example="240" />
          </template>
          <el-input-number v-model="form.length" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item prop="width">
          <template #label>
            <FormLabelHelp label="宽" purpose="记录货架物理宽度，便于基础资料和布局摘要展示。" example="80" />
          </template>
          <el-input-number v-model="form.width" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item prop="height">
          <template #label>
            <FormLabelHelp label="高" purpose="记录货架物理高度，便于基础资料和布局摘要展示。" example="220" />
          </template>
          <el-input-number v-model="form.height" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item prop="orderNum">
          <template #label>
            <FormLabelHelp label="排序" purpose="控制同库区下货架的展示顺序。" example="10" />
          </template>
          <el-input-number v-model="form.orderNum" :min="0" :precision="0" style="width: 100%" />
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
import FormLabelHelp from '@/views/components/FormLabelHelp.vue'

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
const originalPlan = ref();

const fieldLabelMap = {
  rowCount: '行数',
  columnCount: '列数',
  length: '长',
  width: '宽',
  height: '高'
};

function validatePositiveInteger(rule, value, callback) {
  if (value === undefined || value === null || value === '') {
    callback(new Error(`${fieldLabelMap[rule.field] || '该字段'}不能为空`));
    return;
  }
  if (!Number.isInteger(value) || value <= 0) {
    callback(new Error(`${fieldLabelMap[rule.field] || '该字段'}必须为正整数`));
    return;
  }
  callback();
}

function validatePositiveNumber(rule, value, callback) {
  if (value === undefined || value === null || value === '') {
    callback();
    return;
  }
  if (Number(value) <= 0) {
    callback(new Error(`${fieldLabelMap[rule.field] || '该字段'}必须大于 0`));
    return;
  }
  callback();
}

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
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
    ],
    rowCount: [
      { validator: validatePositiveInteger, trigger: 'change' }
    ],
    columnCount: [
      { validator: validatePositiveInteger, trigger: 'change' }
    ],
    length: [
      { validator: validatePositiveNumber, trigger: 'change' }
    ],
    width: [
      { validator: validatePositiveNumber, trigger: 'change' }
    ],
    height: [
      { validator: validatePositiveNumber, trigger: 'change' }
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
    rackName: undefined,
    warehouseId: undefined,
    areaId: undefined,
    rackStatus: 'enabled',
    rackType: 'standard',
    rowCount: 1,
    columnCount: 1,
    length: undefined,
    width: undefined,
    height: undefined,
    orderNum: 0,
    remark: undefined
  };
  originalPlan.value = undefined;
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
  originalPlan.value = {
    rowCount: res.data.rowCount,
    columnCount: res.data.columnCount,
    rackName: res.data.rackName,
    length: res.data.length,
    width: res.data.width,
    height: res.data.height
  };
  open.value = true;
  title.value = '修改货架';
}

function hasPlanChanged() {
  if (!form.value.id || !originalPlan.value) {
    return false;
  }
  return form.value.rowCount !== originalPlan.value.rowCount || form.value.columnCount !== originalPlan.value.columnCount;
}

function hasPlanShrink() {
  if (!form.value.id || !originalPlan.value) {
    return false;
  }
  return form.value.rowCount < originalPlan.value.rowCount || form.value.columnCount < originalPlan.value.columnCount;
}

function buildSubmitTip() {
  if (!form.value.id) {
    return '货架保存成功后将自动生成对应货位，确认新增该货架吗？';
  }
  if (hasPlanShrink()) {
    return '当前修改包含行列缩减，可能影响现有货位；若被裁掉货位存在库存、箱体或单品占用，后端会直接阻止保存。确认继续提交吗？';
  }
  if (hasPlanChanged()) {
    return '当前修改包含行列变化，新增范围会自动补建货位；请确认货架规划调整无误后再保存。';
  }
  return '保存后会同步货架默认信息到继承型货位，确认继续吗？';
}

async function submitForm() {
  const valid = await proxy.$refs.rackRef.validate().catch(() => false);
  if (!valid) {
    return;
  }
  try {
    await proxy.$modal.confirm(buildSubmitTip());
  } catch {
    return;
  }
  buttonLoading.value = true;
  try {
    if (form.value.id) {
      await updateRack(form.value);
      proxy.$modal.msgSuccess('修改成功');
    } else {
      await addRack(form.value);
      proxy.$modal.msgSuccess('新增成功，货位已按规划自动生成');
    }
    open.value = false;
    await getList();
  } catch (error) {
    if (form.value.id && hasPlanChanged() && error?.message) {
      await ElMessageBox.alert(error.message, '货架保存失败', {
        type: 'error'
      }).catch(() => {});
    }
  } finally {
    buttonLoading.value = false;
  }
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

<style scoped lang="scss">
.sub-text,
.form-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.form-tip {
  margin-bottom: 12px;
}
</style>
