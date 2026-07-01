<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" label-width="88px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="借用状态" prop="borrowOrderStatus">
              <el-select v-model="queryParams.borrowOrderStatus" placeholder="请选择借用状态" clearable style="width: 100%" @change="handleQuery">
                <el-option v-for="item in wms_borrow_order_status" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="借用单号" prop="borrowOrderNo">
              <el-input v-model="queryParams.borrowOrderNo" placeholder="请输入借用单号" clearable @keyup.enter="handleQuery" />
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
        <div class="stats-label">预警</div>
        <div class="stats-value">{{ warningStats.warningCount }}</div>
      </el-card>
      <el-card class="stats-card overdue-card">
        <div class="stats-label">超时</div>
        <div class="stats-value">{{ warningStats.overdueCount }}</div>
      </el-card>
    </div>

    <el-card class="mt20">
      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">器材借用单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:borrowOrder:list']"
          >新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="borrowOrderList" border class="mt20" empty-text="暂无借用单">
        <el-table-column label="借用单号" align="left" min-width="120">
          <template #default="{ row }">
            <div>{{ row.borrowOrderNo }}</div>
          </template>
        </el-table-column>
        <el-table-column label="借用状态" align="center" min-width="80">
          <template #default="{ row }">
            <dict-tag :options="wms_borrow_order_status" :value="row.borrowOrderStatus" />
          </template>
        </el-table-column>
        <el-table-column label="预警" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.warningFlag === 2" type="danger">超期{{ row.overdueDays || 0 }}天</el-tag>
            <el-tag v-else-if="row.warningFlag === 1" type="warning">预警</el-tag>
            <el-tag v-else-if="row.borrowOrderStatus === 1" type="success">正常</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="借用人" prop="borrower" min-width="80" show-overflow-tooltip />
        <el-table-column label="借用时间" min-width="95">
          <template #default="{ row }">
            {{ row.borrowTime ? parseTime(row.borrowTime, '{y}-{m}-{d}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="计划归还" min-width="95">
          <template #default="{ row }">
            {{ row.planReturnDate ? parseTime(row.planReturnDate, '{y}-{m}-{d}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="数量" align="left" min-width="60">
          <template #default="{ row }">
            {{ row.totalQuantity || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="80" show-overflow-tooltip />
        <el-table-column label="提交人" min-width="70" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getNickNameByUserName(row.createBy) }}
          </template>
        </el-table-column>
        <el-table-column label="提交日期" min-width="100">
          <template #default="{ row }">
            {{ row.createTime ? parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="200">
          <template #default="scope">
            <el-button link type="primary" @click="handleView(scope.row)" v-hasPermi="['wms:borrowOrder:list']">查看</el-button>
            <el-popover placement="left" title="提示" :width="300" trigger="hover" :disabled="canEdit(scope.row)" :content="getDisabledTip(scope.row)">
              <template #reference>
                <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['wms:borrowOrder:list']" :disabled="!canEdit(scope.row)">修改</el-button>
              </template>
            </el-popover>
            <el-popover placement="left" title="提示" :width="300" trigger="hover" :disabled="canReturn(scope.row)" :content="getDisabledTip(scope.row)">
              <template #reference>
                <el-button link type="success" @click="handleReturn(scope.row)" v-hasPermi="['wms:borrowOrder:list']" :disabled="!canReturn(scope.row)">归还</el-button>
              </template>
            </el-popover>
            <el-popover placement="left" title="提示" :width="300" trigger="hover" :disabled="canDelete(scope.row)" :content="getDisabledTip(scope.row)">
              <template #reference>
                <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:borrowOrder:list']" :disabled="!canDelete(scope.row)">删除</el-button>
              </template>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </el-row>
    </el-card>
  </div>
</template>

<script setup name="BorrowOrder">
import { getCurrentInstance, reactive, ref, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  listBorrowOrder,
  delBorrowOrder,
  getBorrowOrderWarningStats
} from '@/api/wms/borrowOrder';
import { getUserSelectList } from '@/api/wms/common';
import { resolveRoutePath } from '@/utils/routeResolver';

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const { wms_borrow_order_status } = proxy.useDict('wms_borrow_order_status');

const userList = ref([]);
const getNickNameByUserName = (userName) => {
  if (!userName) return '-';
  const u = userList.value.find(x => x.userName === userName);
  return u ? u.nickName : userName;
};

const borrowOrderList = ref([]);
const loading = ref(true);
const total = ref(0);
const warningStats = reactive({
  borrowingCount: 0,
  warningCount: 0,
  overdueCount: 0
});

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    borrowOrderNo: undefined,
    borrower: undefined,
    fromUnit: undefined,
    toUnit: undefined,
    borrowOrderStatus: undefined
  }
});
const { queryParams } = toRefs(data);

function getList() {
  loading.value = true;
  const query = { ...queryParams.value };
  Object.keys(query).forEach(key => {
    if (query[key] === '' || query[key] === null || typeof query[key] === 'undefined') {
      delete query[key];
    }
  });
  listBorrowOrder(query).then(response => {
    borrowOrderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

const loadWarningStats = async () => {
  const res = await getBorrowOrderWarningStats();
  warningStats.borrowingCount = Number(res.data?.borrowingCount || 0);
  warningStats.warningCount = Number(res.data?.warningCount || 0);
  warningStats.overdueCount = Number(res.data?.overdueCount || 0);
};

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  proxy.resetForm('queryRef');
  handleQuery();
}

const resolveBorrowOrderEditPath = () => resolveRoutePath(router, {
  preferredPaths: ['/borrowOrderEdit'],
  titleKeywords: ['借用单']
}) || '/borrowOrderEdit';

function handleAdd() {
  router.push({ path: resolveBorrowOrderEditPath(), query: { returnFullPath: route.fullPath } });
}

function handleUpdate(row) {
  router.push({ path: resolveBorrowOrderEditPath(), query: { id: row.id, returnFullPath: route.fullPath } });
}

function handleView(row) {
  router.push({ path: resolveBorrowOrderEditPath(), query: { id: row.id, mode: 'view', returnFullPath: route.fullPath } });
}

function canEdit(row) {
  return Number(row.borrowOrderStatus) === 0;
}

function canReturn(row) {
  return Number(row.borrowOrderStatus) === 1;
}

function canDelete(row) {
  return Number(row.borrowOrderStatus) === 0;
}

function getDisabledTip(row) {
  const statusMap = { 0: '暂存', 2: '已归还', '-1': '已作废' };
  const label = statusMap[row.borrowOrderStatus] || '未知状态';
  return '借用单【' + row.borrowOrderNo + '】' + label + '，无法操作！';
}

function handleReturn(row) {
  router.push({ path: resolveBorrowOrderEditPath(), query: { id: row.id, returnFullPath: route.fullPath } });
}

function handleDelete(row) {
  proxy.$modal.confirm('确认删除借用单【' + row.borrowOrderNo + '】吗？').then(() => {
    loading.value = true;
    return delBorrowOrder(row.id);
  }).then(() => {
    loading.value = true;
    getList();
    proxy.$modal.msgSuccess('删除成功');
  }).finally(() => {
    loading.value = false;
  });
}

getUserSelectList().then(res => {
  userList.value = res.data || [];
});
getList();
loadWarningStats();
</script>

<style lang="scss">
.el-statistic__content {
  font-size: 14px;
}
.el-table .vertical-top-cell {
  vertical-align: top;
}
.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
  color: var(--el-color-warning);
}

.overdue-card .stats-value {
  color: var(--el-color-danger);
}
</style>
