<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="84px">
        <el-form-item label="仓库名称" prop="warehouseName">
          <el-input v-model="queryParams.warehouseName" placeholder="请输入仓库名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16" class="mt20">
      <el-col :xl="15" :lg="14" :md="24" :sm="24" :xs="24">
        <el-card class="warehouse-main-card">
          <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
            <el-col :span="10">
              <div class="page-title">仓库管理</div>
            </el-col>
          </el-row>

          <el-table v-loading="loading" :data="warehouseList" border highlight-current-row @current-change="handleCurrentChange" empty-text="暂无仓库">
            <el-table-column label="仓库名称" prop="warehouseName" min-width="180" />
            <el-table-column label="备注" prop="remark" min-width="220" show-overflow-tooltip />
            <el-table-column label="操作" align="right" width="160">
              <template #default="{ row }">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['wms:warehouse:edit']">修改</el-button>
                <el-button link type="primary" icon="Delete" @click="handleDelete(row)" v-hasPermi="['wms:warehouse:edit']">删除</el-button>
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
      </el-col>

      <el-col :xl="9" :lg="10" :md="24" :sm="24" :xs="24">
        <el-card class="preview-card">
          <template #header>
            <div class="card-header">
              <span>库区预览</span>
              <el-button link type="primary" @click="goAreaPage">前往库区管理</el-button>
            </div>
          </template>
          <el-descriptions :column="1" border class="mb12">
            <el-descriptions-item label="当前仓库">{{ currentWarehouse?.warehouseName || '未选择仓库' }}</el-descriptions-item>
          </el-descriptions>
          <el-table
            v-loading="areaLoading"
            :data="areaPreviewList"
            border
            max-height="360"
            class="area-preview-table"
            empty-text="当前仓库暂无库区"
          >
            <el-table-column label="库区名称" prop="areaName" min-width="120" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="560px" append-to-body :close-on-click-modal="false">
      <div class="form-tip">带 * 为必填项</div>
      <el-form ref="warehouseFormRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item prop="warehouseName">
          <template #label>
            <FormLabelHelp label="仓库名称" purpose="用于标识仓库主体，在库存、单据和布局页面作为主维度展示。" example="主仓、综合器材仓" />
          </template>
          <el-input v-model="form.warehouseName" placeholder="请输入仓库名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Warehouse">
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'
import { listWarehouse, getWarehouse, delWarehouse, addWarehouse, updateWarehouse } from '@/api/wms/warehouse'
import { listArea } from '@/api/wms/area'
import { useWmsStore } from '@/store/modules/wms'
import FormLabelHelp from '@/views/components/FormLabelHelp.vue'
import { resolveRoutePath } from '@/utils/routeResolver'

const { proxy } = getCurrentInstance()
const router = useRouter()
const wmsStore = useWmsStore()

const warehouseList = ref([])
const areaPreviewList = ref([])
const loading = ref(true)
const areaLoading = ref(false)
const buttonLoading = ref(false)
const total = ref(0)
const currentWarehouseId = ref()
const dialog = reactive({
  visible: false,
  title: ''
})

const initFormData = {
  id: undefined,
  warehouseName: undefined,
  remark: undefined
}

const data = reactive({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    warehouseName: undefined
  },
  rules: {
    warehouseName: [
      { required: true, message: '仓库名称不能为空', trigger: 'blur' }
    ]
  }
})

const { form, queryParams, rules } = toRefs(data)

const currentWarehouse = computed(() => warehouseList.value.find(item => item.id === currentWarehouseId.value))

function reset() {
  form.value = { ...initFormData }
  proxy.resetForm('warehouseFormRef')
}

async function getList() {
  loading.value = true
  try {
    const res = await listWarehouse(queryParams.value)
    warehouseList.value = res.rows || []
    total.value = res.total || 0
    if (!warehouseList.value.some(item => item.id === currentWarehouseId.value)) {
      currentWarehouseId.value = warehouseList.value[0]?.id
    }
  } finally {
    loading.value = false
  }
}

async function loadAreaPreview() {
  if (!currentWarehouseId.value) {
    areaPreviewList.value = []
    return
  }
  areaLoading.value = true
  try {
    const res = await listArea({
      pageNum: 1,
      pageSize: 100,
      warehouseId: currentWarehouseId.value
    })
    areaPreviewList.value = res.rows || []
  } finally {
    areaLoading.value = false
  }
}

function handleCurrentChange(row) {
  currentWarehouseId.value = row?.id
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleAdd() {
  reset()
  dialog.visible = true
  dialog.title = '添加仓库'
}

async function handleUpdate(row) {
  reset()
  const res = await getWarehouse(row.id)
  form.value = { ...res.data }
  dialog.visible = true
  dialog.title = '修改仓库'
}

function submitForm() {
  proxy.$refs.warehouseFormRef.validate(async valid => {
    if (!valid) {
      return
    }
    buttonLoading.value = true
    try {
      if (form.value.id) {
        await updateWarehouse(form.value)
        proxy.$modal.msgSuccess('修改成功')
      } else {
        await addWarehouse(form.value)
        proxy.$modal.msgSuccess('新增成功')
      }
      await Promise.all([getList(), wmsStore.getWarehouseList()])
      dialog.visible = false
    } finally {
      buttonLoading.value = false
    }
  })
}

function cancel() {
  dialog.visible = false
  reset()
}

async function handleDelete(row) {
  await proxy.$modal.confirm('确认删除仓库【' + row.warehouseName + '】吗？')
  await delWarehouse(row.id)
  proxy.$modal.msgSuccess('删除成功')
  await Promise.all([getList(), wmsStore.getWarehouseList(), wmsStore.getAreaList()])
}

function goAreaPage() {
  const areaRoute = resolveRoutePath(router, { exactTitles: ['库区管理'] })
  if (!areaRoute) {
    proxy.$modal.msgError('未找到库区管理路由，请确认菜单配置是否已同步')
    return
  }
  router.push(areaRoute)
}

watch(currentWarehouseId, () => {
  loadAreaPreview()
})

onMounted(async () => {
  await getList()
  await loadAreaPreview()
})
</script>

<style scoped lang="scss">
.page-title {
  font-size: 18px;
  font-weight: 600;
}

.page-tip,
.form-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.form-tip {
  margin-bottom: 12px;
}

.toolbar-right {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.preview-card {
  height: 100%;
}

.area-preview-table {
  width: 100%;
}

.warehouse-main-card :deep(.pagination-container) {
  height: auto;
  min-height: 56px;
}

.warehouse-main-card :deep(.pagination-container .el-pagination) {
  position: static;
  justify-content: flex-end;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
