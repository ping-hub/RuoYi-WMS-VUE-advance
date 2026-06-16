<template>
  <!-- 申请模式：新建盘点任务 -->
  <div v-if="isNew && !form.id" style="display:flex;justify-content:center;align-items:center;min-height:70vh">
    <el-card header="提交盘点任务" style="width:600px">
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
          <el-select v-model="form.checkerName" placeholder="请选择盘点人" filterable style="width: 100%">
            <el-option v-for="u in userList" :key="u.userId" :label="u.nickName" :value="u.nickName" />
          </el-select>
        </el-form-item>
        <el-form-item label="复核人" prop="reviewerName">
          <el-select v-model="form.reviewerName" placeholder="请选择复核人" filterable style="width: 100%">
            <el-option v-for="u in userList" :key="u.userId" :label="u.nickName" :value="u.nickName" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="备注...100个字符以内" rows="3" maxlength="100" type="textarea" show-word-limit />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitApplication" style="width:100%">提交盘点任务</el-button>
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
              <el-select v-model="form.checkerName" placeholder="请选择盘点人" filterable style="width: 100%">
                <el-option v-for="u in userList" :key="u.userId" :label="u.nickName" :value="u.nickName" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="复核人" prop="reviewerName">
              <el-select v-model="form.reviewerName" placeholder="请选择复核人" filterable style="width: 100%">
                <el-option v-for="u in userList" :key="u.userId" :label="u.nickName" :value="u.nickName" />
              </el-select>
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
        <el-tag type="info">展开行可查看账面实例与实际实例对比，右侧可增删实际实例</el-tag>
      </div>
      <el-table :data="form.details" border empty-text="暂无盘点明细" row-key="skuId"
                :row-class-name="detailRowClass" @expand-change="onExpandChange">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="instance-panel">
              <!-- 加载中 -->
              <div v-if="skuInstanceLoading[row.skuId]" style="padding:12px 20px">
                <el-skeleton :rows="3" animated />
              </div>
              <!-- 未加载 -->
              <div v-else-if="!skuInstanceCache[row.skuId]" class="instance-panel-empty">
                <span class="text-muted">点击「加载账面实例」按钮加载数据</span>
              </div>
              <!-- 双栏布局 -->
              <div v-else class="instance-dual-panel">
                <!-- 左侧：账面实例（只读） -->
                <div class="instance-side-panel">
                  <div class="section-title">
                    <el-tag type="info" size="small">账面实例（{{ getBookInstanceCount(row) }}）</el-tag>
                  </div>
                  <div class="instance-scroll">
                    <div v-for="inst in skuInstanceCache[row.skuId]" :key="inst.instanceCode" class="instance-item">
                      <span class="instance-code">{{ inst.instanceCode }}</span>
                      <span class="instance-name">{{ inst.itemSku?.itemName || '-' }}</span>
                    </div>
                    <el-empty v-if="!skuInstanceCache[row.skuId]?.length" description="无账面实例" :image-size="40" />
                  </div>
                </div>
                <!-- 右侧：实际实例（可增删） -->
                <div class="instance-side-panel">
                  <div class="section-title">
                    <el-tag type="warning" size="small">实际实例（{{ getActualInstanceCount(row) }}）</el-tag>
                    <el-button v-if="!isViewMode && canEdit" link type="primary" size="small"
                               @click="loadInstances(row)">
                      {{ skuInstanceCache[row.skuId] ? '刷新' : '加载' }}账面实例
                    </el-button>
                  </div>
                  <div class="instance-scroll">
                    <div v-for="(inst, idx) in (actualInstanceMap[row.skuId] || [])" :key="inst.instanceCode || inst._key" class="instance-item">
                      <el-input v-if="inst._isManual" v-model="inst.instanceCode" placeholder="实例编码" size="small"
                                style="width:180px" :disabled="isViewMode || !canEdit" />
                      <span v-else class="instance-code">{{ inst.instanceCode }}</span>
                      <el-input v-model="inst.remark" placeholder="备注" size="small"
                                style="width:150px;margin-left:8px" :disabled="isViewMode || !canEdit" />
                      <el-button v-if="!isViewMode && canEdit" link type="danger" size="small"
                                 style="margin-left:auto" @click="removeActualInstance(row, idx)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                    <el-empty v-if="!getActualInstanceCount(row)" description="无实际实例" :image-size="40" />
                  </div>
                  <el-button v-if="!isViewMode && canEdit" link type="primary" size="small"
                             @click="addActualInstance(row)" class="mt5">
                    + 添加实际实例
                  </el-button>
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
        <el-table-column label="实际数量" align="right" width="110">
          <template #default="{ row }">
            <el-statistic :value="getCheckQuantity(row)" :precision="0" />
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
import { listUser } from "@/api/system/user";
import { ElMessage } from "element-plus";
import { Delete } from "@element-plus/icons-vue";
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
// 实际实例（右侧面板，用户可增删）
const actualInstanceMap = reactive({});
// 从后端详情恢复时的暂存数据（等待账面实例加载后组装 actualInstanceMap）
const _pendingInstanceRestore = {};

// ===== 用户下拉列表 =====
const userList = ref([]);
const loadUserList = () => {
  listUser({ pageNum: 1, pageSize: 1000, status: '0' }).then(res => {
    if (res.code === 200) {
      userList.value = res.rows || [];
    }
  });
};

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
        ElMessage.success('盘点任务已提交');
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

