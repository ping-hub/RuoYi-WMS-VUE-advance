<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" label-width="88px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="借用状态" prop="borrowStatus">
              <el-select v-model="queryParams.borrowStatus" placeholder="请选择借用状态" clearable style="width: 100%" @change="handleQuery">
                <el-option v-for="dict in wms_borrow_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="超期状态" prop="overdueFlag" label-width="100px">
              <el-select v-model="queryParams.overdueFlag" placeholder="请选择超期状态" clearable style="width: 100%" @change="handleQuery">
                <el-option v-for="dict in wms_overdue_flag" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="借用人" prop="borrower">
              <el-input v-model="queryParams.borrower" placeholder="请输入借用人" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="发货单位" prop="fromUnit">
              <el-input v-model="queryParams.fromUnit" placeholder="请输入发货单位" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="收货单位" prop="toUnit">
              <el-input v-model="queryParams.toUnit" placeholder="请输入收货单位" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="器材实例编码" prop="instanceCode" label-width="100px">
              <el-input v-model="queryParams.instanceCode" placeholder="请输入器材实例编码" clearable @keyup.enter="handleInstanceCodeQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <div class="query-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </div>
          </el-col>
        </el-row>
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

      <el-table v-loading="loading" :data="borrowRecordList" border empty-text="暂无借用记录" class="borrow-table">
        <el-table-column label="借用单号" prop="borrowNo" min-width="150" show-overflow-tooltip />
        <el-table-column label="器材实例编码" prop="instanceCode" min-width="160" show-overflow-tooltip />
        <el-table-column label="器材名称" prop="itemName" min-width="80" show-overflow-tooltip />
        <el-table-column label="借用状态" width="90" align="center">
          <template #default="{ row }">
            <dict-tag :options="wms_borrow_status" :value="row.borrowStatus" />
          </template>
        </el-table-column>
        <el-table-column label="预警" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.overdueFlag === 1" type="danger">超期{{ row.overdueDays || 0 }}天</el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="借用人" prop="borrower" width="80" show-overflow-tooltip />
        <el-table-column label="借用时间" width="160">
          <template #default="{ row }">
            {{ row.borrowTime ? parseTime(row.borrowTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="计划归还" width="110">
          <template #default="{ row }">
            {{ row.planReturnDate ? parseTime(row.planReturnDate, '{y}-{m}-{d}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="归还时间" width="160">
          <template #default="{ row }">
            {{ row.returnTime ? parseTime(row.returnTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="handleView(row)">详情</el-button>
              <el-button
                v-if="row.borrowStatus === 'borrowed'"
                link
                type="success"
                @click="handleReturn(row)"
                v-hasPermi="['wms:borrowRecord:edit']"
              >归还</el-button>
            </div>
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
        <el-form-item label="器材实例编码" prop="instanceCode">
          <el-select
            v-model="borrowDialog.form.instanceCode"
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
              :value="item.instanceCode"
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
            <el-form-item label="借用人" prop="borrower">
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
            <el-form-item label="计划归还" prop="planReturnDate">
              <el-date-picker
                v-model="borrowDialog.form.planReturnDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
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
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发货单位" prop="fromUnit">
              <el-input v-model="borrowDialog.form.fromUnit" placeholder="请输入发货单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收货单位" prop="toUnit">
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
        <el-form-item label="器材实例编码" prop="instanceCode">
          <el-select
            v-model="returnDialog.form.instanceCode"
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
              :value="item.instanceCode"
            />
          </el-select>
        </el-form-item>
        <div v-if="returnDialog.currentRecord.id" class="return-record-panel mb16">
          <div class="return-record-item">
            <div class="return-record-label">借用单号</div>
            <div class="return-record-value">{{ returnDialog.currentRecord.borrowNo || '-' }}</div>
          </div>
          <div class="return-record-item">
            <div class="return-record-label">器材实例编码</div>
            <div class="return-record-value">{{ returnDialog.currentRecord.instanceCode || '-' }}</div>
          </div>
          <div class="return-record-item">
            <div class="return-record-label">借用人</div>
            <div class="return-record-value">{{ returnDialog.currentRecord.borrower || '-' }}</div>
          </div>
          <div class="return-record-item">
            <div class="return-record-label">借用时间</div>
            <div class="return-record-value">{{ returnDialog.currentRecord.borrowTime ? parseTime(returnDialog.currentRecord.borrowTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</div>
          </div>
          <div class="return-record-item">
            <div class="return-record-label">计划归还</div>
            <div class="return-record-value">{{ returnDialog.currentRecord.planReturnDate ? parseTime(returnDialog.currentRecord.planReturnDate, '{y}-{m}-{d}') : '-' }}</div>
          </div>
          <div class="return-record-item">
            <div class="return-record-label">原位置</div>
            <div class="return-record-value return-record-value-wrap">{{ getOriginalLocationText(returnDialog.currentRecord) }}</div>
          </div>
        </div>
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
                :disabled-date="disableFutureReturnDate"
                :disabled-hours="getDisabledReturnHours"
                :disabled-minutes="getDisabledReturnMinutes"
                :disabled-seconds="getDisabledReturnSeconds"
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
      <el-descriptions :column="2" border class="borrow-detail-descriptions">
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
        <el-descriptions-item label="归还时间">{{ detailDialog.data.returnTime ? parseTime(detailDialog.data.returnTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</el-descriptions-item>
        <el-descriptions-item label="借用备注" :span="2">{{ detailDialog.data.borrowRemark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="原位置" :span="2">{{ getOriginalLocationText(detailDialog.data) }}</el-descriptions-item>
        <el-descriptions-item label="归还位置" :span="2">{{ getReturnedLocationText(detailDialog.data) }}</el-descriptions-item>
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
import { listItemInstance, getItemInstanceByCode } from '@/api/wms/itemInstance';

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const { wms_borrow_status, wms_item_instance_status, wms_overdue_flag } = proxy.useDict(
  'wms_borrow_status',
  'wms_item_instance_status',
  'wms_overdue_flag'
);

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
  instanceCode: undefined,
  borrowStatus: undefined,
  borrower: undefined,
  fromUnit: undefined,
  toUnit: undefined,
  overdueFlag: undefined
});

const borrowDialog = reactive({
  visible: false,
  form: {
    instanceCode: undefined,
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
    instanceCode: undefined,
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
  instanceCode: [
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


const padDateValue = (value) => String(value).padStart(2, '0');

const formatCurrentDateTime = (date = new Date()) => {
  const year = date.getFullYear();
  const month = padDateValue(date.getMonth() + 1);
  const day = padDateValue(date.getDate());
  const hour = padDateValue(date.getHours());
  const minute = padDateValue(date.getMinutes());
  const second = padDateValue(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const parseDateTimeValue = (value) => {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date(String(value).replace(' ', 'T'));
};

const isSameDate = (left, right) => left.getFullYear() === right.getFullYear()
  && left.getMonth() === right.getMonth()
  && left.getDate() === right.getDate();

const createDisabledTimeRange = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

const disableFutureReturnDate = (date) => date.getTime() > Date.now();

const getDisabledReturnHours = () => {
  const selected = parseDateTimeValue(returnDialog.form.returnTime);
  const now = new Date();
  if (!selected || !isSameDate(selected, now)) {
    return [];
  }
  return createDisabledTimeRange(now.getHours() + 1, 23);
};

const getDisabledReturnMinutes = (selectedHour) => {
  const selected = parseDateTimeValue(returnDialog.form.returnTime);
  const now = new Date();
  if (!selected || !isSameDate(selected, now) || selectedHour !== now.getHours()) {
    return [];
  }
  return createDisabledTimeRange(now.getMinutes() + 1, 59);
};

const getDisabledReturnSeconds = (selectedHour, selectedMinute) => {
  const selected = parseDateTimeValue(returnDialog.form.returnTime);
  const now = new Date();
  if (!selected
    || !isSameDate(selected, now)
    || selectedHour !== now.getHours()
    || selectedMinute !== now.getMinutes()) {
    return [];
  }
  return createDisabledTimeRange(now.getSeconds() + 1, 59);
};

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
  borrowDialog.instanceOptions = (res.rows || []).filter(
    item => item.instanceStatus === '在库' && !item.shipmentOrderDetailId && !item.movementOrderDetailId
  );
};

const loadReturnableInstances = async () => {
  const res = await listItemInstance({
    pageNum: 1,
    pageSize: 200,
    instanceStatus: '借出'
  });
  returnDialog.instanceOptions = (res.rows || []).filter(item => item.instanceStatus === '借出');
};

const loadQueryInstances = async () => {
  const res = await listItemInstance({
    pageNum: 1,
    pageSize: 200
  });
  instanceOptions.value = res.rows;
};

const applyRouteQuery = () => {
  const { instanceCode, borrowStatus, overdueFlag } = route.query;
  queryParams.instanceCode = instanceCode || undefined;
  queryParams.borrowStatus = borrowStatus || undefined;
  queryParams.overdueFlag = overdueFlag;
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
  queryParams.pageNum = 1;
  await getList();
};

const resetQuery = async () => {
  proxy.resetForm('queryRef');
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.instanceCode = undefined;
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
    instanceCode: row?.instanceCode,
    borrowStatus: 'borrowed',
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
  if (borrowDialog.form.instanceCode) {
    await handleBorrowInstanceChange(borrowDialog.form.instanceCode);
  }
};

const handleBorrowInstanceChange = async (instanceCode) => {
  if (!instanceCode) {
    borrowDialog.currentItem = {};
    return;
  }
  const res = await getItemInstanceByCode(instanceCode);
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
    id: row?.borrowStatus === 'borrowed' ? row?.id : undefined,
    instanceCode: row?.instanceCode,
    returnTime: formatCurrentDateTime(),
    returnRemark: undefined
  };
  returnDialog.currentRecord = {};
  await loadReturnableInstances();
  if (row?.id && row?.borrowStatus === 'borrowed') {
    const res = await getBorrowRecord(row.id);
    returnDialog.currentRecord = res.data || {};
    returnDialog.form.id = res.data?.id;
    returnDialog.form.instanceCode = res.data?.instanceCode;
  } else if (returnDialog.form.instanceCode) {
    await handleReturnInstanceChange(returnDialog.form.instanceCode);
  }
};

const handleReturnInstanceChange = async (instanceCode) => {
  if (!instanceCode) {
    returnDialog.currentRecord = {};
    returnDialog.form.id = undefined;
    returnDialog.form.instanceCode = undefined;
    return;
  }
  try {
    const itemRes = await getItemInstanceByCode(instanceCode);
    if (!itemRes.data?.instanceCode) {
      throw new Error('item_instance_not_found');
    }
    returnDialog.form.instanceCode = itemRes.data.instanceCode;
    const res = await getCurrentBorrowRecord(instanceCode);
    returnDialog.currentRecord = res.data || {};
    returnDialog.form.id = res.data?.id;
  } catch (e) {
    returnDialog.currentRecord = {};
    returnDialog.form.id = undefined;
    returnDialog.form.instanceCode = undefined;
    ElMessage.error('未找到对应器材实例编码');
  }
};

const submitReturn = async () => {
  if (!returnDialog.form.instanceCode) {
    proxy.$modal.msgError('请选择待归还的器材实例编码');
    return;
  }
  if (!returnDialog.form.id) {
    proxy.$modal.msgError('当前器材实例不存在未归还借用记录');
    return;
  }
  const selectedReturnTime = parseDateTimeValue(returnDialog.form.returnTime);
  if (selectedReturnTime && selectedReturnTime.getTime() > Date.now()) {
    proxy.$modal.msgError('归还时间不得超过当前时间');
    return;
  }
  buttonLoading.value = true;
  try {
    await returnBorrowItem({
      id: returnDialog.form.id,
      returnTime: returnDialog.form.returnTime,
      returnRemark: returnDialog.form.returnRemark
    });
    proxy.$modal.msgSuccess('归还登记成功');
    returnDialog.visible = false;
    await router.replace({ path: route.path, query: {} });
    await Promise.all([resetQuery(), loadQueryInstances(), loadWarningStats()]);
  } finally {
    buttonLoading.value = false;
  }
};

const openDetailById = async (id) => {
  if (!id) {
    return;
  }
  const res = await getBorrowRecord(id);
  detailDialog.data = res.data || {};
  detailDialog.visible = true;
};

const handleView = async (row) => {
  await openDetailById(row.id);
};

onMounted(async () => {
  applyRouteQuery();
  await Promise.all([
    loadQueryInstances(),
    loadBorrowableInstances(),
    loadReturnableInstances(),
    loadWarningStats()
  ]);
  if (queryParams.instanceCode && queryParams.borrowStatus === 'borrowed') {
    await handleReturn({ instanceCode: queryParams.instanceCode });
  } else if (queryParams.instanceCode && queryParams.borrowStatus === 'borrowed') {
    await handleReturn({ instanceCode: queryParams.instanceCode });
  } else if (queryParams.instanceCode) {
    await handleBorrow({ id: queryParams.instanceCode });
  }
  if (queryParams.instanceCode) {
    await handleInstanceCodeQuery();
  } else {
    await getList();
  }
  if (route.query.id) {
    await openDetailById(Number(route.query.id));
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

.return-record-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border: 1px solid var(--el-border-color-lighter);
}

.return-record-item {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
}

.return-record-item:nth-child(odd) {
  border-right: 1px solid var(--el-border-color-lighter);
}

.return-record-item:not(:nth-last-child(-n + 2)) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.return-record-label {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  font-weight: 600;
  line-height: 20px;
  word-break: keep-all;
  white-space: nowrap;
  border-right: 1px solid var(--el-border-color-lighter);
}

.return-record-value {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 12px 14px;
  line-height: 24px;
  word-break: break-all;
}

.return-record-value-wrap {
  white-space: normal;
  word-break: break-all;
}

.borrow-detail-descriptions :deep(.el-descriptions__table) {
  table-layout: fixed;
}

.borrow-detail-descriptions :deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
  width: 112px;
  white-space: nowrap;
  word-break: keep-all;
  vertical-align: top;
}

.borrow-detail-descriptions :deep(.el-descriptions__content.el-descriptions__cell.is-bordered-content) {
  white-space: normal;
  word-break: break-all;
  line-height: 24px;
  vertical-align: top;
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

.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.table-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.borrow-table :deep(.el-table__cell) {
  padding: 10px 0;
}

.borrow-table :deep(.cell) {
  overflow-wrap: anywhere;
}
</style>
