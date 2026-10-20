<template>
  <div class="app-container">
    <el-card>
      <el-form ref="queryRef" :model="queryParams" label-width="88px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="设备ID" prop="deviceId">
              <el-input v-model="queryParams.deviceId" placeholder="请输入智能主机设备ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="设备名称" prop="deviceName">
              <el-input v-model="queryParams.deviceName" placeholder="请输入设备名称" clearable @keyup.enter="handleQuery" />
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

    <el-row :gutter="16" class="mt20">
      <el-col :span="24">
        <el-card>
          <el-row :gutter="10" class="mb8" type="flex" justify="space-between" align="middle">
            <el-col :span="10">
              <div class="page-title">环境设备配置</div>
            </el-col>
            <el-col :span="2" class="toolbar-right">
              <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['wms:envDevice:edit']">新增</el-button>
            </el-col>
          </el-row>

          <el-table v-loading="loading" :data="deviceList" border empty-text="暂无设备配置">
            <el-table-column label="设备ID" prop="deviceId" width="120" />
            <el-table-column label="设备名称" prop="deviceName" min-width="140" show-overflow-tooltip />
            <el-table-column label="所属仓库" prop="warehouse" min-width="120" show-overflow-tooltip />
            <el-table-column label="设备类型" prop="deviceType" width="100" />
            <el-table-column label="位置" prop="location" min-width="140" show-overflow-tooltip />
            <el-table-column label="启用状态" width="90" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.enabled"
                  :active-value="1"
                  :inactive-value="0"
                  @change="(val) => handleStatusChange(row, val)"
                ></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
            <el-table-column label="操作" align="right" width="160">
              <template #default="{ row }">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['wms:envDevice:edit']">修改</el-button>
                <el-button link type="primary" icon="Delete" @click="handleDelete(row)" v-hasPermi="['wms:envDevice:edit']">删除</el-button>
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
    </el-row>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="560px" append-to-body :close-on-click-modal="false">
      <div class="form-tip">带 * 为必填项</div>
      <el-form ref="deviceFormRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="设备ID" prop="deviceId">
          <el-input v-model="form.deviceId" placeholder="智能主机设备ID，如 162" maxlength="32" />
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="form.deviceName" placeholder="请输入设备名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="所属仓库" prop="warehouse">
          <el-input v-model="form.warehouse" placeholder="请输入所属仓库" maxlength="50" />
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="form.deviceType" placeholder="请选择或输入设备类型" filterable allow-create clearable style="width: 100%">
            <el-option v-for="t in deviceTypeOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入安装位置" maxlength="100" />
        </el-form-item>
        <el-form-item label="启用状态" prop="enabled">
          <el-radio-group v-model="form.enabled">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
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

<script setup name="EnvDevice">
import { getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue'
import { listEnvDevice, getEnvDevice, addEnvDevice, updateEnvDevice, delEnvDevice, changeEnvDeviceStatus } from '@/api/wms/envDevice'

const { proxy } = getCurrentInstance()

const deviceList = ref([])
const loading = ref(true)
const buttonLoading = ref(false)
const total = ref(0)
const dialog = reactive({
  visible: false,
  title: ''
})

// 设备类型常用选项（允许手动输入新增）
const deviceTypeOptions = ['温度', '湿度', '温湿度', '烟感']

const initFormData = {
  id: undefined,
  deviceId: undefined,
  deviceName: undefined,
  warehouse: undefined,
  deviceType: undefined,
  location: undefined,
  enabled: 1,
  remark: undefined
}

const data = reactive({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deviceId: undefined,
    deviceName: undefined
  },
  rules: {
    deviceId: [
      { required: true, message: '设备ID不能为空', trigger: 'blur' }
    ],
    deviceName: [
      { required: true, message: '设备名称不能为空', trigger: 'blur' }
    ]
  }
})

const { form, queryParams, rules } = toRefs(data)

function reset() {
  form.value = { ...initFormData }
  proxy.resetForm('deviceFormRef')
}

async function getList() {
  loading.value = true
  try {
    const res = await listEnvDevice(queryParams.value)
    deviceList.value = res.rows || []
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
  dialog.visible = true
  dialog.title = '添加设备'
}

async function handleUpdate(row) {
  reset()
  const res = await getEnvDevice(row.id)
  form.value = { ...res.data }
  dialog.visible = true
  dialog.title = '修改设备'
}

function submitForm() {
  proxy.$refs.deviceFormRef.validate(async valid => {
    if (!valid) {
      return
    }
    buttonLoading.value = true
    try {
      if (form.value.id) {
        await updateEnvDevice(form.value)
        proxy.$modal.msgSuccess('修改成功')
      } else {
        await addEnvDevice(form.value)
        proxy.$modal.msgSuccess('新增成功')
      }
      await getList()
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

async function handleStatusChange(row, val) {
  try {
    await changeEnvDeviceStatus(row.id, val)
    proxy.$modal.msgSuccess(val === 1 ? '已启用' : '已停用')
  } catch (e) {
    row.enabled = val === 1 ? 0 : 1
  }
}

async function handleDelete(row) {
  await proxy.$modal.confirm('确认删除设备【' + row.deviceName + '】吗？')
  await delEnvDevice(row.id)
  proxy.$modal.msgSuccess('删除成功')
  await getList()
}

onMounted(() => {
  getList()
})
</script>
