<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="80px">
        <el-form-item label="库区名称" prop="areaName">
          <el-input v-model="queryParams.areaName" placeholder="请输入库区名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="所属仓库" prop="warehouseId">
          <el-select v-model="queryParams.warehouseId" placeholder="请选择所属仓库" clearable filterable style="width: 220px">
            <el-option v-for="item in wmsStore.warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id" />
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
        <el-col :span="8">
          <div class="page-title">库区管理</div>
        </el-col>
        <el-col :span="4" class="toolbar-right">
          <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wms:area:edit']">新增库区</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="areaList" border empty-text="暂无库区">
        <el-table-column label="库区名称" prop="areaName" min-width="160" />
        <el-table-column label="所属仓库" prop="warehouseName" min-width="160" />
        <el-table-column label="备注" prop="remark" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" align="right" width="160">
          <template #default="{ row }">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['wms:area:edit']">修改</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(row)" v-hasPermi="['wms:area:edit']">删除</el-button>
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

    <el-drawer :title="title" v-model="open" append-to-body size="40%" :close-on-click-modal="false">
      <div class="form-tip">带 * 为必填项</div>
      <el-form ref="areaRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item prop="areaName">
          <template #label>
            <FormLabelHelp label="库区名称" purpose="标识仓库下的业务分区，便于货架和货位归属管理。" example="器材待检区、成品存放区" />
          </template>
          <el-input v-model="form.areaName" placeholder="请输入库区名称" />
        </el-form-item>
        <el-form-item label="所属仓库" prop="warehouseId">
          <el-select v-model="form.warehouseId" placeholder="请选择所属仓库" filterable style="width: 100%">
            <el-option v-for="item in wmsStore.warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id" />
          </el-select>
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
    </el-drawer>
  </div>
</template>

<script setup name="Area">
import { getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue'
import { ElMessageBox } from 'element-plus'
import { addArea, delArea, getArea, listArea, updateArea } from '@/api/wms/area'
import { useWmsStore } from '@/store/modules/wms'
import FormLabelHelp from '@/views/components/FormLabelHelp.vue'

const { proxy } = getCurrentInstance()
const wmsStore = useWmsStore()

const areaList = ref([])
const loading = ref(true)
const buttonLoading = ref(false)
const total = ref(0)
const open = ref(false)
const title = ref('')

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    areaName: undefined,
    warehouseId: undefined
  },
  rules: {
    areaName: [
      { required: true, message: '库区名称不能为空', trigger: 'blur' }
    ],
    warehouseId: [
      { required: true, message: '所属仓库不能为空', trigger: 'change' }
    ]
  }
})

const { form, queryParams, rules } = toRefs(data)

function resolveWarehouseId(warehouseId) {
  if (warehouseId === undefined || warehouseId === null || warehouseId === '') {
    return undefined
  }
  const matchedWarehouse = wmsStore.warehouseList.find(item => String(item.id) === String(warehouseId))
  return matchedWarehouse ? matchedWarehouse.id : warehouseId
}

function resolveWarehouseName(warehouseId) {
  if (warehouseId === undefined || warehouseId === null || warehouseId === '') {
    return ''
  }
  return wmsStore.warehouseList.find(item => String(item.id) === String(warehouseId))?.warehouseName || ''
}

function reset() {
  form.value = {
    id: undefined,
    areaName: undefined,
    warehouseId: undefined,
    remark: undefined
  }
  proxy.resetForm('areaRef')
}

async function getList() {
  loading.value = true
  try {
    const res = await listArea(queryParams.value)
    areaList.value = (res.rows || []).map(item => ({
      ...item,
      warehouseName: item.warehouseName || resolveWarehouseName(item.warehouseId)
    }))
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
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
  open.value = true
  title.value = '添加库区'
}

async function handleUpdate(row) {
  reset()
  const res = await getArea(row.id)
  form.value = {
    ...res.data,
    warehouseId: resolveWarehouseId(res.data?.warehouseId)
  }
  open.value = true
  title.value = '修改库区'
}

function submitForm() {
  proxy.$refs.areaRef.validate(async valid => {
    if (!valid) {
      return
    }
    buttonLoading.value = true
    try {
      if (form.value.id) {
        await updateArea(form.value)
        proxy.$modal.msgSuccess('修改成功')
      } else {
        await addArea(form.value)
        proxy.$modal.msgSuccess('新增成功')
      }
      await Promise.all([getList(), wmsStore.getAreaList()])
      open.value = false
    } finally {
      buttonLoading.value = false
    }
  })
}

function cancel() {
  open.value = false
  reset()
}

async function handleDelete(row) {
  await proxy.$modal.confirm('确认删除库区【' + row.areaName + '】吗？')
  try {
    await delArea(row.id)
    proxy.$modal.msgSuccess('删除成功')
    await Promise.all([getList(), wmsStore.getAreaList()])
  } catch (error) {
    if (error === 409) {
      return ElMessageBox.alert(
        '<div>库区【' + row.areaName + '】已有业务数据关联，不能删除！</div><div>请联系管理员处理。</div>',
        '系统提示',
        { dangerouslyUseHTMLString: true }
      )
    }
    throw error
  }
}

onMounted(async () => {
  await wmsStore.getWarehouseList()
  await getList()
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
</style>
