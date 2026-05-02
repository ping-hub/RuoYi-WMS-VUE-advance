<template>
  <div class="app-container">
    <el-card>
      <el-form :inline="true" label-width="88px">
        <el-form-item :label="isItemMode ? '单品码' : '箱码'">
          <el-input
            v-model="code"
            :placeholder="isItemMode ? '请输入单品码' : '请输入箱码'"
            clearable
            style="width: 320px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <template v-if="isItemMode">
      <el-card class="mt20" v-loading="loading">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">单品追踪结果</span>
            <el-button v-if="itemTrace.itemInstance?.id" link type="primary" @click="goItemInstance(itemTrace.itemInstance.instanceCode)">查看单品实例</el-button>
          </div>
        </template>

        <el-empty v-if="!itemTrace.itemInstance && !loading" description="请输入单品码进行查询" />

        <template v-else-if="itemTrace.itemInstance">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="单品码">{{ itemTrace.itemInstance.instanceCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <dict-tag :options="wms_item_instance_status" :value="itemTrace.itemInstance.instanceStatus" />
            </el-descriptions-item>
            <el-descriptions-item label="商品">{{ itemTrace.itemInstance.itemName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="规格">{{ itemTrace.itemInstance.skuName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="当前位置" :span="2">{{ getItemLocation(itemTrace.itemInstance) }}</el-descriptions-item>
            <el-descriptions-item label="在箱状态">{{ itemTrace.itemInstance.inBox === 1 ? '在箱' : '不在箱' }}</el-descriptions-item>
            <el-descriptions-item label="借出状态">{{ itemTrace.itemInstance.borrowed === 1 ? '已借出' : '未借出' }}</el-descriptions-item>
            <el-descriptions-item label="当前箱体" :span="2">
              <span v-if="itemTrace.currentBox?.boxCode">
                {{ itemTrace.currentBox.boxCode }}
                <el-button link type="primary" @click="goBoxTrace(itemTrace.currentBox.boxCode)">查看箱码追踪</el-button>
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </el-card>

      <el-card class="mt20" v-if="itemTrace.currentBorrowRecord">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">当前借用记录</span>
            <el-button link type="primary" @click="goBorrowRecord(itemTrace.itemInstance?.id, 'borrowed')">查看借还管理</el-button>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="借用人">{{ itemTrace.currentBorrowRecord.borrower || '-' }}</el-descriptions-item>
          <el-descriptions-item label="借用时间">{{ itemTrace.currentBorrowRecord.borrowTime ? parseTime(itemTrace.currentBorrowRecord.borrowTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</el-descriptions-item>
          <el-descriptions-item label="原位置" :span="2">{{ getBorrowLocation(itemTrace.currentBorrowRecord) }}</el-descriptions-item>
          <el-descriptions-item label="借用备注" :span="2">{{ itemTrace.currentBorrowRecord.borrowRemark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="mt20" v-if="itemTrace.borrowRecords?.length">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">借还历史</span>
          </div>
        </template>
        <el-table :data="itemTrace.borrowRecords" border empty-text="暂无借还历史">
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <dict-tag :options="wms_borrow_status" :value="row.borrowStatus" />
            </template>
          </el-table-column>
          <el-table-column label="借用人" prop="borrower" min-width="120" />
          <el-table-column label="借用时间" min-width="180">
            <template #default="{ row }">
              {{ row.borrowTime ? parseTime(row.borrowTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="归还时间" min-width="180">
            <template #default="{ row }">
              {{ row.returnTime ? parseTime(row.returnTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="goBorrowRecord(row.itemInstanceId, row.borrowStatus)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="mt20" v-if="itemTrace.shipmentDetails?.length">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">出库记录</span>
          </div>
        </template>
        <el-table :data="itemTrace.shipmentDetails" border empty-text="暂无出库记录">
          <el-table-column label="出库单ID" prop="shipmentOrderId" width="120" />
          <el-table-column label="规格" min-width="180">
            <template #default="{ row }">
              {{ row.itemSku?.skuName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="单品码" prop="instanceCode" min-width="160" />
          <el-table-column label="箱码" prop="boxCode" min-width="140" />
          <el-table-column label="数量" prop="quantity" width="80" align="right" />
          <el-table-column label="批号" prop="batchNo" min-width="120" />
          <el-table-column label="生产/过期" min-width="220">
            <template #default="{ row }">
              <div v-if="row.productionDate">生产：{{ parseTime(row.productionDate, '{y}-{m}-{d}') }}</div>
              <div v-if="row.expirationDate">过期：{{ parseTime(row.expirationDate, '{y}-{m}-{d}') }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <template v-else>
      <el-card class="mt20" v-loading="loading">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">箱码追踪结果</span>
            <el-button v-if="boxTrace.box?.id" link type="primary" @click="goBoxManage(boxTrace.box.boxCode)">查看箱体管理</el-button>
          </div>
        </template>

        <el-empty v-if="!boxTrace.box && !loading" description="请输入箱码进行查询" />

        <template v-else-if="boxTrace.box">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="箱码">{{ boxTrace.box.boxCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="箱体状态">
              <dict-tag :options="wms_box_status" :value="boxTrace.box.boxStatus" />
            </el-descriptions-item>
            <el-descriptions-item label="箱体名称">{{ boxTrace.box.boxName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="箱内数量">{{ boxTrace.box.itemCount || 0 }}</el-descriptions-item>
            <el-descriptions-item label="当前位置" :span="2">{{ getBoxLocation(boxTrace.box) }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ boxTrace.box.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </el-card>

      <el-card class="mt20" v-if="boxTrace.box?.items?.length">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">箱内单品</span>
          </div>
        </template>
        <el-table :data="boxTrace.box.items" border empty-text="箱内暂无单品">
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
          <el-table-column label="操作" width="120" align="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="goItemTrace(row.instanceCode)">追踪单品</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="mt20" v-if="boxTrace.shipmentDetails?.length">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">整箱出库记录</span>
          </div>
        </template>
        <el-table :data="boxTrace.shipmentDetails" border empty-text="暂无出库记录">
          <el-table-column label="出库单ID" prop="shipmentOrderId" width="120" />
          <el-table-column label="规格" min-width="180">
            <template #default="{ row }">
              {{ row.itemSku?.skuName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="箱码" prop="boxCode" min-width="140" />
          <el-table-column label="数量" prop="quantity" width="80" align="right" />
          <el-table-column label="批号" prop="batchNo" min-width="120" />
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script setup name="TracePage">
import { getCurrentInstance, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBoxTrace, getItemTrace } from '@/api/wms/trace';

const props = defineProps({
  mode: {
    type: String,
    default: 'item'
  }
});

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();
const { wms_item_instance_status, wms_box_status, wms_borrow_status } = proxy.useDict(
  'wms_item_instance_status',
  'wms_box_status',
  'wms_borrow_status'
);

const isItemMode = props.mode === 'item';
const loading = ref(false);
const code = ref('');
const itemTrace = reactive({
  itemInstance: null,
  currentBox: null,
  currentBorrowRecord: null,
  borrowRecords: [],
  shipmentDetails: []
});
const boxTrace = reactive({
  box: null,
  shipmentDetails: []
});

const resetData = () => {
  itemTrace.itemInstance = null;
  itemTrace.currentBox = null;
  itemTrace.currentBorrowRecord = null;
  itemTrace.borrowRecords = [];
  itemTrace.shipmentDetails = [];
  boxTrace.box = null;
  boxTrace.shipmentDetails = [];
};

const getItemLocation = (item) => {
  const parts = [];
  if (item.warehouseName) parts.push('仓库：' + item.warehouseName);
  if (item.areaName) parts.push('库区：' + item.areaName);
  if (item.rackName) parts.push('货架：' + item.rackName);
  if (item.locationName) parts.push('货位：' + item.locationName);
  return parts.length ? parts.join(' / ') : '-';
};

const getBoxLocation = (box) => {
  const parts = [];
  if (box.warehouseName) parts.push('仓库：' + box.warehouseName);
  if (box.areaName) parts.push('库区：' + box.areaName);
  if (box.rackName) parts.push('货架：' + box.rackName);
  if (box.locationName) parts.push('货位：' + box.locationName);
  return parts.length ? parts.join(' / ') : '-';
};

const getBorrowLocation = (row) => {
  const parts = [];
  if (row.originalWarehouseName) parts.push('仓库：' + row.originalWarehouseName);
  if (row.originalAreaName) parts.push('库区：' + row.originalAreaName);
  if (row.originalRackName) parts.push('货架：' + row.originalRackName);
  if (row.originalLocationName) parts.push('货位：' + row.originalLocationName);
  return parts.length ? parts.join(' / ') : '-';
};

const handleQuery = async () => {
  if (!code.value) {
    proxy.$modal.msgError(isItemMode ? '请输入单品码' : '请输入箱码');
    return;
  }
  resetData();
  loading.value = true;
  try {
    if (isItemMode) {
      const res = await getItemTrace(code.value);
      Object.assign(itemTrace, {
        itemInstance: res.data?.itemInstance || null,
        currentBox: res.data?.currentBox || null,
        currentBorrowRecord: res.data?.currentBorrowRecord || null,
        borrowRecords: res.data?.borrowRecords || [],
        shipmentDetails: res.data?.shipmentDetails || []
      });
    } else {
      const res = await getBoxTrace(code.value);
      Object.assign(boxTrace, {
        box: res.data?.box || null,
        shipmentDetails: res.data?.shipmentDetails || []
      });
    }
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  code.value = '';
  resetData();
};

const syncCodeFromRoute = async () => {
  const routeCode = isItemMode ? route.query.instanceCode : route.query.boxCode;
  code.value = routeCode || '';
  if (code.value) {
    await handleQuery();
  } else {
    resetData();
  }
};

const goItemTrace = (instanceCode) => {
  router.push({ path: '/wms-trace-item/index', query: { instanceCode } });
};

const goBoxTrace = (boxCode) => {
  router.push({ path: '/wms-trace-box/index', query: { boxCode } });
};

const goBorrowRecord = (itemInstanceId, borrowStatus) => {
  router.push({ path: '/wms-borrow-record/index', query: { itemInstanceId, borrowStatus } });
};

const goItemInstance = (instanceCode) => {
  router.push({ path: '/wms-item-instance/index', query: { instanceCode } });
};

const goBoxManage = (boxCode) => {
  router.push({ path: '/wms-box/index', query: { boxCode } });
};

watch(
  () => route.query,
  async () => {
    await syncCodeFromRoute();
  },
  { immediate: true }
);
</script>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 16px;
  line-height: 16px;
}

.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
