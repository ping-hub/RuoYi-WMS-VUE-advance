<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="88px">
        <el-form-item label="借用状态" prop="borrowStatus">
          <el-select v-model="queryParams.borrowStatus" placeholder="请选择借用状态" clearable style="width: 160px">
            <el-option v-for="dict in wms_borrow_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="overdueFlag">
          <template #label>
            <FormLabelHelp label="超期状态" purpose="按是否超过计划归还日期筛选借用记录，便于快速定位预警单据。" example="已超期、正常" />
          </template>
          <el-select v-model="queryParams.overdueFlag" placeholder="请选择超期状态" clearable style="width: 160px">
            <el-option label="正常" :value="0" />
            <el-option label="已超期" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item prop="borrower">
          <template #label>
            <FormLabelHelp label="借用人" />
          </template>
          <el-input v-model="queryParams.borrower" placeholder="请输入借用人" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item prop="fromUnit">
          <template #label>
            <FormLabelHelp label="发货单位" purpose="表示借出方所属单位，用于借用单据头和追踪结果展示。" example="仓储保障连" />
          </template>
          <el-input v-model="queryParams.fromUnit" placeholder="请输入发货单位" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item prop="toUnit">
          <template #label>
            <FormLabelHelp label="收货单位" purpose="表示借入方所属单位，用于借用去向记录和联调核对。" example="作训股、机动分队" />
          </template>
          <el-input v-model="queryParams.toUnit" placeholder="请输入收货单位" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="器材实例编码" prop="instanceCode">
          <el-input v-model="queryParams.instanceCode" placeholder="请输入器材实例编码" clearable @keyup.enter="handleInstanceCodeQuery" />
        </el-form-item>
        <el-form-item label="器材实例编码" prop="itemInstanceId">
          <el-select v-model="queryParams.itemInstanceId" placeholder="请选择器材实例编码" clearable filterable style="width: 220px">
            <el-option
              v-for="item in instanceOptions"
              :key="item.id"
              :label="item.instanceCode + (item.itemName ? ' / ' + item.itemName : '')"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="stats-row">
      <el-card class="stats-card">
        <div class="stats-label">借出中</div>
        <div class="stats-value">{{ warningStats.borrowingCount }}</div>
      </el-card>
      <el-card class="stats-card warning-card">
        <div class="stats-label">超期预警</div>
        <div class="stats-value">{{ warningStats.overdueCount }}</div>
      </el-card>
    </div>

    <el-card class="mt20">
      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="8"><span style="font-size: large">器材借用</span></el-col>
        <el-col :span="4" class="toolbar-right">
          <el-button type="primary" plain icon="Plus" @click="handleBorrow()" v-hasPermi="['wms:borrowRecord:edit']">借出登记</el-button>
          <el-button type="success" plain icon="RefreshLeft" @click="handleReturn()" v-hasPermi="['wms:borrowRecord:edit']">归还登记</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="borrowRecordList" border empty-text="暂无借用记录" cell-class-name="vertical-top-cell">
        <el-table-column label="器材实例编码" min-width="220">
          <template #default="{ row }">
            <div>{{ row.instanceCode || '-' }}</div>
            <div v-if="row.itemName" class="sub-text">器材：{{ row.itemName }}</div>
            <div v-if="row.skuName" class="sub-text">器材规格：{{ row.skuName }}</div>
            <div v-if="row.borrowNo" class="sub-text">借用单号：{{ row.borrowNo }}</div>
          </template>
        </el-table-column>
        <el-table-column label="借用状态" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_borrow_status" :value="row.borrowStatus" />
          </template>
        </el-table-column>
        <el-table-column label="预警" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.overdueFlag === 1" type="danger">超期{{ row.overdueDays || 0 }}天</el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="借用信息" min-width="220">
          <template #default="{ row }">
            <div>借用人：{{ row.borrower }}</div>
            <div v-if="row.fromUnit || row.toUnit" class="sub-text">单位：{{ row.fromUnit || '-' }} -> {{ row.toUnit || '-' }}</div>
            <div v-if="row.fromPerson || row.toPerson" class="sub-text">经手：{{ row.fromPerson || '-' }} / {{ row.toPerson || '-' }}</div>
            <div v-if="row.docDate" class="sub-text">单据日期：{{ parseTime(row.docDate, '{y}-{m}-{d}') }}</div>
            <div v-if="row.planReturnDate" class="sub-text">计划归还：{{ parseTime(row.planReturnDate, '{y}-{m}-{d}') }}</div>
            <div class="sub-text">借用时间：{{ row.borrowTime ? parseTime(row.borrowTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</div>
            <div v-if="row.borrowRemark" class="sub-text">借用备注：{{ row.borrowRemark }}</div>
          </template>
        </el-table-column>
        <el-table-column label="原位置" min-width="220">
          <template #default="{ row }">
            <div v-if="row.originalWarehouseName">仓库：{{ row.originalWarehouseName }}</div>
            <div v-if="row.originalAreaName">库区：{{ row.originalAreaName }}</div>
            <div v-if="row.originalRackName">货架：{{ row.originalRackName }}</div>
            <div v-if="row.originalLocationName">货位：{{ row.originalLocationName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="归还信息" min-width="220">
          <template #default="{ row }">
            <div>{{ row.returnTime ? ('归还时间：' + parseTime(row.returnTime, '{y}-{m}-{d} {h}:{i}:{s}')) : '未归还' }}</div>
            <div class="sub-text">归还方式：原位归还</div>
            <div v-if="row.returnedWarehouseName || row.returnedAreaName || row.returnedRackName || row.returnedLocationName" class="sub-text">
              归还位置：{{ getReturnedLocationText(row) }}
            </div>
            <div v-if="row.returnRemark" class="sub-text">归还备注：{{ row.returnRemark }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button
              v-if="row.borrowStatus === 'borrowed'"
              link
              type="success"
              @click="handleReturn(row)"
              v-hasPermi="['wms:borrowRecord:edit']"
            >归还</el-button>
            <el-button link type="primary" @click="handleOpenItem(row)">明细</el-button>
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

    <el-dialog title="借出登记" v-model="borrowDialog.visible" width="760px" append-to-body :close-on-click-modal="false">
      <div class="form-tip">带 * 为必填项</div>
      <el-form ref="borrowFormRef" :model="borrowDialog.form" :rules="borrowRules" label-width="110px">
        <el-form-item label="器材实例编码" prop="itemInstanceId">
          <el-select
            v-model="borrowDialog.form.itemInstanceId"
            placeholder="请选择器材实例编码"
            filterable
            clearable
            style="width: 100%"
            @change="handleBorrowInstanceChange"
          >
            <el-option
              v-for="item in borrowDialog.instanceOptions"
              :key="item.id"
              :label="item.instanceCode + (item.itemName ? ' / ' + item.itemName : '')"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-descriptions v-if="borrowDialog.currentItem.id" :column="2" border class="mb16">
          <el-descriptions-item label="器材实例编码">{{ borrowDialog.currentItem.instanceCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="器材">{{ borrowDialog.currentItem.itemName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="器材规格">{{ borrowDialog.currentItem.skuName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <dict-tag :options="itemInstanceStatusOptions" :value="borrowDialog.currentItem.instanceStatus" />
          </el-descriptions-item>
          <el-descriptions-item label="当前位置" :span="2">{{ getLocationText(borrowDialog.currentItem) }}</el-descriptions-item>
        </el-descriptions>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="borrower">
              <template #label>
                <FormLabelHelp label="借用人"/>
              </template>
              <el-input v-model="borrowDialog.form.borrower" placeholder="请输入借用人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="借用时间" prop="borrowTime">
              <el-date-picker
                v-model="borrowDialog.form.borrowTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="planReturnDate">
              <template #label>
                <FormLabelHelp label="计划归还" purpose="用于计算是否超期，并在借用列表和追踪页显示预警状态。" example="2026-05-20" />
              </template>
              <el-date-picker
                v-model="borrowDialog.form.planReturnDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="fromUnit">
              <template #label>
                <FormLabelHelp label="发货单位" purpose="记录借出方单位信息，对应借用单语义中的发货单位。" example="器材库一连" />
              </template>
              <el-input v-model="borrowDialog.form.fromUnit" placeholder="请输入发货单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="toUnit">
              <template #label>
                <FormLabelHelp label="收货单位" purpose="记录借入方单位信息，对应借用单语义中的收货单位。" example="野外作业组" />
              </template>
              <el-input v-model="borrowDialog.form.toUnit" placeholder="请输入收货单位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发货人" prop="fromPerson">
              <el-input v-model="borrowDialog.form.fromPerson" placeholder="请输入发货人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收货人" prop="toPerson">
              <el-input v-model="borrowDialog.form.toPerson" placeholder="请输入收货人" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单据日期" prop="docDate">
              <el-date-picker
                v-model="borrowDialog.form.docDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="借用备注" prop="borrowRemark">
          <el-input v-model="borrowDialog.form.borrowRemark" type="textarea" :rows="3" placeholder="请输入借用备注" />
        </el-form-item>
        <el-alert
          :closable="false"
          type="info"
          title="当前阶段借用归还只支持原位归还，归还位置由后端按原位置回写。"
        />
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitBorrow">确 定</el-button>
          <el-button @click="borrowDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="归还登记" v-model="returnDialog.visible" width="760px" append-to-body :close-on-click-modal="false">
      <el-form ref="returnFormRef" :model="returnDialog.form" label-width="100px">
        <el-form-item label="器材实例编码" prop="itemInstanceId">
          <el-select
            v-model="returnDialog.form.itemInstanceId"
            placeholder="请选择器材实例编码"
            filterable
            clearable
            style="width: 100%"
            @change="handleReturnInstanceChange"
            :disabled="!!returnDialog.form.id"
          >
            <el-option
              v-for="item in returnDialog.instanceOptions"
              :key="item.id"
              :label="item.instanceCode + (item.itemName ? ' / ' + item.itemName : '')"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-descriptions v-if="returnDialog.currentRecord.id" :column="2" border class="mb16">
          <el-descriptions-item label="借用单号">{{ returnDialog.currentRecord.borrowNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="器材实例编码">{{ returnDialog.currentRecord.instanceCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="借用人">{{ returnDialog.currentRecord.borrower || '-' }}</el-descriptions-item>
          <el-descriptions-item label="借用时间">{{ returnDialog.currentRecord.borrowTime ? parseTime(returnDialog.currentRecord.borrowTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</el-descriptions-item>
          <el-descriptions-item label="计划归还">{{ returnDialog.currentRecord.planReturnDate ? parseTime(returnDialog.currentRecord.planReturnDate, '{y}-{m}-{d}') : '-' }}</el-descriptions-item>
          <el-descriptions-item label="原位置" :span="2">{{ getOriginalLocationText(returnDialog.currentRecord) }}</el-descriptions-item>
        </el-descriptions>
        <el-alert
          :closable="false"
          type="warning"
          class="mb16"
          title="本阶段仅支持原位归还，不提供归还到新货位能力。"
        />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="归还时间" prop="returnTime">
              <el-date-picker
                v-model="returnDialog.form.returnTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="归还备注" prop="returnRemark">
          <el-input v-model="returnDialog.form.returnRemark" type="textarea" :rows="3" placeholder="请输入归还备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitReturn">确 定</el-button>
          <el-button @click="returnDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="借用详情" v-model="detailDialog.visible" width="860px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="借用单号">{{ detailDialog.data.borrowNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="器材实例编码">{{ detailDialog.data.instanceCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="借用状态">
          <dict-tag :options="wms_borrow_status" :value="detailDialog.data.borrowStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="器材">{{ detailDialog.data.itemName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="器材规格">{{ detailDialog.data.skuName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="借用人">{{ detailDialog.data.borrower || '-' }}</el-descriptions-item>
        <el-descriptions-item label="借用时间">{{ detailDialog.data.borrowTime ? parseTime(detailDialog.data.borrowTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</el-descriptions-item>
        <el-descriptions-item label="发货单位">{{ detailDialog.data.fromUnit || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收货单位">{{ detailDialog.data.toUnit || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发货人">{{ detailDialog.data.fromPerson || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ detailDialog.data.toPerson || '-' }}</el-descriptions-item>
        <el-descriptions-item label="单据日期">{{ detailDialog.data.docDate ? parseTime(detailDialog.data.docDate, '{y}-{m}-{d}') : '-' }}</el-descriptions-item>
        <el-descriptions-item label="计划归还">{{ detailDialog.data.planReturnDate ? parseTime(detailDialog.data.planReturnDate, '{y}-{m}-{d}') : '-' }}</el-descriptions-item>
        <el-descriptions-item label="超期状态">
          <el-tag v-if="detailDialog.data.overdueFlag === 1" type="danger">超期{{ detailDialog.data.overdueDays || 0 }}天</el-tag>
          <el-tag v-else type="success">正常</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="借用备注" :span="2">{{ detailDialog.data.borrowRemark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="原位置" :span="2">{{ getOriginalLocationText(detailDialog.data) }}</el-descriptions-item>
        <el-descriptions-item label="归还时间">{{ detailDialog.data.returnTime ? parseTime(detailDialog.data.returnTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</el-descriptions-item>
        <el-descriptions-item label="归还位置">{{ getReturnedLocationText(detailDialog.data) }}</el-descriptions-item>
        <el-descriptions-item label="归还备注" :span="2">{{ detailDialog.data.returnRemark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="BorrowRecord">
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  borrowItem,
  getBorrowRecord,
  getCurrentBorrowRecord,
  getBorrowWarningStats,
  listBorrowRecord,
  returnBorrowItem
} from '@/api/wms/borrowRecord';
import { listItemInstance, getItemInstanceByCode, getItemInstance } from '@/api/wms/itemInstance';
import FormLabelHelp from '@/views/components/FormLabelHelp.vue'

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const { wms_borrow_status, wms_item_instance_status } = proxy.useDict('wms_borrow_status', 'wms_item_instance_status');

const loading = ref(true);
const buttonLoading = ref(false);
const total = ref(0);
const borrowRecordList = ref([]);
const warningStats = reactive({
  borrowingCount: 0,
  overdueCount: 0
});
const queryRef = ref();
const borrowFormRef = ref();
const returnFormRef = ref();
const instanceOptions = ref([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  itemInstanceId: undefined,
  borrowStatus: undefined,
  borrower: undefined,
  fromUnit: undefined,
  toUnit: undefined,
  overdueFlag: undefined,
  instanceCode: undefined
});

const borrowDialog = reactive({
  visible: false,
  form: {
    itemInstanceId: undefined,
    borrower: undefined,
    fromUnit: undefined,
    toUnit: undefined,
    fromPerson: undefined,
    toPerson: undefined,
    docDate: undefined,
    planReturnDate: undefined,
    borrowTime: undefined,
    borrowRemark: undefined
  },
  instanceOptions: [],
  currentItem: {}
});

const returnDialog = reactive({
  visible: false,
  form: {
    id: undefined,
    itemInstanceId: undefined,
    returnTime: undefined,
    returnRemark: undefined
  },
  instanceOptions: [],
  currentRecord: {}
});

const detailDialog = reactive({
  visible: false,
  data: {}
});

const borrowRules = {
  itemInstanceId: [
    { required: true, message: '器材实例编码不能为空', trigger: 'change' }
  ],
  borrower: [
    { required: true, message: '借用人不能为空', trigger: 'blur' }
  ],
  planReturnDate: [
    { required: true, message: '计划归还日期不能为空', trigger: 'change' }
  ]
};

const itemInstanceStatusOptions = computed(() => wms_item_instance_status.value);

const getLocationText = (row) => {
  const parts = [];
  if (row.warehouseName) parts.push('仓库：' + row.warehouseName);
  if (row.areaName) parts.push('库区：' + row.areaName);
  if (row.rackName) parts.push('货架：' + row.rackName);
  if (row.locationName) parts.push('货位：' + row.locationName);
  return parts.length ? parts.join(' / ') : '-';
};

const getOriginalLocationText = (row) => {
  const parts = [];
  if (row.originalWarehouseName) parts.push('仓库：' + row.originalWarehouseName);
  if (row.originalAreaName) parts.push('库区：' + row.originalAreaName);
  if (row.originalRackName) parts.push('货架：' + row.originalRackName);
  if (row.originalLocationName) parts.push('货位：' + row.originalLocationName);
  return parts.length ? parts.join(' / ') : '-';
};

const getReturnedLocationText = (row) => {
  const parts = [];
  if (row.returnedWarehouseName) parts.push('仓库：' + row.returnedWarehouseName);
  if (row.returnedAreaName) parts.push('库区：' + row.returnedAreaName);
  if (row.returnedRackName) parts.push('货架：' + row.returnedRackName);
  if (row.returnedLocationName) parts.push('货位：' + row.returnedLocationName);
  return parts.length ? parts.join(' / ') : '-';
};

const getList = async () => {
  loading.value = true;
  try {
    const query = { ...queryParams };
    delete query.instanceCode;
    const res = await listBorrowRecord(query);
    borrowRecordList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const loadWarningStats = async () => {
  const res = await getBorrowWarningStats();
  warningStats.borrowingCount = Number(res.data?.borrowingCount || 0);
  warningStats.overdueCount = Number(res.data?.overdueCount || 0);
};

const loadBorrowableInstances = async () => {
  const res = await listItemInstance({
    pageNum: 1,
    pageSize: 200,
    instanceStatus: '在库'
  });
  borrowDialog.instanceOptions = (res.rows || []).filter(item => item.instanceStatus === '在库' && !item.boxId);
};

const loadReturnableInstances = async () => {
  const res = await listItemInstance({
    pageNum: 1,
    pageSize: 200
  });
  returnDialog.instanceOptions = res.rows;
};

const loadQueryInstances = async () => {
  const res = await listItemInstance({
    pageNum: 1,
    pageSize: 200
  });
  instanceOptions.value = res.rows;
};

const applyRouteQuery = () => {
  const { itemInstanceId, instanceCode, borrowStatus, overdueFlag } = route.query;
  queryParams.itemInstanceId = itemInstanceId ? Number(itemInstanceId) : undefined;
  queryParams.instanceCode = instanceCode || undefined;
  queryParams.borrowStatus = borrowStatus || undefined;
  queryParams.overdueFlag = overdueFlag !== undefined ? Number(overdueFlag) : undefined;
};

const handleQuery = async () => {
  queryParams.pageNum = 1;
  if (queryParams.instanceCode) {
    await handleInstanceCodeQuery();
    return;
  }
  await getList();
};

const handleInstanceCodeQuery = async () => {
  if (!queryParams.instanceCode) {
    queryParams.itemInstanceId = undefined;
    await getList();
    return;
  }
  try {
    const res = await getItemInstanceByCode(queryParams.instanceCode);
    queryParams.itemInstanceId = res.data?.id;
  } catch (e) {
    queryParams.itemInstanceId = undefined;
    ElMessage.error('未找到对应器材实例编码');
    return;
  }
  queryParams.pageNum = 1;
  await getList();
};

const resetQuery = async () => {
  proxy.resetForm('queryRef');
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.itemInstanceId = undefined;
  queryParams.borrowStatus = undefined;
  queryParams.borrower = undefined;
  queryParams.fromUnit = undefined;
  queryParams.toUnit = undefined;
  queryParams.overdueFlag = undefined;
  queryParams.instanceCode = undefined;
  applyRouteQuery();
  if (queryParams.instanceCode) {
    await handleInstanceCodeQuery();
  } else {
    await getList();
  }
};

const handleBorrow = async (row) => {
  borrowDialog.visible = true;
  borrowDialog.form = {
    itemInstanceId: row?.itemInstanceId || row?.id,
    borrower: undefined,
    fromUnit: undefined,
    toUnit: undefined,
    fromPerson: undefined,
    toPerson: undefined,
    docDate: undefined,
    planReturnDate: undefined,
    borrowTime: undefined,
    borrowRemark: undefined
  };
  borrowDialog.currentItem = {};
  await loadBorrowableInstances();
  if (borrowDialog.form.itemInstanceId) {
    await handleBorrowInstanceChange(borrowDialog.form.itemInstanceId);
  }
};

const handleBorrowInstanceChange = async (itemInstanceId) => {
  if (!itemInstanceId) {
    borrowDialog.currentItem = {};
    return;
  }
  const res = await getItemInstance(itemInstanceId);
  borrowDialog.currentItem = res.data || {};
  borrowDialog.form.instanceCode = res.data?.instanceCode;
};

const submitBorrow = () => {
  borrowFormRef.value.validate(async valid => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      await borrowItem(borrowDialog.form);
      proxy.$modal.msgSuccess('借出登记成功');
      borrowDialog.visible = false;
      await Promise.all([getList(), loadQueryInstances(), loadWarningStats()]);
    } finally {
      buttonLoading.value = false;
    }
  });
};

const handleReturn = async (row) => {
  returnDialog.visible = true;
  returnDialog.form = {
    id: row?.id,
    itemInstanceId: row?.itemInstanceId || row?.id,
    returnTime: undefined,
    returnRemark: undefined
  };
  returnDialog.currentRecord = {};
  await loadReturnableInstances();
  if (row?.id && row?.borrowStatus === 'borrowed') {
    const res = await getBorrowRecord(row.id);
    returnDialog.currentRecord = res.data || {};
  } else if (returnDialog.form.itemInstanceId) {
    await handleReturnInstanceChange(returnDialog.form.itemInstanceId);
  }
};

const handleReturnInstanceChange = async (itemInstanceId) => {
  if (!itemInstanceId) {
    returnDialog.currentRecord = {};
    returnDialog.form.id = undefined;
    return;
  }
  const res = await getCurrentBorrowRecord(itemInstanceId);
  returnDialog.currentRecord = res.data || {};
  returnDialog.form.id = res.data?.id;
};

const submitReturn = async () => {
  if (!returnDialog.form.id && !returnDialog.form.itemInstanceId) {
    proxy.$modal.msgError('请选择待归还的器材实例编码');
    return;
  }
  buttonLoading.value = true;
  try {
    await returnBorrowItem(returnDialog.form);
    proxy.$modal.msgSuccess('归还登记成功');
    returnDialog.visible = false;
    await Promise.all([getList(), loadQueryInstances(), loadWarningStats()]);
  } finally {
    buttonLoading.value = false;
  }
};

const handleView = async (row) => {
  const res = await getBorrowRecord(row.id);
  detailDialog.data = res.data || {};
  detailDialog.visible = true;
};

const handleOpenItem = (row) => {
  router.push({ path: '/wms-item-instance/index', query: { instanceCode: row.instanceCode } });
};

onMounted(async () => {
  applyRouteQuery();
  await Promise.all([
    loadQueryInstances(),
    loadBorrowableInstances(),
    loadReturnableInstances(),
    loadWarningStats()
  ]);
  if (queryParams.itemInstanceId && queryParams.borrowStatus === 'borrowed') {
    await handleReturn({ itemInstanceId: queryParams.itemInstanceId });
  } else if (queryParams.itemInstanceId) {
    await handleBorrow({ id: queryParams.itemInstanceId });
  }
  if (queryParams.instanceCode) {
    await handleInstanceCodeQuery();
  } else {
    await getList();
  }
});
</script>

<style scoped>
.vertical-top-cell {
  vertical-align: top;
}

.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.toolbar-right {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.mb16 {
  margin-bottom: 16px;
}

.form-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-bottom: 12px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.stats-card {
  min-height: 96px;
}

.stats-label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 12px;
}

.stats-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
}

.warning-card .stats-value {
  color: var(--el-color-danger);
}
</style>