// ===== 数量计算 =====
// 实际数量 = 右侧实际实例列表的长度（若未加载则回退到 row.checkQuantity）
const getCheckQuantity = (row) => {
  if (actualInstanceMap[row.skuId]) return actualInstanceMap[row.skuId].length;
  if (skuInstanceCache[row.skuId]) return skuInstanceCache[row.skuId].length; // 默认等于账面
  return Number(row.checkQuantity || 0);
};

const getDiff = (row) => getCheckQuantity(row) - Number(row.quantity || 0);

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

// ===== 展开行自动加载 =====
const onExpandChange = (row, expandedRows) => {
  const isExpanded = expandedRows.some(r => r.skuId === row.skuId);
  if (isExpanded && !skuInstanceCache[row.skuId] && !skuInstanceLoading[row.skuId]) {
    loadInstances(row);
  }
};

// ===== 实例懒加载 =====
const loadInstances = async (row) => {
  if (skuInstanceLoading[row.skuId]) return;
  skuInstanceLoading[row.skuId] = true;
  try {
    const res = await getInstancesBySku(form.value.id, row.skuId);
    if (res.code === 200) {
      skuInstanceCache[row.skuId] = res.data || [];
      // 若有待恢复的实例数据，重建 actualInstanceMap
      if (_pendingInstanceRestore[row.skuId]) {
        const { loss, gain } = _pendingInstanceRestore[row.skuId];
        const lossCodes = new Set(loss.map(l => l.instanceCode));
        // 实际 = 账面 - 盘亏 + 盘盈
        actualInstanceMap[row.skuId] = [
          ...(res.data || [])
            .filter(inst => !lossCodes.has(inst.instanceCode))
            .map(inst => ({
              instanceCode: inst.instanceCode,
              itemName: inst.itemSku?.itemName || '',
              remark: '',
            })),
          ...gain.map(inst => ({
            instanceCode: inst.instanceCode,
            remark: inst.remark || '',
            _isManual: true,
            _key: inst.id || Date.now() + Math.random(),
          })),
        ];
        delete _pendingInstanceRestore[row.skuId];
      } else if (!actualInstanceMap[row.skuId]) {
        // 若实际实例尚未初始化，默认复制账面实例
        actualInstanceMap[row.skuId] = (res.data || []).map(inst => ({
          instanceCode: inst.instanceCode,
          itemName: inst.itemSku?.itemName || '',
          remark: '',
        }));
      }
    }
  } finally {
    skuInstanceLoading[row.skuId] = false;
  }
};

// ===== 实际实例操作 =====
const getBookInstanceCount = (row) => (skuInstanceCache[row.skuId] || []).length;
const getActualInstanceCount = (row) => (actualInstanceMap[row.skuId] || []).length;

const addActualInstance = (row) => {
  if (!actualInstanceMap[row.skuId]) actualInstanceMap[row.skuId] = [];
  actualInstanceMap[row.skuId].push({
    instanceCode: '',
    remark: '',
    _isManual: true,
    _key: Date.now() + Math.random(),
  });
};

const removeActualInstance = (row, index) => {
  if (actualInstanceMap[row.skuId]) {
    actualInstanceMap[row.skuId].splice(index, 1);
  }
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
    quantity: it.quantity, checkQuantity: getCheckQuantity(it),
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
    // 从实际实例列表收集实例编码
    const actualInstances = actualInstanceMap[it.skuId] || [];
    const scannedCodes = actualInstances.filter(i => i.instanceCode).map(i => i.instanceCode);
    return {
      id: it.id, checkOrderId: form.value.id, skuId: it.skuId,
      quantity: it.quantity, checkQuantity: getCheckQuantity(it),
      profitAndLoss: diff, differenceQuantity: diff,
      warehouseId: form.value.warehouseId, areaId: it.areaId, rackId: it.rackId,
      scannedInstanceCodes: scannedCodes,
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
      // 恢复实际实例：从已保存的实例数据重建
      // 实际实例 = 账面实例 - 盘亏实例 + 盘盈实例
      if (data.instances && data.instances.length) {
        // 按skuId分组
        const skuInstanceData = {};
        data.instances.forEach(inst => {
          if (!skuInstanceData[inst.skuId]) skuInstanceData[inst.skuId] = { loss: [], gain: [] };
          if (inst.resultType === 'loss') {
            skuInstanceData[inst.skuId].loss.push(inst);
          } else if (inst.resultType === 'gain') {
            skuInstanceData[inst.skuId].gain.push(inst);
          }
        });
        // 记录到临时变量，等 loadInstances 加载账面实例后再组装 actualInstanceMap
        Object.keys(skuInstanceData).forEach(skuId => {
          _pendingInstanceRestore[skuId] = skuInstanceData[skuId];
        });
      }
    }
  }).finally(() => loading.value = false);
};

onMounted(() => {
  loadUserList();
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
.instance-panel-empty {
  padding: 20px; text-align: center;
}
.instance-dual-panel {
  display: flex; gap: 16px;
}
.instance-side-panel {
  flex: 1; min-width: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px; padding: 10px 12px;
  background: var(--el-fill-color-lighter);
}
.instance-scroll {
  max-height: 280px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 6px;
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
