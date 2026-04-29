<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px">
        <el-form-item label="SN码" prop="querySnCode">
          <el-input v-model="queryParams.querySnCode" placeholder="请输入SN码" clearable @keyup.enter="handleQuery"/>
        </el-form-item>
        <el-form-item label="商品名称" prop="queryItemId">
          <el-select v-model="queryParams.queryItemId" clearable filterable placeholder="请选择商品" style="width: 200px">
            <el-option
              v-for="item in itemList"
              :key="item.id"
              :label="item.itemName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="SKU名称" prop="querySkuId">
          <el-select v-model="queryParams.querySkuId" clearable filterable placeholder="请选择SKU" style="width: 200px">
            <el-option
              v-for="item in skuList"
              :key="item.id"
              :label="item.skuName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="仓库" prop="queryWarehouseId">
          <el-select v-model="queryParams.queryWarehouseId" clearable placeholder="请选择仓库" style="width: 200px" @change="handleWarehouseChange">
            <el-option
              v-for="item in useWmsStore().warehouseList"
              :key="item.id"
              :label="item.warehouseName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="库区" prop="queryAreaId">
          <el-select v-model="queryParams.queryAreaId" clearable placeholder="请选择库区" style="width: 200px">
            <el-option
              v-for="item in areaList"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="queryStatus">
          <el-select v-model="queryParams.queryStatus" clearable placeholder="请选择状态" style="width: 150px">
            <el-option label="在库" :value="0"></el-option>
            <el-option label="已出库" :value="1"></el-option>
            <el-option label="损坏" :value="2"></el-option>
            <el-option label="冻结" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <div style="display: flex;align-items: start;justify-content: space-between">
        <span class="mr10" style="font-size: 18px;">SN码列表</span>
        <div>
          <el-button type="primary" plain icon="Plus" @click="handleAdd">新增SN</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">批量删除</el-button>
          <el-button type="warning" plain icon="Upload" @click="handleExport">导出</el-button>
        </div>
      </div>

      <el-table :data="itemSnList" @selection-change="handleSelectionChange" border empty-text="暂无数据" v-loading="loading" class="mt20">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column label="SN码" prop="snCode" align="center" width="150"></el-table-column>
        <el-table-column label="商品信息" align="left" width="200">
          <template #default="{ row }">
            <div>商品：{{ row.itemName }}</div>
            <div>SKU：{{ row.skuName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="库位" align="left" width="200">
          <template #default="{ row }">
            <div>仓库：{{ row.warehouseName }}</div>
            <div>库区：{{ row.areaName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="statusName" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="批号" prop="batchNo" align="center" width="120"></el-table-column>
        <el-table-column label="生产日期" prop="productionDate" align="center" width="120"></el-table-column>
        <el-table-column label="过期日期" prop="expirationDate" align="center" width="120"></el-table-column>
        <el-table-column label="入库单号" prop="receiptOrderNo" align="center" width="150"></el-table-column>
        <el-table-column label="出库单号" prop="shipmentOrderNo" align="center" width="150"></el-table-column>
        <el-table-column label="备注" prop="remark" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="handleDetail(row)">详情</el-button>
            <el-button link type="primary" icon="Edit" @click="handleEdit(row)" v-if="row.status === 0">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(row)" v-if="row.status === 0">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 添加/修改对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="itemSnFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="SN码" prop="snCode">
          <el-input v-model="form.snCode" placeholder="请输入SN码" clearable />
        </el-form-item>
        <el-form-item label="SKU" prop="skuId">
          <el-select v-model="form.skuId" filterable placeholder="请选择SKU" @change="handleSkuChange">
            <el-option
              v-for="item in skuList"
              :key="item.id"
              :label="item.skuName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="form.warehouseId" placeholder="请选择仓库" @change="handleWarehouseChangeForm">
            <el-option
              v-for="item in useWmsStore().warehouseList"
              :key="item.id"
              :label="item.warehouseName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="库区" prop="areaId">
          <el-select v-model="form.areaId" placeholder="请选择库区">
            <el-option
              v-for="item in formAreaList"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="在库" :value="0"></el-option>
            <el-option label="损坏" :value="2"></el-option>
            <el-option label="冻结" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="批号" prop="batchNo">
          <el-input v-model="form.batchNo" placeholder="请输入批号" clearable />
        </el-form-item>
        <el-form-item label="生产日期" prop="productionDate">
          <el-date-picker
            v-model="form.productionDate"
            type="date"
            placeholder="选择生产日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="过期日期" prop="expirationDate">
          <el-date-picker
            v-model="form.expirationDate"
            type="date"
            placeholder="选择过期日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="SN详情" v-model="detailOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="SN码">{{ detailForm.snCode }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailForm.statusName }}</el-descriptions-item>
        <el-descriptions-item label="商品">{{ detailForm.itemName }}</el-descriptions-item>
        <el-descriptions-item label="SKU">{{ detailForm.skuName }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{ detailForm.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="库区">{{ detailForm.areaName }}</el-descriptions-item>
        <el-descriptions-item label="批号">{{ detailForm.batchNo }}</el-descriptions-item>
        <el-descriptions-item label="生产日期">{{ detailForm.productionDate }}</el-descriptions-item>
        <el-descriptions-item label="过期日期">{{ detailForm.expirationDate }}</el-descriptions-item>
        <el-descriptions-item label="入库单号">{{ detailForm.receiptOrderNo }}</el-descriptions-item>
        <el-descriptions-item label="出库单号">{{ detailForm.shipmentOrderNo }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailForm.remark }}</el-descriptions-item>
      </el-descriptions>

      <!-- SN操作历史 -->
      <div class="mt20">
        <h4>操作历史</h4>
        <el-table :data="orderSnHistory" border empty-text="暂无数据" class="mt10">
          <el-table-column label="单据类型" prop="orderTypeName" align="center" width="120"></el-table-column>
          <el-table-column label="单据ID" prop="orderId" align="center" width="120"></el-table-column>
          <el-table-column label="创建时间" prop="createTime" align="center" width="180"></el-table-column>
        </el-table>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ItemSn">
import { listItemSn, getItemSn, addItemSn, updateItemSn, delItemSn, delItemSnBatch, exportItemSn } from '@/api/wms/itemSn'
import { listItem } from '@/api/wms/item'
import { listItemSku } from '@/api/wms/itemSku'
import { listArea } from '@/api/wms/area'
import { listOrderSnBySnId } from '@/api/wms/orderSn'
import { useWmsStore } from '@/store/modules/wms'

const { proxy } = getCurrentInstance()

const wmsStore = useWmsStore()

const itemSnList = ref([])
const itemList = ref([])
const skuList = ref([])
const areaList = ref([])
const formAreaList = ref([])
const orderSnHistory = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const open = ref(false)
const detailOpen = ref(false)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    querySnCode: null,
    queryItemId: null,
    querySkuId: null,
    queryWarehouseId: null,
    queryAreaId: null,
    queryStatus: null
  },
  detailForm: {},
  rules: {
    snCode: [
      { required: true, message: 'SN码不能为空', trigger: 'blur' }
    ],
    skuId: [
      { required: true, message: 'SKU不能为空', trigger: 'change' }
    ],
    warehouseId: [
      { required: true, message: '仓库不能为空', trigger: 'change' }
    ],
    areaId: [
      { required: true, message: '库区不能为空', trigger: 'change' }
    ],
    status: [
      { required: true, message: '状态不能为空', trigger: 'change' }
    ]
  }
})

const { queryParams, form, detailForm, rules } = toRefs(data)

/** 查询商品列表 */
function getItemList() {
  listItem().then(response => {
    itemList.value = response.data
    console.log(itemList)
  })
}

/** 查询SKU列表 */
function getSkuList() {
  listItemSku({}).then(response => {
    skuList.value = response.rows
  })
}

/** 查询库区列表 */
function getAreaList(warehouseId) {
  listArea({ warehouseId: warehouseId }).then(response => {
    if (warehouseId) {
      areaList.value = response.rows
    } else {
      formAreaList.value = response.rows
    }
  })
}

/** 查询SN列表 */
function getList() {
  loading.value = true
  listItemSn(queryParams.value).then(response => {
    itemSnList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryFormRef')
  handleQuery()
}

/** 仓库变化时查询库区 */
function handleWarehouseChange(warehouseId) {
  queryParams.value.queryAreaId = null
  if (warehouseId) {
    getAreaList(warehouseId)
  } else {
    areaList.value = []
  }
}

/** 表单中仓库变化时查询库区 */
function handleWarehouseChangeForm(warehouseId) {
  form.value.areaId = null
  if (warehouseId) {
    listArea({ warehouseId: warehouseId }).then(response => {
      formAreaList.value = response.rows
    })
  } else {
    formAreaList.value = []
  }
}

/** SKU变化时自动填充商品信息 */
function handleSkuChange(skuId) {
  const sku = skuList.value.find(item => item.id === skuId)
  if (sku) {
    form.value.itemId = sku.itemId
  }
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  resetForm()
  open.value = true
  title.value = '新增SN'
}

/** 修改按钮操作 */
function handleEdit(row) {
  resetForm()
  const id = row.id || ids.value[0]
  getItemSn(id).then(response => {
    form.value = response.data
    handleWarehouseChangeForm(form.value.warehouseId)
    open.value = true
    title.value = '修改SN'
  })
}

/** 详情按钮操作 */
function handleDetail(row) {
  detailForm.value = { ...row }
  // 查询操作历史
  listOrderSnBySnId(row.id).then(response => {
    orderSnHistory.value = response.data.map(item => ({
      ...item,
      orderTypeName: getOrderTypeName(item.orderType)
    }))
  })
  detailOpen.value = true
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['itemSnFormRef'].validate(valid => {
    if (valid) {
      if (form.value.id) {
        updateItemSn(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addItemSn(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const deleteIds = row.id ? [row.id] : ids.value
  const deleteNames = row.snCode ? [row.snCode] : ids.value.map(id => {
    const item = itemSnList.value.find(row => row.id === id)
    return item ? item.snCode : ''
  })
  proxy.$modal.confirm('是否确认删除SN码为"' + deleteNames.join('、') + '"的数据项？').then(() => {
    if (row.id) {
      delItemSn(deleteIds[0]).then(() => {
        getList()
        proxy.$modal.msgSuccess('删除成功')
      })
    } else {
      delItemSnBatch(deleteIds).then(() => {
        getList()
        proxy.$modal.msgSuccess('删除成功')
      })
    }
  })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('wms/itemSn/export', {
    ...queryParams.value
  }, `SN码_${new Date().getTime()}.xlsx`)
}

/** 表单重置 */
function resetForm() {
  form.value = {
    id: null,
    snCode: null,
    skuId: null,
    itemId: null,
    warehouseId: null,
    areaId: null,
    status: 0,
    batchNo: null,
    productionDate: null,
    expirationDate: null,
    remark: null
  }
  formAreaList.value = []
  proxy.resetForm('itemSnFormRef')
}

/** 获取状态标签类型 */
function getStatusType(status) {
  const map = {
    0: 'success',
    1: 'info',
    2: 'danger',
    3: 'warning'
  }
  return map[status] || 'info'
}

/** 获取单据类型名称 */
function getOrderTypeName(orderType) {
  const map = {
    1: '入库',
    2: '出库',
    3: '移库',
    4: '盘点'
  }
  return map[orderType] || '未知'
}

getItemList()
getSkuList()
getList()
</script>
