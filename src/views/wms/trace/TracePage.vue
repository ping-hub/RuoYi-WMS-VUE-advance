<template>
  <div class="app-container">
    <el-card>
      <el-form :inline="true" label-width="88px">
        <el-form-item :label="isItemMode ? '物品码' : '箱码'">
          <el-input
            v-model="code"
            :placeholder="isItemMode ? '请输入物品码' : '请输入箱码'"
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
            <span class="panel-title">物品码追踪结果</span>
            <el-button v-if="itemTrace.itemInstance?.id" link type="primary" @click="goItemInstance(itemTrace.itemInstance.instanceCode)">查看物品明细</el-button>
          </div>
        </template>

        <el-empty v-if="!itemTrace.itemInstance && !loading" description="请输入物品码进行查询" />

        <template v-else-if="itemTrace.itemInstance">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="物品码">{{ itemTrace.itemInstance.instanceCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <dict-tag :options="wms_item_instance_status" :value="itemTrace.itemInstance.instanceStatus" />
            </el-descriptions-item>
            <el-descriptions-item label="器材">{{ itemTrace.itemInstance.itemName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="器材规格">{{ itemTrace.itemInstance.skuName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="产品标识">{{ displayProductMark(itemTrace.itemInstance) }}</el-descriptions-item>
            <el-descriptions-item label="质量等级">{{ displayQualityGrade(itemTrace.itemInstance) }}</el-descriptions-item>
            <el-descriptions-item label="所在单位">{{ displayBelongUnit(itemTrace.itemInstance) }}</el-descriptions-item>
            <el-descriptions-item label="来源单号">{{ itemTrace.itemInstance.sourceOrderNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="当前位置" :span="2">{{ getItemLocation(itemTrace.itemInstance) }}</el-descriptions-item>
            <el-descriptions-item label="在箱状态">{{ itemTrace.itemInstance.inBox === 1 ? '在箱' : '不在箱' }}</el-descriptions-item>
            <el-descriptions-item label="借出状态">{{ itemTrace.itemInstance.borrowed === 1 ? '已借出' : '未借出' }}</el-descriptions-item>
            <el-descriptions-item label="当前箱体" :span="2">
              <span v-if="itemTrace.currentBox?.boxCode">
                {{ itemTrace.currentBox.boxCode }}{{ itemTrace.currentBox.boxName ? ' / ' + itemTrace.currentBox.boxName : '' }}
                <dict-tag class="ml8" :options="wms_box_status" :value="itemTrace.currentBox.boxStatus" />
                <el-button link type="primary" @click="goBoxTrace(itemTrace.currentBox.boxCode)">查看箱码追踪</el-button>
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </el-card>

      <el-card class="mt20" v-if="itemTrace.currentLocation">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">当前位置对象</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="货位">{{ itemTrace.currentLocation.locationName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="货位编码">{{ itemTrace.currentLocation.locationCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="仓库/库区">
            {{ [itemTrace.currentLocation.warehouseName, itemTrace.currentLocation.areaName].filter(Boolean).join(' / ') || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="货架">{{ itemTrace.currentLocation.rackName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="直存器材数">{{ itemTrace.currentLocation.directItemCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="箱体数">{{ itemTrace.currentLocation.boxCount || 0 }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="mt20" v-if="itemTrace.currentBorrowRecord">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">当前借用记录</span>
            <el-button link type="primary" @click="goBorrowRecord(itemTrace.itemInstance?.id, 'borrowed')">查看借用记录</el-button>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="借用人">{{ itemTrace.currentBorrowRecord.borrower || '-' }}</el-descriptions-item>
          <el-descriptions-item label="借用时间">{{ itemTrace.currentBorrowRecord.borrowTime ? parseTime(itemTrace.currentBorrowRecord.borrowTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</el-descriptions-item>
          <el-descriptions-item label="发货单位">{{ itemTrace.currentBorrowRecord.fromUnit || '-' }}</el-descriptions-item>
          <el-descriptions-item label="收货单位">{{ itemTrace.currentBorrowRecord.toUnit || '-' }}</el-descriptions-item>
          <el-descriptions-item label="产品标识">{{ displayProductMark(itemTrace.currentBorrowRecord) }}</el-descriptions-item>
          <el-descriptions-item label="质量等级">{{ displayQualityGrade(itemTrace.currentBorrowRecord) }}</el-descriptions-item>
          <el-descriptions-item label="原位置" :span="2">{{ getBorrowLocation(itemTrace.currentBorrowRecord) }}</el-descriptions-item>
          <el-descriptions-item label="借用备注" :span="2">{{ itemTrace.currentBorrowRecord.borrowRemark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="mt20" v-if="itemTrace.borrowRecords?.length">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">借用历史</span>
          </div>
        </template>
        <el-table :data="itemTrace.borrowRecords" border empty-text="暂无借用历史">
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <dict-tag :options="wms_borrow_status" :value="row.borrowStatus" />
            </template>
          </el-table-column>
          <el-table-column label="借用单号" prop="borrowNo" min-width="140" />
          <el-table-column label="借用人" prop="borrower" min-width="120" />
          <el-table-column label="单位/标识" min-width="220">
            <template #default="{ row }">
              <div>{{ row.fromUnit || '-' }} -> {{ row.toUnit || '-' }}</div>
              <div class="sub-text">产品标识：{{ displayProductMark(row) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="借用时间" min-width="180">
            <template #default="{ row }">
              {{ row.borrowTime ? parseTime(row.borrowTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="计划归还" min-width="120">
            <template #default="{ row }">
              {{ row.planReturnDate ? parseTime(row.planReturnDate, '{y}-{m}-{d}') : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="归还时间" min-width="180">
            <template #default="{ row }">
              {{ row.returnTime ? parseTime(row.returnTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="预警" width="120" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.overdueFlag === 1" type="danger">超期{{ row.overdueDays || 0 }}天</el-tag>
              <el-tag v-else type="success">正常</el-tag>
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
          <el-table-column label="器材规格" min-width="180">
            <template #default="{ row }">
              {{ row.itemSku?.skuName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="产品标识/质量等级" min-width="180">
            <template #default="{ row }">
              <div>{{ displayProductMark(row) }}</div>
              <div class="sub-text">{{ displayQualityGrade(row) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="物品码" prop="instanceCode" min-width="160" />
          <el-table-column label="箱码" prop="boxCode" min-width="140" />
          <el-table-column label="数量" prop="quantity" width="80" align="right" />
          <el-table-column label="批号" min-width="120">
            <template #default="{ row }">
              {{ displayBatchNo(row) }}
            </template>
          </el-table-column>
          <el-table-column label="生产/过期" min-width="220">
            <template #default="{ row }">
              <div v-if="resolveDateValue(row, 'productionDate')">生产：{{ parseTime(resolveDateValue(row, 'productionDate'), '{y}-{m}-{d}') }}</div>
              <div v-if="resolveDateValue(row, 'expirationDate')">过期：{{ parseTime(resolveDateValue(row, 'expirationDate'), '{y}-{m}-{d}') }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="goShipmentOrder(row.shipmentOrderId)">查看单据</el-button>
              <el-button v-if="row.boxCode" link type="primary" @click="goBoxTrace(row.boxCode)">箱码</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="mt20" v-if="itemTrace.movementDetails?.length">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">调拨记录</span>
          </div>
        </template>
        <el-table :data="itemTrace.movementDetails" border empty-text="暂无调拨记录">
          <el-table-column label="调拨单ID" prop="movementOrderId" width="120" />
          <el-table-column label="产品标识/质量等级" min-width="180">
            <template #default="{ row }">
              <div>{{ displayProductMark(row) }}</div>
              <div class="sub-text">{{ displayQualityGrade(row) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="源位置/目标位置" min-width="260">
            <template #default="{ row }">
              <div>源：{{ formatLocationPath(row, 'source') }}</div>
              <div class="sub-text">目标：{{ formatLocationPath(row, 'target') }}</div>
            </template>
          </el-table-column>
          <el-table-column label="物品码" prop="instanceCode" min-width="160" />
          <el-table-column label="箱码" prop="boxCode" min-width="140" />
          <el-table-column label="数量" prop="quantity" width="80" align="right" />
          <el-table-column label="操作" width="150" align="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="goMovementOrder(row.movementOrderId)">查看单据</el-button>
              <el-button v-if="row.boxCode" link type="primary" @click="goBoxTrace(row.boxCode)">箱码</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="mt20" v-if="itemTrace.inventoryHistories?.length">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">库存流水</span>
          </div>
        </template>
        <el-table :data="itemTrace.inventoryHistories" border empty-text="暂无库存流水">
          <el-table-column label="操作单号" prop="orderNo" min-width="160" />
          <el-table-column label="业务动作" prop="operationType" min-width="120" />
          <el-table-column label="位置" min-width="220">
            <template #default="{ row }">
              {{ formatInventoryLocation(row) }}
            </template>
          </el-table-column>
          <el-table-column label="变化数量" prop="quantity" width="100" align="right" />
          <el-table-column label="前后数量" min-width="180">
            <template #default="{ row }">
              <div>前：{{ row.beforeQuantity ?? '-' }}</div>
              <div class="sub-text">后：{{ row.afterQuantity ?? '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作人/时间" min-width="220">
            <template #default="{ row }">
              <div>{{ row.operatorName || '-' }}</div>
              <div class="sub-text">{{ row.createTime ? parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip />
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
            <el-descriptions-item label="当前装箱数">{{ boxTrace.box.itemCount || 0 }}</el-descriptions-item>
            <el-descriptions-item label="当前位置" :span="2">{{ getBoxLocation(boxTrace.box) }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ boxTrace.box.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </el-card>

      <el-card class="mt20" v-if="boxTrace.currentLocation">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">当前位置对象</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="货位">{{ boxTrace.currentLocation.locationName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="货位编码">{{ boxTrace.currentLocation.locationCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="仓库/库区">
            {{ [boxTrace.currentLocation.warehouseName, boxTrace.currentLocation.areaName].filter(Boolean).join(' / ') || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="货架">{{ boxTrace.currentLocation.rackName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="直存器材数">{{ boxTrace.currentLocation.directItemCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="箱体数">{{ boxTrace.currentLocation.boxCount || 0 }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="mt20" v-if="boxTrace.box?.items?.length">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">当前装箱关系</span>
          </div>
        </template>
        <el-table :data="boxTrace.box.items" border empty-text="箱内暂无物品">
          <el-table-column label="物品码" prop="instanceCode" min-width="180" />
          <el-table-column label="器材/器材规格" min-width="220">
            <template #default="{ row }">
              <div>{{ row.itemName || '-' }}</div>
              <div v-if="row.skuName" class="sub-text">器材规格：{{ row.skuName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="产品标识/所在单位" min-width="220">
            <template #default="{ row }">
              <div>{{ displayProductMark(row) }}</div>
              <div class="sub-text">{{ displayBelongUnit(row) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <dict-tag :options="wms_item_instance_status" :value="row.instanceStatus" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="goItemTrace(row.instanceCode)">追踪明细</el-button>
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
          <el-table-column label="器材规格" min-width="180">
            <template #default="{ row }">
              {{ row.itemSku?.skuName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="产品标识/质量等级" min-width="180">
            <template #default="{ row }">
              <div>{{ displayProductMark(row) }}</div>
              <div class="sub-text">{{ displayQualityGrade(row) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="箱码" prop="boxCode" min-width="140" />
          <el-table-column label="数量" prop="quantity" width="80" align="right" />
          <el-table-column label="批号" min-width="120">
            <template #default="{ row }">
              {{ displayBatchNo(row) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="goShipmentOrder(row.shipmentOrderId)">查看单据</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="mt20" v-if="boxTrace.movementDetails?.length">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">整箱调拨记录</span>
          </div>
        </template>
        <el-table :data="boxTrace.movementDetails" border empty-text="暂无调拨记录">
          <el-table-column label="调拨单ID" prop="movementOrderId" width="120" />
          <el-table-column label="箱码" prop="boxCode" min-width="140" />
          <el-table-column label="数量" prop="quantity" width="80" align="right" />
          <el-table-column label="产品标识/质量等级" min-width="180">
            <template #default="{ row }">
              <div>{{ displayProductMark(row) }}</div>
              <div class="sub-text">{{ displayQualityGrade(row) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="源位置/目标位置" min-width="260">
            <template #default="{ row }">
              <div>源：{{ formatLocationPath(row, 'source') }}</div>
              <div class="sub-text">目标：{{ formatLocationPath(row, 'target') }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="goMovementOrder(row.movementOrderId)">查看单据</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="mt20" v-if="boxTrace.inventoryHistories?.length">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">库存流水</span>
          </div>
        </template>
        <el-table :data="boxTrace.inventoryHistories" border empty-text="暂无库存流水">
          <el-table-column label="操作单号" prop="orderNo" min-width="160" />
          <el-table-column label="业务动作" prop="operationType" min-width="120" />
          <el-table-column label="位置" min-width="220">
            <template #default="{ row }">
              {{ formatInventoryLocation(row) }}
            </template>
          </el-table-column>
          <el-table-column label="变化数量" prop="quantity" width="100" align="right" />
          <el-table-column label="前后数量" min-width="180">
            <template #default="{ row }">
              <div>前：{{ row.beforeQuantity ?? '-' }}</div>
              <div class="sub-text">后：{{ row.afterQuantity ?? '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作人/时间" min-width="220">
            <template #default="{ row }">
              <div>{{ row.operatorName || '-' }}</div>
              <div class="sub-text">{{ row.createTime ? parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip />
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script setup name="TracePage">
import { getCurrentInstance, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBoxTrace, getItemTrace } from '@/api/wms/trace';
import { resolveRoutePath } from '@/utils/routeResolver';
import { useWmsStore } from '@/store/modules/wms';

const props = defineProps({
  mode: {
    type: String,
    default: 'item'
  }
});

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();
const wmsStore = useWmsStore();
const { wms_item_instance_status, wms_box_status, wms_borrow_status, wms_quality_grade } = proxy.useDict(
  'wms_item_instance_status',
  'wms_box_status',
  'wms_borrow_status',
  'wms_quality_grade'
);

const isItemMode = props.mode === 'item';
const loading = ref(false);
const code = ref('');
const itemTrace = reactive({
  itemInstance: null,
  currentBox: null,
  currentLocation: null,
  currentBorrowRecord: null,
  borrowRecords: [],
  shipmentDetails: [],
  movementDetails: [],
  inventoryHistories: []
});
const boxTrace = reactive({
  box: null,
  currentLocation: null,
  shipmentDetails: [],
  movementDetails: [],
  inventoryHistories: []
});

const resetData = () => {
  itemTrace.itemInstance = null;
  itemTrace.currentBox = null;
  itemTrace.currentLocation = null;
  itemTrace.currentBorrowRecord = null;
  itemTrace.borrowRecords = [];
  itemTrace.shipmentDetails = [];
  itemTrace.movementDetails = [];
  itemTrace.inventoryHistories = [];
  boxTrace.box = null;
  boxTrace.currentLocation = null;
  boxTrace.shipmentDetails = [];
  boxTrace.movementDetails = [];
  boxTrace.inventoryHistories = [];
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

const getNameById = (type, id) => {
  if (!id) {
    return '';
  }
  if (type === 'warehouse') {
    return wmsStore.warehouseMap.get(id)?.warehouseName || String(id);
  }
  if (type === 'area') {
    return wmsStore.areaMap.get(id)?.areaName || String(id);
  }
  if (type === 'rack') {
    return wmsStore.rackMap.get(id)?.rackName || String(id);
  }
  if (type === 'location') {
    return wmsStore.locationMap.get(id)?.locationName || String(id);
  }
  return String(id);
};

const formatLocationPath = (row, prefix) => {
  const parts = [];
  const warehouseId = row[`${prefix}WarehouseId`];
  const areaId = row[`${prefix}AreaId`];
  const rackId = row[`${prefix}RackId`];
  const locationId = row[`${prefix}LocationId`];
  if (warehouseId) parts.push(getNameById('warehouse', warehouseId));
  if (areaId) parts.push(getNameById('area', areaId));
  if (rackId) parts.push(getNameById('rack', rackId));
  if (locationId) parts.push(getNameById('location', locationId));
  return parts.length ? parts.join(' / ') : '-';
};

const formatInventoryLocation = (row) => {
  const parts = [];
  if (row.warehouseId) parts.push(getNameById('warehouse', row.warehouseId));
  if (row.areaId) parts.push(getNameById('area', row.areaId));
  if (row.rackId) parts.push(getNameById('rack', row.rackId));
  if (row.locationId) parts.push(getNameById('location', row.locationId));
  return parts.length ? parts.join(' / ') : '-';
};

const displayQualityGrade = (row = {}) => {
  const value = row.qualityGrade ?? row.defaultQualityGrade ?? row.item?.defaultQualityGrade ?? row.itemSku?.defaultQualityGrade ?? row.itemSku?.item?.defaultQualityGrade;
  return proxy.selectDictLabel(wms_quality_grade.value, value) || value || '-';
};
const displayProductMark = (row = {}) => row.productMark ?? row.inventoryDetail?.productMark ?? row.itemInstance?.productMark ?? '-';
const displayBelongUnit = (row = {}) => row.belongUnit ?? row.item?.defaultBelongUnit ?? row.itemSku?.item?.defaultBelongUnit ?? '-';
const displayBatchNo = (row = {}) => row.batchNo ?? row.inventoryDetail?.batchNo ?? row.itemInstance?.batchNo ?? '-';
const resolveDateValue = (row = {}, field) => row[field] ?? row.inventoryDetail?.[field] ?? row.itemInstance?.[field];

const handleQuery = async () => {
  if (!code.value) {
    proxy.$modal.msgError(isItemMode ? '请输入物品码' : '请输入箱码');
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
        currentLocation: res.data?.currentLocation || null,
        currentBorrowRecord: res.data?.currentBorrowRecord || null,
        borrowRecords: res.data?.borrowRecords || [],
        shipmentDetails: res.data?.shipmentDetails || [],
        movementDetails: res.data?.movementDetails || [],
        inventoryHistories: res.data?.inventoryHistories || []
      });
    } else {
      const res = await getBoxTrace(code.value);
      Object.assign(boxTrace, {
        box: res.data?.box || null,
        currentLocation: res.data?.currentLocation || null,
        shipmentDetails: res.data?.shipmentDetails || [],
        movementDetails: res.data?.movementDetails || [],
        inventoryHistories: res.data?.inventoryHistories || []
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

const goShipmentOrder = (id) => {
  if (!id) {
    return;
  }
  const path = resolveRoutePath(router, { preferredPaths: ['/shipmentOrderEdit'], titleKeywords: ['出库'] }) || '/shipmentOrderEdit';
  router.push({ path, query: { id, mode: 'view', returnFullPath: route.fullPath } });
};

const goMovementOrder = (id) => {
  if (!id) {
    return;
  }
  const path = resolveRoutePath(router, { preferredPaths: ['/movementOrderEdit'], titleKeywords: ['调拨'] }) || '/movementOrderEdit';
  router.push({ path, query: { id, mode: 'view', returnFullPath: route.fullPath } });
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
