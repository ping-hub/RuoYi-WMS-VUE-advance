<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" label-width="88px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="盘点状态" prop="checkOrderStatus">
              <el-select v-model="queryParams.checkOrderStatus" clearable placeholder="请选择盘点状态" style="width: 100%" @change="handleQuery">
                <el-option v-for="item in wms_check_status" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="盘点单号" prop="checkOrderNo">
              <el-input v-model="queryParams.checkOrderNo" placeholder="请输入盘点单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="仓库" prop="warehouseId">
              <el-select v-model="queryParams.warehouseId" clearable filterable placeholder="请选择仓库" style="width: 100%" @change="handleQuery">
                <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id"/>
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
        <el-table-column label="单号" align="left" prop="checkOrderNo" min-width="120" />
        <el-table-column label="范围类型" align="left" width="85">
          <template #default="{ row }">
            <span v-if="row.checkScopeType">{{ proxy.selectDictLabel(wms_check_scope_type, row.checkScopeType) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="盘点范围" align="left" min-width="90">
          <template #default="{ row }">
            <span v-if="row.rackId">{{ getRackName(row.rackId) }}</span>
            <span v-else-if="row.areaId">{{ useWmsStore().areaMap.get(row.areaId)?.areaName }}</span>
            <span v-else>{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="盘点日期" align="left" min-width="130">
          <template #default="{ row }">
            <span>{{ row.checkDate ? parseTime(row.checkDate, '{y}-{m}-{d} {h}:{i}') : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="盘点状态" align="center" prop="checkOrderStatus" min-width="90">
          <template #default="{ row }">
            <dict-tag :options="wms_check_status" :value="row.checkOrderStatus" />
          </template>
        </el-table-column>
        <el-table-column label="盈亏数" align="center" min-width="60">
          <template #default="{ row }">
            <el-statistic :value="Number(row.checkOrderTotal)" :precision="0"/>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="70" show-overflow-tooltip />
        <el-table-column label="提交人" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getNickNameByUserName(row.createBy) }}
          </template>
        </el-table-column><el-table-column label="提交日期" min-width="125">
          <template #default="{ row }">
            {{ row.createTime ? parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="220">
          <template #default="scope">
            <el-popover
              placement="left" title="提示" :width="300" trigger="hover"
              :disabled="[0, -2].includes(Number(scope.row.checkOrderStatus))"
              :content="getDisabledTip(scope.row)"
            >
              <template #reference>
                <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['wms:check:all']" :disabled="!canEditRow(scope.row)">修改</el-button>
              </template>
            </el-popover>
            <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['wms:check:all']">查看</el-button>
            <!-- 提交盘点：草稿/已驳回 -->
            <el-button v-if="[0, -2].includes(Number(scope.row.checkOrderStatus))" link type="warning" @click="handleUpdate(scope.row)" v-hasPermi="['wms:check:all']">提交</el-button>
            <!-- 去盘点：待盘点 -->
            <el-button v-if="Number(scope.row.checkOrderStatus) === 1" link type="primary" @click="handleGoCheck(scope.row)" v-hasPermi="['wms:check:all']">去盘点</el-button>
            <!-- 复核：待复核 -->
            <el-button v-if="Number(scope.row.checkOrderStatus) === 2" link type="success" @click="handleGoCheck(scope.row)" v-hasPermi="['wms:check:all']">复核</el-button>
            <el-popover
              placement="left" title="提示" :width="300" trigger="hover"
              :disabled="canDeleteRow(scope.row)"
              :content="getDisabledTip(scope.row)"
            >
              <template #reference>
                <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:check:all']" :disabled="!canDeleteRow(scope.row)">删除</el-button>
              </template>
            </el-popover>
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

<script setup name="CheckOrder">
import {listCheckOrder, delCheckOrder} from "@/api/wms/checkOrder";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import { useRoute, useRouter } from "vue-router";
import {useWmsStore} from "../../../../store/modules/wms";
import useUserStore from "@/store/modules/user";
import {ElMessageBox} from "element-plus";
import { resolveRoutePath } from "@/utils/routeResolver";
import { listRackNoPage } from "@/api/wms/rack";
import { getUserSelectList } from "@/api/wms/common";
const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const wmsStore = useWmsStore();
const userStore = useUserStore();
const isRowExecutor = (row) => userStore.id && row.executorId && String(userStore.id) === String(row.executorId);
// 用户列表，用于显示中文昵称
const userList = ref([]);
const getNickNameByUserName = (userName) => {
  if (!userName) return '-'
  const u = userList.value.find(x => x.userName === userName)
  return u ? u.nickName : userName
};
const {wms_check_status, wms_check_scope_type} = proxy.useDict("wms_check_status", "wms_check_scope_type");
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
    checkOrderStatus: undefined,
    warehouseId: undefined,
  },
});
const rackMap = ref(new Map())
const { queryParams } = toRefs(data);

async function loadRackMap() {
  const res = await listRackNoPage({})
  const map = new Map()
  ;(res.data || []).forEach(item => {
    map.set(item.id, item.rackName)
  })
  rackMap.value = map
}

function getRackName(rackId) {
  return rackMap.value.get(rackId) || rackId || '-'
}

/** 查询入库单列表 */
function getList() {
  loading.value = true;
  const query = {...queryParams.value}
  Object.keys(query).forEach(key => {
    if (query[key] === '' || query[key] === null || typeof query[key] === 'undefined') {
      delete query[key]
    }
  })
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
        '<div>盘点单【' + row.checkOrderNo + '】当前状态不允许删除！</div><div>请联系管理员处理！</div>',
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

/** 去盘点（进入盘点操作页面） */
function handleGoCheck(row) {
  router.push({ path: resolveCheckOrderEditPath(), query: { id: row.id, returnFullPath: route.fullPath } });
}

function handleUpdate(row) {
  router.push({ path: resolveCheckOrderEditPath(), query: { id: row.id, returnFullPath: route.fullPath } });
}

function handleGoDetail(row) {
  router.push({
    path: resolveCheckOrderEditPath(),
    query: { id: row.id, mode: 'view', returnFullPath: route.fullPath }
  });
}

function canEditRow(row) {
  return [0, -2].includes(Number(row.checkOrderStatus))
}
function canDeleteRow(row) {
  return [0, -2].includes(Number(row.checkOrderStatus))
}
function getDisabledTip(row) {
  const statusMap = { 1: '待盘点中', 2: '待复核中', 3: '已完成', '-1': '已作废' }
  const label = statusMap[row.checkOrderStatus] || '未知状态'
  return '盘点单【' + row.checkOrderNo + '】' + label + '，无法操作！'
}

function getRowKey(row) {
  return row.id
}
loadRackMap();
getList();
// 加载用户列表
getUserSelectList().then(res => {
  userList.value = res.data || []
})
</script>
<style lang="scss">
.el-statistic__content {
  font-size: 14px;
}
.el-table .vertical-top-cell {
  vertical-align: top
}

.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

</style>
