<template>
  <!-- 申请模式：新建盘点申请 -->
  <div v-if="isNew && !form.id" style="display:flex;justify-content:center;align-items:center;min-height:70vh">
    <el-card header="提交盘点申请" style="width:600px">
      <el-form :model="form" ref="applyForm" :rules="applyRules" label-width="90px">
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="form.warehouseId" placeholder="请选择仓库" filterable style="width: 100%" @change="handleWarehouseChange">
            <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="库区" prop="areaId">
          <el-select v-model="form.areaId" placeholder="请选择库区" clearable filterable style="width: 100%" :disabled="!form.warehouseId" @change="handleAreaChange">
            <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.warehouseId)"
                       :key="item.id" :label="item.areaName" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="货架" prop="rackId">
          <RackSelect v-model="form.rackId" :warehouse-id="form.warehouseId" :area-id="form.areaId"
                      :disabled="!form.areaId" />
        </el-form-item>
        <el-form-item label="盘点人" prop="checkerName">
          <el-input v-model="form.checkerName" placeholder="请输入盘点人" />
        </el-form-item>
        <el-form-item label="复核人" prop="reviewerName">
          <el-input v-model="form.reviewerName" placeholder="请输入复核人" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="备注...100个字符以内" rows="3" maxlength="100" type="textarea" show-word-limit />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitApplication" style="width:100%">提交盘点申请</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>

  <!-- 盘点/查看模式 -->
  <div v-else v-loading="loading" class="app-container" style="margin-bottom:60px">
    <el-alert v-if="isViewMode" class="mb10" type="info" :closable="false"
              title="当前为查看模式，已禁用所有编辑操作。" />

    <!-- 基本信息 -->
    <el-card header="盘点单基本信息">
      <el-form label-width="108px" :model="form" ref="checkForm" :rules="rules" :disabled="isViewMode">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-form-item label="盘点单号" prop="checkOrderNo">
              <el-input v-model="form.checkOrderNo" placeholder="保存后自动生成" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="仓库" prop="warehouseId">
              <el-select v-model="form.warehouseId" disabled filterable>
                <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="库区" prop="areaId">
              <el-select v-model="form.areaId" disabled clearable filterable>
                <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.warehouseId)"
                           :key="item.id" :label="item.areaName" :value="item.id"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="货架" prop="rackId">
              <RackSelect v-model="form.rackId" :warehouse-id="form.warehouseId" :area-id="form.areaId" :disabled="true" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="6">
            <el-form-item label="范围类型">
              <el-select v-model="form.checkScopeType" disabled>
                <el-option v-for="item in wms_check_scope_type" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="盘点日期" prop="checkDate">
              <el-date-picker v-model="form.checkDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="盘点人" prop="checkerName">
              <el-input v-model="form.checkerName" placeholder="请输入盘点人" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="复核人" prop="reviewerName">
              <el-input v-model="form.reviewerName" placeholder="请输入复核人" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="备注..." rows="2" maxlength="100" type="textarea" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 开始盘点按钮（待盘点且无明细时显示） -->
    <el-card v-if="showStartBtn" class="mt10" style="text-align:center">
      <el-empty description="尚未加载盘点明细">
        <el-button type="primary" size="large" @click="doStartCheck" :loading="starting">开始盘点（加载账面库存）</el-button>
      </el-empty>
    </el-card>

    <!-- 盘点明细 -->
    <el-card v-if="form.details && form.details.length" header="盘点明细" class="mt10">
      <div class="mb8">
        <el-tag type="info">按器材规格（SKU）汇总展示，修改实际数量后展开差异实例区域</el-tag>
      </div>
      <el-table :data="form.details" border empty-text="暂无盘点明细" row-key="skuId"
                :row-class-name="detailRowClass">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div v-if="getDiff(row) !== 0" class="instance-panel">
              <div class="instance-section">
                <div class="section-title">
                  <el-tag :type="getDiff(row) < 0 ? 'danger' : 'success'" size="small">
                    {{ getDiff(row) < 0 ? '盘亏' : '盘盈' }}实例清单
                  </el-tag>
                  <el-button v-if="!isViewMode && canEdit" link type="primary" size="small"
                             @click="loadInstances(row)">
                    {{ skuInstanceCache[row.skuId] ? '刷新' : '加载' }}账面实例
                  </el-button>
                </div>
                <!-- 加载中 -->
                <div v-if="skuInstanceLoading[row.skuId]" class="mt10">
                  <el-skeleton :rows="2" animated />
                </div>
                <!-- 实例列表 -->
                <div v-else-if="hasInstancesData(row)" class="mt10">
                  <div v-if="getDiff(row) < 0" class="instance-list">
                    <div v-for="inst in getLossInstances(row)" :key="inst.instanceCode" class="instance-item">
                      <el-icon color="#f56c6c"><Warning /></el-icon>
                      <span class="instance-code">{{ inst.instanceCode }}</span>
                      <span class="instance-name">{{ inst.instanceItemName || '-' }}</span>
                      <el-input v-if="!isViewMode && canEdit" v-model="inst.remark" placeholder="备注" size="small"
                                style="width:180px;margin-left:auto" />
                      <span v-else-if="inst.remark" class="instance-name" style="margin-left:auto">{{ inst.remark }}</span>
                    </div>
                    <el-empty v-if="!getLossInstances(row).length" description="无盘亏实例" :image-size="40" />
                  </div>
                  <div v-else class="instance-list">
                    <div v-for="inst in getGainInstances(row)" :key="inst.instanceCode || inst._key" class="instance-item">
                      <el-icon color="#67c23a"><Plus /></el-icon>
                      <el-input v-if="!isViewMode && canEdit" v-model="inst.instanceCode" placeholder="实例编码" size="small"
                                style="width:180px" />
                      <span v-else class="instance-code">{{ inst.instanceCode }}</span>
                      <el-input v-if="!isViewMode && canEdit" v-model="inst.remark" placeholder="备注" size="small"
                                style="width:180px;margin-left:8px" />
                      <span v-else-if="inst.remark" class="instance-name">{{ inst.remark }}</span>
                    </div>
                    <el-button v-if="!isViewMode && canEdit" link type="primary" size="small" @click="addGainInstance(row)" class="mt5">
                      + 添加盘盈实例
                    </el-button>
                    <el-empty v-if="!getGainInstances(row).length && (isViewMode || !canEdit)" description="无盘盈实例" :image-size="40" />
                  </div>
                </div>
                <div v-else class="mt10 text-muted">
                  <span v-if="!isViewMode && canEdit">点击上方按钮加载账面实例，系统将自动比对差异</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="器材编码" min-width="120">
          <template #default="{ row }">
            {{ row.itemSku?.item?.itemCode || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="器材名称" prop="itemSku.item.itemName" min-width="150" />
        <el-table-column label="规格型号" min-width="120">
          <template #default="{ row }">
            {{ row.itemSku?.skuName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="账面数量" align="right" width="110">
          <template #default="{ row }">
            <el-statistic :value="Number(row.quantity)" :precision="0" />
          </template>
        </el-table-column>
        <el-table-column label="实际数量" width="160">
          <template #default="{ row }">
            <el-input-number v-if="!isViewMode && canEdit"
              v-model="row.checkQuantity" placeholder="实际数量" :min="0"
              @change="handleChangeQuantity(row)" />
            <el-statistic v-else :value="Number(row.checkQuantity || 0)" :precision="0" />
          </template>
        </el-table-column>
        <el-table-column label="盈亏数" align="right" width="110">
          <template #default="{ row }">
            <span :class="{ 'text-danger': getDiff(row) < 0, 'text-success': getDiff(row) > 0 }">
              {{ getDiff(row) > 0 ? '+' : '' }}{{ getDiff(row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="结果" align="center" width="90">
          <template #default="{ row }">
            <el-tag v-if="getDiff(row) < 0" type="danger" size="small">盘亏</el-tag>
            <el-tag v-else-if="getDiff(row) > 0" type="success" size="small">盘盈</el-tag>
            <el-tag v-else type="info" size="small">一致</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 汇总 -->
      <div class="summary-bar mt10">
        <el-tag type="info">盘亏 {{ lossCount }} 项</el-tag>
        <el-tag type="success" class="ml10">盘盈 {{ gainCount }} 项</el-tag>
        <el-tag type="info" class="ml10">一致 {{ equalCount }} 项</el-tag>
        <span class="ml20">净盈亏：<b :class="{ 'text-danger': totalDiff < 0, 'text-success': totalDiff > 0 }">{{ totalDiff > 0 ? '+' : '' }}{{ totalDiff }}</b></span>
      </div>
    </el-card>

    <!-- 底部按钮 -->
    <div class="footer-global" v-if="!isNew || form.id">
      <div class="btn-box">
        <div v-if="!isViewMode && canEdit">
          <el-button @click="doCheck" type="primary">完成盘点</el-button>
          <el-button @click="updateToInvalid" type="danger" v-if="form.id">作废</el-button>
        </div>
        <div>
          <el-button v-if="!isViewMode" @click="save" type="primary" plain>暂存</el-button>
          <el-button @click="cancel">{{ isViewMode ? '关闭' : '取消' }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="CheckOrderEdit">
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch } from "vue";
import { addCheckOrder, getCheckOrder, updateCheckOrder, startCheck, getInstancesBySku, check } from "@/api/wms/checkOrder";
import { ElMessage } from "element-plus";
import { Warning, Plus } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { useWmsStore } from '@/store/modules/wms'
import RackSelect from "@/views/components/RackSelect.vue";

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const wmsStore = useWmsStore();
const isViewMode = computed(() => route.query.mode === 'view');
const isNew = computed(() => !route.query.id);
const { wms_check_scope_type } = proxy.useDict("wms_check_scope_type");

const loading = ref(false);
const starting = ref(false);
const canEdit = computed(() => form.value.checkOrderStatus === 0);
const showStartBtn = computed(() => form.value.id && form.value.checkOrderStatus === 0 && (!form.value.details || !form.value.details.length));

const initFormData = {
  id: undefined, checkOrderNo: undefined, checkOrderStatus: 0, remark: undefined,
  warehouseId: undefined, areaId: undefined, rackId: undefined,
  checkScopeType: 'warehouse', checkDate: undefined,
  checkerName: undefined, reviewerName: undefined,
  checkOrderTotal: 0, details: [],
};

const data = reactive({
  form: { ...initFormData },
  applyRules: {
    warehouseId: [{ required: true, message: "请选择仓库", trigger: ['blur', 'change'] }],
  },
  rules: {
    warehouseId: [{ required: true, message: "请选择仓库", trigger: ['blur', 'change'] }],
  },
});
const { form, applyRules, rules } = toRefs(data);

// SKU实例懒加载缓存
const skuInstanceCache = reactive({});
const skuInstanceLoading = reactive({});
// 盘盈时手动添加的实例
const gainInstanceMap = reactive({});
// 已保存的盘亏实例（从后端详情恢复）
const lossInstanceMap = reactive({});

const close = () => {
  if (route.query.returnFullPath) { proxy?.$tab.closeOpenPage(route.query.returnFullPath); return; }
  proxy?.$tab.closePage();
};

const cancel = async () => {
  if (isViewMode.value) { close(); return; }
  await proxy?.$modal.confirm('确认取消编辑盘点单吗？');
  close();
};

// ===== 范围联动 =====
const syncCheckScopeType = () => {
  if (form.value.rackId) { form.value.checkScopeType = 'rack'; return; }
  if (form.value.areaId) { form.value.checkScopeType = 'area'; return; }
  form.value.checkScopeType = 'warehouse';
};
const handleWarehouseChange = () => { form.value.areaId = undefined; form.value.rackId = undefined; syncCheckScopeType(); };
const handleAreaChange = () => { form.value.rackId = undefined; syncCheckScopeType(); };
watch(() => form.value.rackId, syncCheckScopeType);

// ===== 提交申请 =====
const applyForm = ref();
const submitApplication = () => {
  applyForm.value?.validate((valid) => {
    if (!valid) return ElMessage.error('请填写必填项');
    syncCheckScopeType();
    const params = {
      warehouseId: form.value.warehouseId,
      areaId: form.value.areaId,
      rackId: form.value.rackId,
      checkScopeType: form.value.checkScopeType,
      checkerName: form.value.checkerName,
      reviewerName: form.value.reviewerName,
      remark: form.value.remark,
      checkOrderTotal: 0,
    };
    addCheckOrder(params).then(res => {
      if (res.code === 200) {
        ElMessage.success('盘点申请已提交');
        close();
      } else {
        ElMessage.error(res.msg);
      }
    });
  });
};

// ===== 开始盘点 =====
const doStartCheck = () => {
  starting.value = true;
  startCheck(form.value.id).then(res => {
    if (res.code === 200) {
      const data = res.data;
      form.value.details = (data.details || []).map(it => ({
        ...it,
        checkQuantity: it.checkQuantity ?? it.quantity,
      }));
      form.value.checkDate = data.checkDate;
      form.value.instances = data.instances || [];
      ElMessage.success('已加载 ' + (form.value.details?.length || 0) + ' 项器材明细');
    } else {
      ElMessage.error(res.msg);
    }
  }).finally(() => starting.value = false);
};

// ===== 数量变更 =====
const handleChangeQuantity = (row) => {
  // 触发响应式更新
};

const getDiff = (row) => Number(row.checkQuantity || 0) - Number(row.quantity || 0);

const lossCount = computed(() => form.value.details?.filter(r => getDiff(r) < 0).length || 0);
const gainCount = computed(() => form.value.details?.filter(r => getDiff(r) > 0).length || 0);
const equalCount = computed(() => form.value.details?.filter(r => getDiff(r) === 0).length || 0);
const totalDiff = computed(() => form.value.details?.reduce((sum, r) => sum + getDiff(r), 0) || 0);

const detailRowClass = ({ row }) => {
  const d = getDiff(row);
  if (d < 0) return 'row-loss';
  if (d > 0) return 'row-gain';
  return '';
};

// ===== 实例懒加载 =====
const loadInstances = async (row) => {
  if (skuInstanceLoading[row.skuId]) return;
  skuInstanceLoading[row.skuId] = true;
  try {
    const res = await getInstancesBySku(form.value.id, row.skuId);
    if (res.code === 200) {
      skuInstanceCache[row.skuId] = res.data || [];
    }
  } finally {
    skuInstanceLoading[row.skuId] = false;
  }
};

const getLossInstances = (row) => {
  // 优先使用已保存的盘亏实例（已完成盘点单回显）
  if (lossInstanceMap[row.skuId]) {
    return lossInstanceMap[row.skuId];
  }
  // 编辑中的盘点单：从账面实例中排除已扫描的 = 盘亏实例
  const bookInstances = skuInstanceCache[row.skuId] || [];
  const scannedCodes = new Set(row.scannedInstanceCodes || []);
  return bookInstances
    .filter(inst => !scannedCodes.has(inst.instanceCode))
    .map(inst => ({
      instanceCode: inst.instanceCode,
      instanceItemName: inst.itemSku?.itemName || '',
      remark: inst._remark || '',
    }));
};

const getGainInstances = (row) => {
  // 返回手动添加的盘盈实例
  return gainInstanceMap[row.skuId] || [];
};

// 判断某行是否有可用的实例数据（已保存或已加载）
const hasInstancesData = (row) => {
  return skuInstanceCache[row.skuId] || lossInstanceMap[row.skuId] || gainInstanceMap[row.skuId];
};

const addGainInstance = (row) => {
  if (!gainInstanceMap[row.skuId]) gainInstanceMap[row.skuId] = [];
  gainInstanceMap[row.skuId].push({
    instanceCode: '',
    remark: '',
    _key: Date.now() + Math.random(),
  });
};

// ===== 保存/完成/作废 =====
const checkForm = ref();

const save = async () => {
  await proxy?.$modal.confirm('确认暂存盘点单吗？');
  doSave();
};

const doSave = (checkOrderStatus) => {
  const details = (form.value.details || []).map(it => ({
    id: it.id, checkOrderId: form.value.id, skuId: it.skuId,
    quantity: it.quantity, checkQuantity: it.checkQuantity,
    warehouseId: form.value.warehouseId, areaId: it.areaId, rackId: it.rackId,
  }));
  const params = {
    id: form.value.id, checkOrderNo: form.value.checkOrderNo,
    checkOrderStatus: checkOrderStatus ?? form.value.checkOrderStatus,
    remark: form.value.remark, checkOrderTotal: totalDiff.value,
    warehouseId: form.value.warehouseId, areaId: form.value.areaId, rackId: form.value.rackId,
    checkScopeType: form.value.checkScopeType,
    checkDate: form.value.checkDate, checkerName: form.value.checkerName,
    reviewerName: form.value.reviewerName, details,
  };
  if (params.id) {
    updateCheckOrder(params).then(res => {
      if (res.code === 200) { ElMessage.success(res.msg); close(); }
      else ElMessage.error(res.msg);
    });
  } else {
    addCheckOrder(params).then(res => {
      if (res.code === 200) { ElMessage.success(res.msg); close(); }
      else ElMessage.error(res.msg);
    });
  }
};

const updateToInvalid = async () => {
  await proxy?.$modal.confirm('确认作废盘点单吗？');
  doSave(-1);
};

const doCheck = async () => {
  await proxy?.$modal.confirm('确认盘点结束吗？完成后不可修改。');
  // 构建详情（含实例差异信息）
  const details = (form.value.details || []).map(it => {
    const diff = getDiff(it);
    // 收集实例编码
    let scannedCodes = it.scannedInstanceCodes || [];
    // 盘亏：从账面实例中排除已扫描的 = 盘亏实例
    // 盘盈：收集手动添加的盘盈实例编码
    const gainInstances = gainInstanceMap[it.skuId] || [];
    const gainCodes = gainInstances.filter(g => g.instanceCode).map(g => g.instanceCode);
    // 合并：已扫描的 = 账面实例 - 盘亏 + 盘盈
    // 对于Web端手动填写：scannedCodes需要由用户从展开区域标记
    return {
      id: it.id, checkOrderId: form.value.id, skuId: it.skuId,
      quantity: it.quantity, checkQuantity: it.checkQuantity,
      profitAndLoss: diff, differenceQuantity: diff,
      warehouseId: form.value.warehouseId, areaId: it.areaId, rackId: it.rackId,
      scannedInstanceCodes: [...scannedCodes, ...gainCodes],
    };
  });
  const params = {
    id: form.value.id, checkOrderNo: form.value.checkOrderNo,
    checkOrderTotal: totalDiff.value,
    warehouseId: form.value.warehouseId, areaId: form.value.areaId, rackId: form.value.rackId,
    checkScopeType: form.value.checkScopeType,
    checkDate: form.value.checkDate, checkerName: form.value.checkerName,
    reviewerName: form.value.reviewerName, remark: form.value.remark,
    details,
  };
  check(params).then(res => {
    if (res.code === 200) { ElMessage.success('盘点完成'); close(); }
    else ElMessage.error(res.msg);
  });
};

// ===== 加载详情 =====
const loadDetail = (id) => {
  loading.value = true;
  getCheckOrder(id).then(res => {
    if (res.code === 200) {
      const data = res.data;
      data.checkScopeType = data.checkScopeType || (data.rackId ? 'rack' : (data.areaId ? 'area' : 'warehouse'));
      // 初始化 checkQuantity：未填写时默认为账面数量，盈亏数为0
      if (data.details && data.details.length) {
        data.details = data.details.map(it => ({
          ...it,
          checkQuantity: it.checkQuantity ?? it.quantity,
        }));
      }
      form.value = { ...data };
      // 恢复盘盈/盘亏实例
      if (data.instances && data.instances.length) {
        data.instances.forEach(inst => {
          if (inst.resultType === 'gain') {
            if (!gainInstanceMap[inst.skuId]) gainInstanceMap[inst.skuId] = [];
            gainInstanceMap[inst.skuId].push({
              instanceCode: inst.instanceCode,
              remark: inst.remark || '',
              _key: inst.id || Date.now(),
            });
          } else if (inst.resultType === 'loss') {
            if (!lossInstanceMap[inst.skuId]) lossInstanceMap[inst.skuId] = [];
            lossInstanceMap[inst.skuId].push({
              instanceCode: inst.instanceCode,
              instanceItemName: inst.itemSku?.itemName || inst.itemName || '',
              remark: inst.remark || '',
            });
          }
        });
      }
    }
  }).finally(() => loading.value = false);
};

onMounted(() => {
  const id = route.query?.id;
  if (id) loadDetail(id);
});
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.module";

.btn-box {
  width: calc(100% - #{$base-sidebar-width});
  display: flex; align-items: center; justify-content: space-between; float: right;
}
.instance-panel {
  padding: 12px 20px;
}
.section-title {
  display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
}
.instance-list {
  display: flex; flex-direction: column; gap: 8px;
}
.instance-item {
  display: flex; align-items: center; gap: 8px; padding: 4px 0;
}
.instance-code {
  font-family: monospace; font-weight: 500;
}
.instance-name {
  color: var(--el-text-color-secondary); font-size: 13px;
}
.summary-bar {
  display: flex; align-items: center; padding: 8px 0;
}
.text-danger { color: #f56c6c; }
.text-success { color: #67c23a; }
.text-muted { color: var(--el-text-color-secondary); font-size: 13px; }
.el-statistic__content { font-size: 14px; }
:deep(.row-loss) { background-color: #fef0f0 !important; }
:deep(.row-gain) { background-color: #f0f9eb !important; }
</style>
