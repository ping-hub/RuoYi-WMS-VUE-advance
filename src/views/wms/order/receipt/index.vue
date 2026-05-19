<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="入库状态" prop="receiptOrderStatus">
          <el-radio-group v-model="queryParams.receiptOrderStatus" @change="handleQuery">
            <el-radio-button
              :key="-2"
              :label="-2"
            >
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in wms_receipt_status"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="入库类型" prop="receiptOrderType">
          <el-radio-group v-model="queryParams.receiptOrderType" @change="handleQuery">
            <el-radio-button
              :key="-1"
              :label="-1"
            >
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in wms_receipt_type"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="入库单号" prop="receiptOrderNo">
          <el-input
            v-model="queryParams.receiptOrderNo"
            placeholder="请输入入库单号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="订单号" prop="orderNo">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="调拨根据" prop="basisNo">
          <el-input
            v-model="queryParams.basisNo"
            placeholder="请输入调拨根据"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="收物单位" prop="receiveUnit">
          <el-input
            v-model="queryParams.receiveUnit"
            placeholder="请输入收物单位"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">入库单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:receipt:all']"
          >新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="receiptOrderList" border class="mt20" empty-text="暂无入库单">
        <el-table-column label="单号/订单号" align="left" width="150">
          <template #default="{ row }">
            <div>单号：{{ row.receiptOrderNo }}</div>
            <div v-if="row.orderNo">订单号：{{ row.orderNo }}</div>
            <div v-if="row.basisNo">调拨根据：{{ row.basisNo }}</div>
          </template>
        </el-table-column>
        <el-table-column label="入库类型" width="90"  align="left" prop="receiptOrderType">
          <template #default="{ row }">
            <dict-tag :options="wms_receipt_type" :value="row.receiptOrderType" />
          </template>
        </el-table-column>
        <el-table-column label="仓库/库区" align="left" width="130">
          <template #default="{ row }">
            <div>仓库：{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
            <div v-if="row.areaId">库区：{{ useWmsStore().areaMap.get(row.areaId)?.areaName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="单据信息" align="left" min-width="150">
          <template #default="{ row }">
            <div v-if="row.receiveUnit">收物单位：{{ row.receiveUnit }}</div>
            <div v-if="row.noticeOrg">通知机关：{{ row.noticeOrg }}</div>
            <div v-if="row.dispatchMode">调拨方式：{{ proxy.selectDictLabel(wms_dispatch_mode.value, row.dispatchMode) }}</div>
            <div v-if="row.receiptDate">入库日期：{{ parseTime(row.receiptDate, '{y}-{m}-{d}') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="入库状态" align="center" prop="receiptOrderStatus" width="80">
          <template #default="{ row }">
            <dict-tag :options="wms_receipt_status" :value="row.receiptOrderStatus" />
          </template>
        </el-table-column>
        <el-table-column label="数量/金额(元)" align="left" width="110">
          <template #default="{ row }">
            <div class="flex-space-between">
              <span>数量：</span>
              <el-statistic :value="Number(row.totalQuantity)" :precision="0"/>
            </div>
            <div class="flex-space-between" v-if="row.payableAmount || row.payableAmount === 0">
              <span>金额：</span>
              <el-statistic :value="Number(row.payableAmount)" :precision="2"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建/操作" align="left" width="110">
          <template #default="{ row }">
            <div>创建：{{ row.createBy }}</div>
            <div v-if="row.updateBy">操作：{{ row.updateBy }}</div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间/操作时间" align="left" width="145">
          <template #default="{ row }">
            <div>创建：{{ parseTime(row.createTime, '{mm}-{dd} {hh}:{ii}') }}</div>
            <div>操作：{{ parseTime(row.updateTime, '{mm}-{dd} {hh}:{ii}') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <el-popover
              placement="left"
              title="提示"
              :width="300"
              trigger="hover"
              :disabled="scope.row.receiptOrderStatus === 0"
              :content="'入库单【' + scope.row.receiptOrderNo + '】已' + (scope.row.receiptOrderStatus === 1 ? '入库' : '作废') + '，无法修改！' "
            >
              <template #reference>
                <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['wms:receipt:all']" :disabled="[-1, 1].includes(scope.row.receiptOrderStatus)">修改</el-button>
              </template>
            </el-popover>
            <el-button link type="primary" @click="handleView(scope.row)" v-hasPermi="['wms:receipt:all']">查看</el-button>
            <el-popover
              placement="left"
              title="提示"
              :width="300"
              trigger="hover"
              :disabled="[-1, 0].includes(scope.row.receiptOrderStatus)"
              :content="'入库单【' + scope.row.receiptOrderNo + '】已入库，无法删除！' "
            >
              <template #reference>
                <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:receipt:all']" :disabled="scope.row.receiptOrderStatus === 1">删除</el-button>
              </template>
            </el-popover>
            <el-button link type="primary" @click="handlePrint(scope.row)" v-hasPermi="['wms:receipt:all']">打印</el-button>
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

<script setup name="ReceiptOrder">
import { listReceiptOrder, delReceiptOrder, getReceiptOrder } from "@/api/wms/receiptOrder";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import { useRoute, useRouter } from "vue-router";
import {useWmsStore} from "../../../../store/modules/wms";
import {ElMessageBox} from "element-plus";
import { resolveRoutePath } from "@/utils/routeResolver";
import receiptPanel from "@/components/PrintTemplate/receipt-panel";

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const { wms_receipt_status, wms_receipt_type, wms_dispatch_mode } = proxy.useDict(
  "wms_receipt_status",
  "wms_receipt_type",
  "wms_dispatch_mode"
);
const receiptOrderList = ref([]);
const loading = ref(true);
const total = ref(0);
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    receiptOrderNo: undefined,
    receiptOrderType: -1,
    basisNo: undefined,
    receiveUnit: undefined,
    payableAmount: undefined,
    receiptOrderStatus: -2,
  },
});

const { queryParams } = toRefs(data);

/** 查询入库单列表 */
function getList() {
  loading.value = true;
  const query = {...queryParams.value}
  if (query.receiptOrderStatus === -2) {
    query.receiptOrderStatus = null
  }
  if (query.receiptOrderType === -1) {
    query.receiptOrderType = null
  }
  listReceiptOrder(query).then(response => {
    receiptOrderList.value = response.rows;
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
const resolveReceiptOrderEditPath = () => resolveRoutePath(router, {
  preferredPaths: ["/receiptOrderEdit"],
  titleKeywords: ["入库"]
}) || "/receiptOrderEdit";

function handleAdd() {
  router.push({ path: resolveReceiptOrderEditPath(), query: { returnFullPath: route.fullPath } });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id;
  proxy.$modal.confirm('确认删除入库单【' + row.receiptOrderNo + '】吗？').then(function() {
    loading.value = true;
    return delReceiptOrder(_ids);
  }).then(() => {
    loading.value = true;
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch((e) => {
    if (e === 409) {
      return ElMessageBox.alert(
        '<div>入库单【' + row.receiptOrderNo + '】已入库，不能删除 ！</div><div>请联系管理员处理！</div>',
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
  router.push({ path: resolveReceiptOrderEditPath(), query: { id: row.id, returnFullPath: route.fullPath } });
}

function handleView(row) {
  router.push({ path: resolveReceiptOrderEditPath(), query: { id: row.id, mode: 'view', returnFullPath: route.fullPath } });
}

async function handlePrint(row) {
  const res = await getReceiptOrder(row.id)
  const receiptOrder = res.data
  let table = []
  if (receiptOrder.details?.length) {
    table = receiptOrder.details.map(detail => ({
      itemName: detail.itemSku?.item?.itemName,
      skuName: detail.itemSku?.skuName,
      areaName: useWmsStore().areaMap.get(detail.areaId)?.areaName,
      quantity: Number(detail.quantity || 0).toFixed(0),
      unitPrice: detail.unitPrice,
      lineAmount: detail.lineAmount
    }))
  }
  const printData = {
    receiptOrderNo: receiptOrder.receiptOrderNo,
    receiptOrderType: receiptOrder.receiptOrderType,
    receiptOrderStatus: proxy.selectDictLabel(wms_receipt_status.value, receiptOrder.receiptOrderStatus),
    basisNo: receiptOrder.basisNo,
    dispatchMode: proxy.selectDictLabel(wms_dispatch_mode.value, receiptOrder.dispatchMode),
    noticeOrg: receiptOrder.noticeOrg,
    receiveUnit: receiptOrder.receiveUnit,
    purchaseDate: proxy.parseTime(receiptOrder.purchaseDate, '{y}-{m}-{d}'),
    receiptDate: proxy.parseTime(receiptOrder.receiptDate, '{y}-{m}-{d}'),
    purchaserName: receiptOrder.purchaserName,
    acceptorName: receiptOrder.acceptorName,
    keeperName: receiptOrder.keeperName,
    warehouseName: useWmsStore().warehouseMap.get(receiptOrder.warehouseId)?.warehouseName,
    warehouse: useWmsStore().warehouseMap.get(receiptOrder.warehouseId)?.warehouseName,
    areaName: useWmsStore().areaMap.get(receiptOrder.areaId)?.areaName,
    area: useWmsStore().areaMap.get(receiptOrder.areaId)?.areaName,
    totalQuantity: Number(receiptOrder.totalQuantity || 0).toFixed(0),
    payableAmount: ((receiptOrder.payableAmount || receiptOrder.payableAmount === 0) ? (receiptOrder.payableAmount + '元') : ''),
    createBy: receiptOrder.createBy,
    createTime: proxy.parseTime(receiptOrder.createTime, '{mm}-{dd} {hh}:{ii}'),
    updateBy: receiptOrder.updateBy,
    updateTime: proxy.parseTime(receiptOrder.updateTime, '{mm}-{dd} {hh}:{ii}'),
    remark: receiptOrder.remark,
    table
  }
  let printTemplate = new proxy.$hiprint.PrintTemplate({template: receiptPanel})
  printTemplate.print(printData, {}, {
    styleHandler: () => {
      let css = '<link href="https://cyl-press.oss-cn-shenzhen.aliyuncs.com/print-lock.css" media="print" rel="stylesheet">';
      return css
    }
  })
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
