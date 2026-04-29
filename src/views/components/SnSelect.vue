<template>
  <div class="sn-select">
    <el-button type="primary" icon="Pointer" @click="handleOpen">选择SN码</el-button>
    <div class="sn-list mt20">
      <el-tag
        v-for="(sn, index) in modelValue"
        :key="sn.id || index"
        closable
        @close="handleRemove(sn)"
        class="mr10 mb10"
      >
        {{ sn.snCode }}
      </el-tag>
      <span v-if="modelValue.length === 0" class="text-muted">暂未选择SN码</span>
    </div>

    <el-dialog title="选择SN码" v-model="open" width="900px" append-to-body>
      <el-form :model="queryParams" :inline="true" label-width="80px">
        <el-form-item label="SN码" prop="snCode">
          <el-input v-model="queryParams.snCode" placeholder="请输入SN码" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="queryParams.warehouseId" clearable placeholder="请选择仓库" @change="handleWarehouseChange">
            <el-option
              v-for="item in useWmsStore().warehouseList"
              :key="item.id"
              :label="item.warehouseName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="库区" prop="areaId">
          <el-select v-model="queryParams.areaId" clearable placeholder="请选择库区">
            <el-option
              v-for="item in areaList"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        ref="tableRef"
        :data="snList"
        @selection-change="handleSelectionChange"
        border
        empty-text="暂无数据"
        v-loading="loading"
        max-height="400"
        class="mt20"
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column label="SN码" prop="snCode" align="center" width="150"></el-table-column>
        <el-table-column label="商品信息" align="left" width="200">
          <template #default="{ row }">
            <div>商品：{{ row.itemName }}</div>
            <div>SKU：{{ row.skuName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="库位" align="left" width="150">
          <template #default="{ row }">
            <div>仓库：{{ row.warehouseName }}</div>
            <div>库区：{{ row.areaName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="批号" prop="batchNo" align="center" width="120"></el-table-column>
        <el-table-column label="生产日期" prop="productionDate" align="center" width="120"></el-table-column>
        <el-table-column label="过期日期" prop="expirationDate" align="center" width="120"></el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getSnList"
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取 消</el-button>
          <el-button type="primary" @click="handleConfirm" :disabled="selectedSnList.length === 0">
            确定选择({{ selectedSnList.length }})
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listItemSn } from '@/api/wms/itemSn'
import { listArea } from '@/api/wms/area'
import { useWmsStore } from '@/store/modules/wms'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  skuId: {
    type: Number,
    default: null
  },
  warehouseId: {
    type: Number,
    default: null
  },
  areaId: {
    type: Number,
    default: null
  },
  status: {
    type: Number,
    default: 0 // 默认只查询在库的SN
  }
})

const emit = defineEmits(['update:modelValue'])

const wmsStore = useWmsStore()

const open = ref(false)
const loading = ref(true)
const snList = ref([])
const areaList = ref([])
const selectedSnList = ref([])
const total = ref(0)
const tableRef = ref(null)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    querySnCode: null,
    querySkuId: props.skuId,
    queryWarehouseId: props.warehouseId,
    queryAreaId: props.areaId,
    queryStatus: props.status
  }
})

const { queryParams } = toRefs(data)

/** 打开对话框 */
function handleOpen() {
  open.value = true
  resetQuery()
  getSnList()
}

/** 关闭对话框 */
function handleCancel() {
  open.value = false
}

/** 重置查询 */
function resetQuery() {
  queryParams.value.querySnCode = null
  queryParams.value.querySkuId = props.skuId
  queryParams.value.queryWarehouseId = props.warehouseId
  queryParams.value.queryAreaId = props.areaId
  queryParams.value.queryStatus = props.status
  queryParams.value.pageNum = 1
  if (props.warehouseId) {
    getAreaList(props.warehouseId)
  }
  getSnList()
}

/** 查询库区列表 */
function getAreaList(warehouseId) {
  listArea({ warehouseId: warehouseId }).then(response => {
    areaList.value = response.rows
  })
}

/** 仓库变化时查询库区 */
function handleWarehouseChange(warehouseId) {
  queryParams.value.queryAreaId = null
  if (warehouseId) {
    getAreaList(warehouseId)
  } else {
    areaList.value = []
  }
  getSnList()
}

/** 查询SN列表 */
function getSnList() {
  loading.value = true
  listItemSn(queryParams.value).then(response => {
    snList.value = response.rows
    total.value = response.total
    loading.value = false
    // 恢复已选择的项
    nextTick(() => {
      if (tableRef.value) {
        props.modelValue.forEach(sn => {
          const row = snList.value.find(item => item.snCode === sn.snCode)
          if (row) {
            tableRef.value.toggleRowSelection(row, true)
          }
        })
      }
    })
  })
}

/** 搜索 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getSnList()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  selectedSnList.value = selection
}

/** 确认选择 */
function handleConfirm() {
  const newValue = [...props.modelValue, ...selectedSnList.value.filter(sn =>
    !props.modelValue.some(selected => selected.snCode === sn.snCode)
  )]
  emit('update:modelValue', newValue)
  open.value = false
}

/** 删除SN码 */
function handleRemove(sn) {
  const newValue = props.modelValue.filter(item => item.snCode !== sn.snCode)
  emit('update:modelValue', newValue)
}

/** 初始化 */
onMounted(() => {
  if (props.warehouseId) {
    getAreaList(props.warehouseId)
  }
})
</script>

<style scoped>
.sn-select {
  width: 100%;
}

.sn-list {
  min-height: 60px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.text-muted {
  color: #909399;
  font-size: 14px;
}
</style>
