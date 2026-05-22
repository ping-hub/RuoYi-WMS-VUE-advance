<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" label-width="98px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="调拨状态" prop="movementOrderStatus">
              <el-select v-model="queryParams.movementOrderStatus" placeholder="请选择调拨状态" clearable style="width: 100%" @change="handleQuery">
                <el-option v-for="item in wms_movement_status" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="调拨单号" prop="movementOrderNo">
              <el-input v-model="queryParams.movementOrderNo" placeholder="请输入调拨单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="源仓库库区" prop="sourcePlace">
              <WarehouseCascader v-model:value="queryParams.sourcePlace" :show-all-levels="true" size="default" @change="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="目标仓库库区" prop="targetPlace">
              <WarehouseCascader v-model:value="queryParams.targetPlace" :show-all-levels="true" size="default" @change="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="调拨类型" prop="movementType">
              <el-select v-model="queryParams.movementType" placeholder="请选择调拨类型" clearable style="width: 100%" @change="handleQuery">
                <el-option v-for="item in wms_movement_type" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
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
                :row-key="getRowKey"
                empty-text="暂无调拨单"
                cell-class-name="vertical-top-cell"
      >
        <el-table-column label="单号/调拨" align="left" min-width="180">
          <template #default="{ row }">
            <div>单号：{{ row.movementOrderNo }}</div>
            <div v-if="row.dispatchBasis">依据：{{ row.dispatchBasis }}</div>
          </template>
        </el-table-column>
        <el-table-column label="调拨信息" align="left" min-width="240">
          <template #default="{ row }">
            <div v-if="row.movementType">类型：{{ proxy.selectDictLabel(wms_movement_type, row.movementType) }}</div>
            <div v-if="row.dispatchMode">方式：{{ proxy.selectDictLabel(wms_dispatch_mode, row.dispatchMode) }}</div>
            <div v-if="row.dispatchDate">调拨日期：{{ parseTime(row.dispatchDate, '{y}-{m}-{d}') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="原位置" align="left" width="120">
          <template #default="{ row }">
            <div>仓库：{{ wmsStore.warehouseMap.get(row.sourceWarehouseId)?.warehouseName }}</div>
            <div v-if="row.sourceAreaId">库区：{{ wmsStore.areaMap.get(row.sourceAreaId)?.areaName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="目标位置" align="left" width="120">
          <template #default="{ row }">
            <div>仓库：{{ wmsStore.warehouseMap.get(row.targetWarehouseId)?.warehouseName }}</div>
            <div v-if="row.targetAreaId">库区：{{ wmsStore.areaMap.get(row.targetAreaId)?.areaName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="调拨状态" align="center" prop="movementOrderStatus" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_movement_status" :value="row.movementOrderStatus" />
          </template>
        </el-table-column>
        <el-table-column label="数量" align="left">
          <template #default="{ row }">
            <div class="flex-space-between">
              <el-statistic :value="Number(row.totalQuantity)" :precision="0"/>
            </div>
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
              <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['wms:movement:all']">查看</el-button>
            </div>
            <div class="mt10">
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="scope.row.movementOrderStatus === 0"
                :content="'调拨单【' + scope.row.movementOrderNo + '】已' + (scope.row.movementOrderStatus === 1 ? '调拨完成' : '作废') + '，无法删除！' "
              >
                <template #reference>
                  <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:movement:all']" :disabled="[-1, 1].includes(scope.row.movementOrderStatus)">删除</el-button>
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
import {listMovementOrder, delMovementOrder} from "@/api/wms/movementOrder";
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
const { wms_movement_status, wms_movement_type, wms_dispatch_mode } = proxy.useDict(
  "wms_movement_status",
  "wms_movement_type",
  "wms_dispatch_mode"
);
const movementOrderList = ref([]);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    movementOrderNo: undefined,
    movementOrderStatus: undefined,
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
  if (query.sourcePlace?.length) {
    query.sourceWarehouseId = query.sourcePlace[0]
    query.sourceAreaId = query.sourcePlace[1]
  }
  if (query.targetPlace?.length) {
    query.targetWarehouseId = query.targetPlace[0]
    query.targetAreaId = query.targetPlace[1]
  }
  delete query.sourcePlace
  delete query.targetPlace
  Object.keys(query).forEach(key => {
    if (query[key] === '' || query[key] === null || typeof query[key] === 'undefined') {
      delete query[key]
    }
  })
  listMovementOrder(query).then(response => {
    movementOrderList.value = response.rows;
    total.value = response.total;
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
        '<div>调拨单【' + row.movementOrderNo + '】已' + (row.movementOrderStatus === 1 ? '调拨完成' : '作废') + '，不能删除！</div><div>请联系管理员处理！</div>',
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

function handleGoDetail(row) {
  router.push({
    path: resolveMovementOrderEditPath(),
    query: { id: row.id, mode: 'view', returnFullPath: route.fullPath }
  });
}

function getRowKey(row) {
  return row.id
}
getList();
</script>
<style lang="scss">
.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
<style lang="scss">
.el-statistic__content {
  font-size: 14px;
}
.el-table .vertical-top-cell {
  vertical-align: top
}

</style>
