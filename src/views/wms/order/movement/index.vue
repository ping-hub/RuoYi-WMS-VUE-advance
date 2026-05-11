<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="98px">
        <el-form-item label="调拨状态" prop="movementOrderStatus">
          <el-radio-group v-model="queryParams.movementOrderStatus" @change="handleQuery">
            <el-radio-button
              :key="-2"
              :label="-2"
            >
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in wms_movement_status"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调拨单号" prop="movementOrderNo">
          <el-input
            v-model="queryParams.movementOrderNo"
            placeholder="请输入调拨单号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="源仓库库区" prop="sourcePlace">
          <WarehouseCascader v-model:value="queryParams.sourcePlace" :show-all-levels="true" size="default" @keyup.enter="handleQuery"></WarehouseCascader>
        </el-form-item>
        <el-form-item label="目标仓库库区" prop="targetPlace">
          <WarehouseCascader v-model:value="queryParams.targetPlace" :show-all-levels="true" size="default" @keyup.enter="handleQuery"></WarehouseCascader>
        </el-form-item>
        <el-form-item label="调拨类型" prop="movementType">
          <el-select v-model="queryParams.movementType" placeholder="请选择调拨类型" clearable style="width: 160px">
            <el-option v-for="item in wms_movement_type" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-alert
      class="mt20"
      :closable="false"
      type="info"
      title="本页按调拨单展示，仅处理跨仓和单位间调拨；库内位置变化请走库内移库。"
    />

    <el-card class="mt20">

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">调拨单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:movement:all']"
          >新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="movementOrderList" border class="mt20"
                @expand-change="handleExpandExchange"
                :row-key="getRowKey"
                :expand-row-keys="expandedRowKeys"
                empty-text="暂无调拨单"
                cell-class-name="vertical-top-cell"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div style="padding: 0 50px 20px 50px">
              <h3>调拨明细</h3>
              <el-table :data="props.row.details" v-loading="detailLoading[props.$index]" empty-text="暂无调拨明细">
                <el-table-column label="器材名称">
                  <template #default="{ row }">
                    <div>{{ row?.itemSku?.item?.itemName }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="器材规格">
                  <template #default="{ row }">
                    <div>{{ row?.itemSku?.skuName }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="器材编码" min-width="120">
                  <template #default="{ row }">
                    <div>{{ row.equipmentCode || row?.itemSku?.item?.itemCode || '-' }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="规格型号" min-width="140">
                  <template #default="{ row }">
                    <div>{{ row.specModel || row?.itemSku?.specModel || row?.itemSku?.item?.modelText || '-' }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="产品标识" min-width="140">
                  <template #default="{ row }">
                    <div>{{ row.productMark || '-' }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="质量等级" min-width="120">
                  <template #default="{ row }">
                    <dict-tag :options="wms_quality_grade" :value="row.qualityGrade ?? row?.itemSku?.defaultQualityGrade ?? row?.itemSku?.item?.defaultQualityGrade" />
                  </template>
                </el-table-column>
                <el-table-column label="源位置" min-width="220">
                  <template #default="{ row }">
                    <div>库区：{{ row.sourceAreaName || '-' }}</div>
                    <div class="sub-text">货架：{{ wmsStore.rackMap.get(row.sourceRackId)?.rackName || row.sourceRackId || '-' }} / 货位：{{ wmsStore.locationMap.get(row.sourceLocationId)?.locationName || row.sourceLocationId || '-' }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="目标位置" min-width="220">
                  <template #default="{ row }">
                    <div>库区：{{ row.targetAreaName || '-' }}</div>
                    <div class="sub-text">货架：{{ wmsStore.rackMap.get(row.targetRackId)?.rackName || row.targetRackId || '-' }} / 货位：{{ wmsStore.locationMap.get(row.targetLocationId)?.locationName || row.targetLocationId || '-' }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="单价(元)" align="right">
                  <template #default="{ row }">
                    <el-statistic :value="row.unitPrice ?? '-'" :precision="2" />
                  </template>
                </el-table-column>
                <el-table-column label="总价(元)" align="right">
                  <template #default="{ row }">
                    <el-statistic :value="row.lineAmount ?? '-'" :precision="2" />
                  </template>
                </el-table-column>
                <el-table-column label="数量" prop="quantity" align="right">
                  <template #default="{ row }">
                    <el-statistic :value="Number(row.quantity)" :precision="0"/>
                  </template>
                </el-table-column>
                <el-table-column label="批号" prop="batchNo" />
                <el-table-column label="生产日期" prop="inventoryDetail.productionDate">
                  <template #default="{ row }">
                    <div v-if="row.productionDate">{{ parseTime(row.productionDate, '{y}-{m}-{d}') }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="过期日期" prop="inventoryDetail.expirationDate">
                  <template #default="{ row }">
                    <div v-if="row.expirationDate">{{ parseTime(row.expirationDate, '{y}-{m}-{d}') }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="专装对象" min-width="180">
                  <template #default="{ row }">
                    <div v-if="row.instanceCode">物品码：{{ row.instanceCode }}</div>
                    <div v-if="row.boxCode" class="sub-text">箱码：{{ row.boxCode }}</div>
                    <div v-if="!row.instanceCode && !row.boxCode">-</div>
                  </template>
                </el-table-column>
                <el-table-column label="备注" prop="remark" min-width="140" show-overflow-tooltip />
                <el-table-column label="追踪" min-width="180" align="center">
                  <template #default="{ row }">
                    <el-button v-if="row.instanceCode" link type="primary" @click="handleGoItem(row)">明细</el-button>
                    <el-button v-if="row.instanceCode" link type="primary" @click="handleGoItemTrace(row)">明细追踪</el-button>
                    <el-button v-if="row.boxCode" link type="primary" @click="handleGoBox(row)">箱体</el-button>
                    <el-button v-if="row.boxCode" link type="primary" @click="handleGoBoxTrace(row)">箱体追踪</el-button>
                    <span v-if="!row.instanceCode && !row.boxCode">-</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单号/调拨" align="left" min-width="180">
          <template #default="{ row }">
            <div>单号：{{ row.movementOrderNo }}</div>
            <div v-if="row.dispatchBasis">依据：{{ proxy.selectDictLabel(wms_basis_type.value, row.dispatchBasis) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="调拨信息" align="left" min-width="240">
          <template #default="{ row }">
            <div v-if="row.movementType">类型：{{ proxy.selectDictLabel(wms_movement_type.value, row.movementType) }}</div>
            <div v-if="row.movementScope">范围：{{ row.movementScope }}</div>
            <div v-if="row.dispatchMode">方式：{{ proxy.selectDictLabel(wms_dispatch_mode.value, row.dispatchMode) }}</div>
            <div v-if="row.supportNo">保障号：{{ row.supportNo }}</div>
            <div v-if="row.dispatchDate">调拨日期：{{ parseTime(row.dispatchDate, '{y}-{m}-{d}') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="原位置" align="left" width="260">
          <template #default="{ row }">
            <div>仓库：{{ wmsStore.warehouseMap.get(row.sourceWarehouseId)?.warehouseName }}</div>
            <div v-if="row.sourceAreaId">库区：{{ wmsStore.areaMap.get(row.sourceAreaId)?.areaName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="目标位置" align="left" width="260">
          <template #default="{ row }">
            <div>仓库：{{ wmsStore.warehouseMap.get(row.targetWarehouseId)?.warehouseName }}</div>
            <div v-if="row.targetAreaId">库区：{{ wmsStore.areaMap.get(row.targetAreaId)?.areaName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="调拨状态" align="center" prop="movementOrderStatus" width="120">
          <template #default="{ row }">
            <dict-tag :options="wms_movement_status" :value="row.movementOrderStatus" />
          </template>
        </el-table-column>
        <el-table-column label="数量" align="left">
          <template #default="{ row }">
            <div class="flex-space-between">
              <span>数量：</span>
              <el-statistic :value="Number(row.totalQuantity)" :precision="0"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建/操作" align="left">
          <template #default="{ row }">
            <div>创建：{{ row.createBy }}</div>
            <div v-if="row.updateBy">操作：{{ row.updateBy }}</div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间/操作时间" align="left" width="200">
          <template #default="{ row }">
            <div>创建：{{ parseTime(row.createTime, '{mm}-{dd} {hh}:{ii}') }}</div>
            <div>操作：{{ parseTime(row.updateTime, '{mm}-{dd} {hh}:{ii}') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <div>
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="scope.row.movementOrderStatus === 0"
                :content="'调拨单【' + scope.row.movementOrderNo + '】已' + (scope.row.movementOrderStatus === 1 ? '调拨完成' : '作废') + '，无法修改！' "
              >
                <template #reference>
                  <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['wms:movement:all']" :disabled="[-1, 1].includes(scope.row.movementOrderStatus)">修改</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['wms:movement:all']">{{ expandedRowKeys.includes(scope.row.id) ? '收起' : '查看' }}</el-button>
            </div>
            <div class="mt10">
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="[-1, 0].includes(scope.row.movementOrderStatus)"
                :content="'调拨单【' + scope.row.movementOrderNo + '】已调拨完成，无法删除！' "
              >
                <template #reference>
                  <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:movement:all']" :disabled="scope.row.movementOrderStatus === 1">删除</el-button>
                </template>
              </el-popover>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </el-row>
    </el-card>
  </div>
</template>

<script setup name="MovementOrder">
import {listMovementOrder, delMovementOrder, getMovementOrder} from "@/api/wms/movementOrder";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import { useRoute, useRouter } from "vue-router";
import {useWmsStore} from "../../../../store/modules/wms";
import {ElMessageBox} from "element-plus";
import WarehouseCascader from "@/views/components/WarehouseCascader.vue";
import { resolveRoutePath } from "@/utils/routeResolver";

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const wmsStore = useWmsStore();
const { wms_movement_status, wms_movement_type, wms_dispatch_mode, wms_basis_type, wms_quality_grade } = proxy.useDict(
  "wms_movement_status",
  "wms_movement_type",
  "wms_dispatch_mode",
  "wms_basis_type",
  "wms_quality_grade"
);
const movementOrderList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");
// 当前展开集合
const expandedRowKeys = ref([])
// 器材明细table的loading状态集合
const detailLoading = ref([])
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    movementOrderNo: undefined,
    movementOrderStatus: -2,
    sourcePlace: undefined,
    targetPlace: undefined,
    movementType: undefined
  },
});

const { queryParams } = toRefs(data);

/** 查询入库单列表 */
function getList() {
  loading.value = true;
  const query = {...queryParams.value}
  if (query.movementOrderStatus === -2) {
    query.movementOrderStatus = null
  }
  if (query.sourcePlace?.length) {
    query.sourceWarehouseId = query.sourcePlace[0]
    query.sourceAreaId = query.sourcePlace[1]
  }
  if (query.targetPlace?.length) {
    query.targetWarehouseId = query.targetPlace[0]
    query.targetAreaId = query.targetPlace[1]
  }
  if (!query.movementType) {
    delete query.movementType
  }
  listMovementOrder(query).then(response => {
    movementOrderList.value = response.rows;
    total.value = response.total;
    for (let i = 0; i < total; i++) {
      detailLoading.value.push(false)
    }
    expandedRowKeys.value = []
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
const resolveMovementOrderEditPath = () => resolveRoutePath(router, {
  preferredPaths: ["/movementOrderEdit"],
  titleKeywords: ["调拨"]
}) || "/movementOrderEdit";

function handleAdd() {
  router.push({ path: resolveMovementOrderEditPath(), query: { returnFullPath: route.fullPath } });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('确认删除调拨单【' + row.movementOrderNo + '】吗？').then(function() {
    loading.value = true;
    return delMovementOrder(_ids);
  }).then(() => {
    loading.value = true;
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch((e) => {
    if (e === 409) {
      return ElMessageBox.alert(
        '<div>调拨单【' + row.movementOrderNo + '】已调拨完成，不能删除！</div><div>请联系管理员处理！</div>',
        '系统提示',
        {
          dangerouslyUseHTMLString: true,
        }
      )
    }
  }).finally(() => {
    loading.value = false;
  });
}

function handleUpdate(row) {
  router.push({ path: resolveMovementOrderEditPath(), query: { id: row.id, returnFullPath: route.fullPath } });
}

function handleGoItem(row) {
  if (!row.instanceCode) {
    return;
  }
  router.push({ path: "/wms-item-instance/index", query: { instanceCode: row.instanceCode } });
}

function handleGoItemTrace(row) {
  if (!row.instanceCode) {
    return;
  }
  router.push({ path: "/wms-trace-item/index", query: { instanceCode: row.instanceCode } });
}

function handleGoBox(row) {
  if (!row.boxCode) {
    return;
  }
  router.push({ path: "/wms-box/index", query: { boxCode: row.boxCode } });
}

function handleGoBoxTrace(row) {
  if (!row.boxCode) {
    return;
  }
  router.push({ path: "/wms-trace-box/index", query: { boxCode: row.boxCode } });
}

function handleGoDetail(row) {
  const index = expandedRowKeys.value.indexOf(row.id)
  if (index !== -1) {
    // 收起
    expandedRowKeys.value.splice(index, 1)
  } else {
    // 展开
    expandedRowKeys.value.push(row.id)
    loadMovementOrderDetail(row)
  }
}

function handleExpandExchange(value, expandedRows) {
  if (!ifExpand(expandedRows)) {
    return
  }
  expandedRowKeys.value = expandedRows.map(it => it.id)
  loadMovementOrderDetail(value)
}

function loadMovementOrderDetail(row) {
  const index = movementOrderList.value.findIndex(it => it.id === row.id)
  if (index === -1) {
    return
  }
  detailLoading.value[index] = true
  getMovementOrder(row.id).then(res => {
    const rawDetails = res.data?.details || []
    movementOrderList.value[index].details = rawDetails.map(it => {
      return {
        ...it,
        sourceWarehouseName: wmsStore.warehouseMap.get(it.sourceWarehouseId)?.warehouseName,
        sourceAreaName: wmsStore.areaMap.get(it.sourceAreaId)?.areaName,
        targetWarehouseName: wmsStore.warehouseMap.get(it.targetWarehouseId)?.warehouseName,
        targetAreaName: wmsStore.areaMap.get(it.targetAreaId)?.areaName
      }
    })
  }).finally(() => {
    detailLoading.value[index] = false
  })
}

function ifExpand(expandedRows) {
  if (expandedRows.length < expandedRowKeys.value.length) {
    expandedRowKeys.value = expandedRows.map(it => it.id)
    return false;
  }
  return true
}

function getRowKey(row) {
  return row.id
}
getList();
</script>
<style lang="scss">
.el-statistic__content {
  font-size: 14px;
}
.el-table .vertical-top-cell {
  vertical-align: top
}

.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
