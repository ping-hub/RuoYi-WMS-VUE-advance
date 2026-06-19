<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" label-width="88px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="出库状态" prop="shipmentOrderStatus">
              <el-select v-model="queryParams.shipmentOrderStatus" placeholder="请选择出库状态" clearable style="width: 100%" @change="handleQuery">
                <el-option v-for="item in wms_shipment_status" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="出库类型" prop="shipmentOrderType">
              <el-select v-model="queryParams.shipmentOrderType" placeholder="请选择出库类型" clearable style="width: 100%" @change="handleQuery">
                <el-option v-for="item in wms_shipment_type" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="出库单号" prop="shipmentOrderNo">
              <el-input v-model="queryParams.shipmentOrderNo" placeholder="请输入出库单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="调拨根据" prop="basisNo">
              <el-input v-model="queryParams.basisNo" placeholder="请输入调拨根据" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="收物单位" prop="receiveUnit">
              <el-input v-model="queryParams.receiveUnit" placeholder="请输入收物单位" clearable @keyup.enter="handleQuery" />
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
        <el-col :span="6"><span style="font-size: large">出库单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:shipment:all']"
          >新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="shipmentOrderList" border class="mt20" empty-text="暂无出库单">
        <el-table-column label="单号" align="left" min-width="130">
          <template #default="{ row }">
            <div>{{ row.shipmentOrderNo }}</div>
          </template>
        </el-table-column>
        <el-table-column label="出库类型" min-width="85" align="left" prop="shipmentOrderType">
          <template #default="{ row }">
            <dict-tag :options="wms_shipment_type" :value="row.shipmentOrderType" />
          </template>
        </el-table-column>
        <el-table-column label="仓库" align="left" min-width="90">
          <template #default="{ row }">
            {{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="库区" align="left" min-width="90">
          <template #default="{ row }">
            {{ row.areaId ? useWmsStore().areaMap.get(row.areaId)?.areaName : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="出库日期" align="left" min-width="100">
          <template #default="{ row }">
            {{ row.shipmentDate ? parseTime(row.shipmentDate, '{y}-{m}-{d}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="出库状态" align="center" prop="shipmentOrderStatus" min-width="80">
          <template #default="{ row }">
            <dict-tag :options="wms_shipment_status" :value="row.shipmentOrderStatus" />
          </template>
        </el-table-column>
        <el-table-column label="申请人" align="left" min-width="70" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getNickNameById(row.applicantId) }}
          </template>
        </el-table-column>
        <el-table-column label="数量" align="left" min-width="70">
          <template #default="{ row }">
            <el-statistic :value="Number(row.totalQuantity)" :precision="0"/>
          </template>
        </el-table-column>
        <el-table-column label="金额(元)" align="left" min-width="70">
          <template #default="{ row }">
            <el-statistic v-if="row.receivableAmount || row.receivableAmount === 0" :value="Number(row.receivableAmount)" :precision="2"/>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="60" show-overflow-tooltip />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="200">
          <template #default="scope">
            <el-popover
              placement="left"
              title="提示"
              :width="300"
              trigger="hover"
              :disabled="[0, -2].includes(Number(scope.row.shipmentOrderStatus))"
              :content="getDisabledTip(scope.row)"
            >
              <template #reference>
                <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['wms:shipment:all']" :disabled="!canEdit(scope.row)">修改</el-button>
              </template>
            </el-popover>
            <el-button link type="primary" @click="handleView(scope.row)" v-hasPermi="['wms:shipment:all']">查看</el-button>
            <!-- 提交审批：草稿/已驳回 -->
            <el-button v-if="[0, -2].includes(Number(scope.row.shipmentOrderStatus))" link type="warning" @click="handleSubmit(scope.row)" v-hasPermi="['wms:shipment:submit']">提交</el-button>
            <!-- 审批/驳回：待审批 -->
            <el-button v-if="scope.row.shipmentOrderStatus == 1" link type="success" @click="handleApprove(scope.row)" v-hasPermi="['wms:shipment:approve']">审批</el-button>
            <!-- 完成出库：已审批，仅指定操作人可见 -->
            <el-button v-if="scope.row.shipmentOrderStatus == 2 && isRowExecutor(scope.row)" link type="primary" @click="handleDoShipment(scope.row)" v-hasPermi="['wms:shipment:execute']">出库</el-button>
            <el-popover
              placement="left"
              title="提示"
              :width="300"
              trigger="hover"
              :disabled="canDelete(scope.row)"
              :content="getDisabledTip(scope.row)"
            >
              <template #reference>
                <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:shipment:all']" :disabled="!canDelete(scope.row)">删除</el-button>
              </template>
            </el-popover>
            <el-button v-if="scope.row.shipmentOrderStatus == 3" link type="primary" @click="handlePrint(scope.row)" v-hasPermi="['wms:shipment:all']">打印</el-button>
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

<script setup name="ShipmentOrder">
import {listShipmentOrder, delShipmentOrder, getShipmentOrder, submitForApproval, voidOrder} from "@/api/wms/shipmentOrder";
import {getUserSelectList} from "@/api/wms/common";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import { useRoute, useRouter } from "vue-router";
import {useWmsStore} from "../../../../store/modules/wms";
import useUserStore from "@/store/modules/user";
import {ElMessageBox} from "element-plus";
import shipmentPanel from "@/components/PrintTemplate/shipment-panel";
import { resolveRoutePath } from "@/utils/routeResolver";

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
// 用户列表，用于显示中文昵称
const userList = ref([]);
// 根据用户ID查找昵称
const getNickNameById = (userId) => {
  if (!userId) return '-'
  const u = userList.value.find(x => String(x.userId) === String(userId))
  return u ? u.nickName : '-'
};
// 判断当前用户是否为该行指定操作人
const isRowExecutor = (row) => userStore.id && row.executorId && String(userStore.id) === String(row.executorId);
const { wms_shipment_status, wms_shipment_type } = proxy.useDict(
  "wms_shipment_status",
  "wms_shipment_type"
);
const shipmentOrderList = ref([]);
const loading = ref(true);
const total = ref(0);
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    shipmentOrderNo: undefined,
    shipmentOrderType: undefined,
    basisNo: undefined,
    receiveUnit: undefined,
    receivableAmount: undefined,
    shipmentOrderStatus: undefined,
  },
});

const { queryParams } = toRefs(data);

/** 查询入库单列表 */
function getList() {
  loading.value = true;
  const query = {...queryParams.value}
  Object.keys(query).forEach(key => {
    if (query[key] === '' || query[key] === null || typeof query[key] === 'undefined') {
      delete query[key]
    }
  })
  listShipmentOrder(query).then(response => {
    shipmentOrderList.value = response.rows;
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
const resolveShipmentOrderEditPath = () => resolveRoutePath(router, {
  preferredPaths: ["/shipmentOrderEdit"],
  titleKeywords: ["出库"]
}) || "/shipmentOrderEdit";

function handleAdd() {
  router.push({ path: resolveShipmentOrderEditPath(), query: { returnFullPath: route.fullPath } });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id;
  proxy.$modal.confirm('确认删除出库单【' + row.shipmentOrderNo + '】吗？').then(function() {
    loading.value = true;
    return delShipmentOrder(_ids);
  }).then(() => {
    loading.value = true;
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch((e) => {
    if (e === 409) {
      return ElMessageBox.alert(
        '<div>出库单【' + row.shipmentOrderNo + '】已' + (row.shipmentOrderStatus === 1 ? '出库' : '作废') + '，不能删除！</div><div>请联系管理员处理！</div>',
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
  router.push({ path: resolveShipmentOrderEditPath(), query: { id: row.id, returnFullPath: route.fullPath } });
}

function handleView(row) {
  router.push({ path: resolveShipmentOrderEditPath(), query: { id: row.id, mode: 'view', returnFullPath: route.fullPath } });
}

/** 状态判断辅助函数 */
function canEdit(row) {
  return [0, -2].includes(Number(row.shipmentOrderStatus))
}

function canDelete(row) {
  return [0, -2].includes(Number(row.shipmentOrderStatus))
}

function getDisabledTip(row) {
  const statusMap = { 1: '待审批中', 2: '已审批', 3: '已出库', '-1': '已作废', '-2': '已驳回' }
  const label = statusMap[row.shipmentOrderStatus] || '未知状态'
  return '出库单【' + row.shipmentOrderNo + '】' + label + '，无法操作！'
}

/** 提交审批 */
function handleSubmit(row) {
  proxy.$modal.confirm('确认提交出库单【' + row.shipmentOrderNo + '】审批吗？').then(() => {
    return submitForApproval(row.id)
  }).then((res) => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess('提交成功')
      getList()
    } else {
      proxy.$modal.msgError(res.msg)
    }
  })
}

/** 审批 - 跳转到编辑页进行操作 */
function handleApprove(row) {
  router.push({ path: resolveShipmentOrderEditPath(), query: { id: row.id, returnFullPath: route.fullPath } });
}

/** 完成出库 - 跳转到编辑页进行操作 */
function handleDoShipment(row) {
  router.push({ path: resolveShipmentOrderEditPath(), query: { id: row.id, returnFullPath: route.fullPath } });
}

/** 导出按钮操作 */
async function handlePrint(row) {
  const topValueFields = new Set(['basisNo', 'dispatchMode', 'noticeOrg', 'receiveUnit', 'purchaseDate', 'shipmentDate'])
  const res = await getShipmentOrder(row.id)
  const shipmentOrder = res.data
  let table = []
  if (shipmentOrder.details?.length) {
    table = shipmentOrder.details.map((detail, index) => {
      return {
        serialNo: String(index + 1),
        itemName: detail.itemSku.item.itemName,
        skuName: detail.itemSku.skuName,
        unitName: detail.itemSku?.item?.unitOfMeasure || detail.itemSku?.item?.unit || '',
        dispatchLevel: '',
        dispatchQuantity: '',
        shipmentLevel: detail.qualityLevel || '',
        shipmentQuantity: Number(detail.quantity).toFixed(0),
        unitPrice: detail.unitPrice,
        lineAmount: detail.lineAmount,
        remark: detail.remark || ''
      }
    })
  }
  if (table.length < 6) {
    const startIndex = table.length
    table.push(
      ...Array.from({ length: 6 - table.length }, (_, index) => ({
        serialNo: String(startIndex + index + 1),
        itemName: '',
        skuName: '',
        unitName: '',
        dispatchLevel: '',
        dispatchQuantity: '',
        shipmentLevel: '',
        shipmentQuantity: '',
        unitPrice: '',
        lineAmount: '',
        remark: ''
      }))
    )
  }
  const printData = {
    attachmentLabel: '附件 25',
    shipmentOrderNo: shipmentOrder.shipmentOrderNo,
    shipmentOrderType: shipmentOrder.shipmentOrderType,
    shipmentOrderStatus: proxy.selectDictLabel(wms_shipment_status.value, shipmentOrder.shipmentOrderStatus),
    basisNo: shipmentOrder.basisNo,
    dispatchMode: shipmentOrder.dispatchMode,
    noticeOrg: shipmentOrder.noticeOrg,
    receiveUnit: shipmentOrder.receiveUnit,
    purchaseDate: proxy.parseTime(shipmentOrder.purchaseDate, '{y}-{m}-{d}'),
    shipmentDate: proxy.parseTime(shipmentOrder.shipmentDate, '{y}-{m}-{d}'),
    purchaserName: shipmentOrder.purchaserName,
    acceptorName: shipmentOrder.acceptorName,
    keeperName: shipmentOrder.keeperName,
    warehouseName: useWmsStore().warehouseMap.get(shipmentOrder.warehouseId)?.warehouseName,
    warehouse: useWmsStore().warehouseMap.get(shipmentOrder.warehouseId)?.warehouseName,
    areaName: useWmsStore().areaMap.get(shipmentOrder.areaId)?.areaName,
    area: useWmsStore().areaMap.get(shipmentOrder.areaId)?.areaName,
    totalQuantity: Number(shipmentOrder.totalQuantity).toFixed(0),
    receivableAmount: ((shipmentOrder.receivableAmount || shipmentOrder.receivableAmount === 0) ? (shipmentOrder.receivableAmount + '元') : ''),
    createBy: shipmentOrder.createBy,
    createTime: proxy.parseTime(shipmentOrder.createTime, '{mm}-{dd} {hh}:{ii}'),
    updateBy: shipmentOrder.updateBy,
    updateTime: proxy.parseTime(shipmentOrder.updateTime, '{mm}-{dd} {hh}:{ii}'),
    remark: shipmentOrder.remark,
    table
  }
  const template = JSON.parse(JSON.stringify(shipmentPanel))
  template.panels?.forEach(panel => {
    panel.printElements?.forEach(element => {
      const field = element?.options?.field
      if (field && topValueFields.has(field)) {
        element.options.title = printData[field] || ''
        delete element.options.field
        delete element.options.fields
      }
    })
  })
  let printTemplate = new proxy.$hiprint.PrintTemplate({template})
  printTemplate.print(printData, {}, {
    styleHandler: () => {
      let css = '<link href="https://cyl-press.oss-cn-shenzhen.aliyuncs.com/print-lock.css" media="print" rel="stylesheet">';
      return css
    }
  })
}
// 加载用户列表
getUserSelectList().then(res => {
  userList.value = res.data || []
})
getList();
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
