<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="盘点状态" prop="checkOrderStatus">
          <el-radio-group v-model="queryParams.checkOrderStatus" @change="handleQuery">
            <el-radio-button
              :key="-2"
              :label="-2"
            >
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in wms_check_status"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="盘点单号" prop="checkOrderNo">
          <el-input
            v-model="queryParams.checkOrderNo"
            placeholder="请输入盘点单号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="queryParams.warehouseId" clearable filterable placeholder="请选择仓库" style="width: 180px">
            <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id"/>
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
        <el-col :span="6"><span style="font-size: large">库存盘点</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:check:all']"
          >新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="checkOrderList" border class="mt20"
                :row-key="getRowKey"
                empty-text="暂无盘点单"
                cell-class-name="vertical-top-cell"
      >
        <el-table-column label="单号" align="left" prop="checkOrderNo" />
        <el-table-column label="盘点范围" align="left" width="240">
          <template #default="{ row }">
            <div>仓库：{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
            <div v-if="row.areaId">库区：{{ useWmsStore().areaMap.get(row.areaId)?.areaName }}</div>
            <div v-if="row.rackId">货架：{{ row.rackId }}</div>
          </template>
        </el-table-column>
        <el-table-column label="盘点信息" align="left" min-width="220">
          <template #default="{ row }">
            <div>范围类型：{{ row.checkScopeType || '-' }}</div>
            <div v-if="row.checkDate">盘点日期：{{ parseTime(row.checkDate, '{y}-{m}-{d} {h}:{i}') }}</div>
            <div v-if="row.checkerName || row.reviewerName" class="sub-text">盘点人：{{ row.checkerName || '-' }} / 复核人：{{ row.reviewerName || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="盘点状态" align="center" prop="checkOrderStatus" width="120">
          <template #default="{ row }">
            <dict-tag :options="wms_check_status" :value="row.checkOrderStatus" />
          </template>
        </el-table-column>
        <el-table-column label="盈亏数" align="right">
          <template #default="{ row }">
            <el-statistic :value="Number(row.checkOrderTotal)" :precision="0"/>
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
                :disabled="scope.row.checkOrderStatus === 0"
                :content="'盘点单【' + scope.row.checkOrderNo + '】已' + (scope.row.checkOrderStatus === 1 ? '盘点完成' : '作废') + '，无法修改！' "
              >
                <template #reference>
                  <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['wms:check:all']" :disabled="[-1, 1].includes(scope.row.checkOrderStatus)">修改</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['wms:check:all']">查看</el-button>
            </div>
            <div class="mt10">
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="[-1, 0].includes(scope.row.checkOrderStatus)"
                :content="'盘点单【' + scope.row.checkOrderNo + '】已盘点完成，无法删除！' "
              >
                <template #reference>
                  <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:check:all']" :disabled="scope.row.checkOrderStatus === 1">删除</el-button>
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
    <check-order-detail
      ref="checkOrderDetailRef"
      :model-value="watchDetailObj.show"
      :check-order-no="watchDetailObj.checkOrderNo"
      @handle-cancel-click="watchDetailObj.show = false"
    />
  </div>
</template>

<script setup name="CheckOrder">
import {listCheckOrder, delCheckOrder} from "@/api/wms/checkOrder";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import { useRoute, useRouter } from "vue-router";
import {useWmsStore} from "../../../../store/modules/wms";
import {ElMessageBox} from "element-plus";
import CheckOrderDetail from "@/views/wms/order/check/CheckOrderDetail.vue";
import { resolveRoutePath } from "@/utils/routeResolver";
const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const {wms_check_status} = proxy.useDict("wms_check_status");
const checkOrderList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    checkOrderNo: undefined,
    checkOrderStatus: -2,
    warehouseId: undefined,
  },
});
const watchDetailObj = ref({
  show: false,
  checkOrderNo: null
})
const checkOrderDetailRef = ref(null)
const { queryParams } = toRefs(data);

/** 查询入库单列表 */
function getList() {
  loading.value = true;
  const query = {...queryParams.value}
  if (query.checkOrderStatus === -2) {
    query.checkOrderStatus = null
  }
  listCheckOrder(query).then(response => {
    checkOrderList.value = response.rows;
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
const resolveCheckOrderEditPath = () => resolveRoutePath(router, {
  preferredPaths: ["/checkOrderEdit"],
  titleKeywords: ["盘点"]
}) || "/checkOrderEdit";

function handleAdd() {
  router.push({ path: resolveCheckOrderEditPath(), query: { returnFullPath: route.fullPath } });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('确认删除盘点单【' + row.checkOrderNo + '】吗？').then(function() {
    loading.value = true;
    return delCheckOrder(_ids);
  }).then(() => {
    loading.value = true;
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch((e) => {
    if (e === 409) {
      return ElMessageBox.alert(
        '<div>盘点单【' + row.checkOrderNo + '】已盘点完成，不能删除！</div><div>请联系管理员处理！</div>',
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
  router.push({ path: resolveCheckOrderEditPath(), query: { id: row.id, returnFullPath: route.fullPath } });
}

function handleGoDetail(row) {
  watchDetailObj.value.checkOrderNo = row.checkOrderNo
  checkOrderDetailRef.value.setCheckOrderId(row.id)
  watchDetailObj.value.show = true
  checkOrderDetailRef.value.handleQuery()
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
</style>
