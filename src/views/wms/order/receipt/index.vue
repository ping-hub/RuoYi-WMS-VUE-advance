<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" label-width="88px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="入库状态" prop="receiptOrderStatus">
              <el-select v-model="queryParams.receiptOrderStatus" placeholder="请选择入库状态" clearable style="width: 100%" @change="handleQuery">
                <el-option v-for="item in wms_receipt_status" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="入库类型" prop="receiptOrderType">
              <el-select v-model="queryParams.receiptOrderType" placeholder="请选择入库类型" clearable style="width: 100%" @change="handleQuery">
                <el-option v-for="item in wms_receipt_type" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="入库单号" prop="receiptOrderNo">
              <el-input v-model="queryParams.receiptOrderNo" placeholder="请输入入库单号" clearable @keyup.enter="handleQuery" />
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
        <el-table-column label="单号" align="left" min-width="130">
          <template #default="{ row }">
            <div>{{ row.receiptOrderNo }}</div>
          </template>
        </el-table-column>
        <el-table-column label="入库类型" min-width="85" align="left" prop="receiptOrderType">
          <template #default="{ row }">
            <dict-tag :options="wms_receipt_type" :value="row.receiptOrderType" />
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
        <el-table-column label="入库日期" align="left" min-width="100">
          <template #default="{ row }">
            {{ row.receiptDate ? parseTime(row.receiptDate, '{y}-{m}-{d}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="入库状态" align="center" prop="receiptOrderStatus" min-width="80">
          <template #default="{ row }">
            <dict-tag :options="wms_receipt_status" :value="row.receiptOrderStatus" />
          </template>
        </el-table-column>
        <el-table-column label="数量" align="left" min-width="70">
          <template #default="{ row }">
            <el-statistic :value="Number(row.totalQuantity)" :precision="0"/>
          </template>
        </el-table-column>
        <el-table-column label="金额(元)" align="left" min-width="90">
          <template #default="{ row }">
            <el-statistic v-if="row.payableAmount || row.payableAmount === 0" :value="Number(row.payableAmount)" :precision="2"/>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="100" show-overflow-tooltip />
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
              :disabled="scope.row.receiptOrderStatus === 0"
              :content="'入库单【' + scope.row.receiptOrderNo + '】已' + (scope.row.receiptOrderStatus === 1 ? '入库' : '作废') + '，无法删除！' "
            >
              <template #reference>
                <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:receipt:all']" :disabled="[-1, 1].includes(scope.row.receiptOrderStatus)">删除</el-button>
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
const { wms_receipt_status, wms_receipt_type } = proxy.useDict(
  "wms_receipt_status",
  "wms_receipt_type"
);
const receiptOrderList = ref([]);
const loading = ref(true);
const total = ref(0);
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    receiptOrderNo: undefined,
    receiptOrderType: undefined,
    basisNo: undefined,
    receiveUnit: undefined,
    payableAmount: undefined,
    receiptOrderStatus: undefined,
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
        '<div>入库单【' + row.receiptOrderNo + '】已' + (row.receiptOrderStatus === 1 ? '入库' : '作废') + '，不能删除！</div><div>请联系管理员处理！</div>',
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
  const topValueFields = new Set(['basisNo', 'dispatchMode', 'noticeOrg', 'receiveUnit', 'purchaseDate', 'receiptDate'])
  const res = await getReceiptOrder(row.id)
  const receiptOrder = res.data
  let table = []
  if (receiptOrder.details?.length) {
    table = receiptOrder.details.map((detail, index) => ({
      serialNo: String(index + 1),
      itemName: detail.itemSku?.item?.itemName,
      skuName: detail.itemSku?.skuName,
      unitName: detail.itemSku?.item?.unitOfMeasure || detail.itemSku?.item?.unit || '',
      dispatchLevel: '',
      dispatchQuantity: '',
      receiptLevel: detail.qualityLevel || '',
      receiptQuantity: Number(detail.quantity || 0).toFixed(0),
      unitPrice: detail.unitPrice,
      lineAmount: detail.lineAmount,
      remark: detail.remark || ''
    }))
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
        receiptLevel: '',
        receiptQuantity: '',
        unitPrice: '',
        lineAmount: '',
        remark: ''
      }))
    )
  }
  const printData = {
    attachmentLabel: '附件 24',
    receiptOrderNo: receiptOrder.receiptOrderNo,
    receiptOrderType: receiptOrder.receiptOrderType,
    receiptOrderStatus: proxy.selectDictLabel(wms_receipt_status.value, receiptOrder.receiptOrderStatus),
    basisNo: receiptOrder.basisNo,
    dispatchMode: receiptOrder.dispatchMode,
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
  const template = JSON.parse(JSON.stringify(receiptPanel))
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
