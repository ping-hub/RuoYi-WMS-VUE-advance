<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="我的待办" name="pending" />
      <el-tab-pane label="已办结" name="done" />
    </el-tabs>

    <el-card>
      <el-form :model="queryParams" ref="queryRef" label-width="88px" class="query-form">
        <el-row :gutter="16">
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24" v-if="activeTab === 'pending'">
            <el-form-item label="待办类型" prop="taskType">
              <el-select v-model="queryParams.taskType" clearable placeholder="全部" style="width: 100%" @change="handleQuery">
                <el-option v-for="item in taskTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
            <el-form-item label="单号" prop="orderNo">
              <el-input v-model="queryParams.orderNo" placeholder="请输入单号" clearable @keyup.enter="handleQuery" />
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
      <el-row :gutter="10" class="mb8">
        <el-col :span="6"><span style="font-size: large">{{ activeTab === 'pending' ? '我的待办' : '已办结' }}</span></el-col>
      </el-row>

      <el-table v-loading="loading" :data="taskList" border class="mt20" :empty-text="activeTab === 'pending' ? '暂无待办事项' : '暂无已办结数据'">
        <el-table-column label="单据类型" align="center" min-width="90">
          <template #default="{ row }">
            <el-tag :type="orderTypeTagMap[row.orderType] || 'info'" size="small">{{ row.orderTypeLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="单号" align="left" prop="orderNo" min-width="130" show-overflow-tooltip />
        <el-table-column label="事项" align="left" min-width="110">
          <template #default="{ row }">
            <el-tag :type="taskTagMap[row.taskType] || 'info'" size="small" effect="plain">{{ row.taskLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请人" align="left" min-width="80" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getNickName(row.applicantName) }}
          </template>
        </el-table-column>
        <el-table-column label="仓库" align="left" min-width="90">
          <template #default="{ row }">
            {{ row.warehouseName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="left" min-width="110">
          <template #default="{ row }">
            {{ row.createTime ? parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="activeTab === 'done'" label="办结时间" align="left" min-width="110">
          <template #default="{ row }">
            {{ row.finishTime ? parseTime(row.finishTime, '{y}-{m}-{d} {h}:{i}') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="100" show-overflow-tooltip />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleGoProcess(row)">{{ row.actionLabel || (activeTab === 'pending' ? '去处理' : '查看') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </el-row>
    </el-card>
  </div>
</template>

<script setup name="MyTasks">
import { getCurrentInstance, reactive, ref, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { listMyTasks } from '@/api/wms/myTasks'
import { getUserSelectList } from '@/api/wms/common'
import { resolveRoutePath } from '@/utils/routeResolver'

const { proxy } = getCurrentInstance()
const router = useRouter()

// Tab状态：pending=待办，done=已办结
const activeTab = ref('pending')

const taskList = ref([])
const loading = ref(true)
const total = ref(0)

// 用户列表，用于将用户名映射为中文昵称
const userList = ref([])
const getNickName = (name) => {
  if (!name) return '-'
  const u = userList.value.find(x => x.userName === name)
  return u ? u.nickName : name
}

// 待办类型选项（后续扩展其他单据时追加即可）
const taskTypeOptions = ref([
  { value: 'pending_approval', label: '待审批' },
  { value: 'pending_execute', label: '待执行' },
  { value: 'pending_review', label: '待复核' },
  { value: 'rejected', label: '已驳回待修改' },
  { value: 'borrow_timeout', label: '借用超时预警' },
])

// 单据类型 → Tag 颜色
const orderTypeTagMap = {
  shipment: 'warning',
  receipt: 'success',
  movement: '',
  check: 'danger',
  borrowOrder: 'danger',
}

// 待办类型 → Tag 颜色
const taskTagMap = {
  pending_approval: 'warning',
  pending_execute: '',
  pending_review: 'success',
  rejected: 'danger',
  borrow_timeout: 'danger',
  done: 'success',
}

// 单据类型 → 编辑页路由
const orderEditRouteMap = {
  shipment: { preferredPaths: ['/shipmentOrderEdit'], titleKeywords: ['出库'] },
  receipt: { preferredPaths: ['/receiptOrderEdit'], titleKeywords: ['入库'] },
  movement: { preferredPaths: ['/movementOrderEdit'], titleKeywords: ['调拨'] },
  check: { preferredPaths: ['/checkOrderEdit'], titleKeywords: ['盘点'] },
  borrowOrder: { preferredPaths: ['/borrowOrderEdit'], titleKeywords: ['借用'] },
}

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    taskType: undefined,
    orderNo: undefined,
  },
})
const { queryParams } = toRefs(data)

/** Tab切换 */
function handleTabChange(tab) {
  activeTab.value = tab
  // 重置筛选条件
  queryParams.value.taskType = undefined
  queryParams.value.orderNo = undefined
  queryParams.value.pageNum = 1
  getList()
}

/** 查询列表 */
function getList() {
  loading.value = true
  const query = { ...queryParams.value, status: activeTab.value }
  Object.keys(query).forEach(key => {
    if (query[key] === '' || query[key] === null || typeof query[key] === 'undefined') {
      delete query[key]
    }
  })
  listMyTasks(query).then(response => {
    taskList.value = response.rows || []
    total.value = response.total || 0
  }).finally(() => {
    loading.value = false
  })
}

/** 搜索 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 去处理/查看：跳转到对应单据编辑页 */
function handleGoProcess(row) {
  const routeConfig = orderEditRouteMap[row.orderType]
  if (!routeConfig) {
    proxy.$modal.msgWarning('暂不支持该单据类型的操作')
    return
  }
  const path = resolveRoutePath(router, routeConfig) || routeConfig.preferredPaths[0]
  // 已办结以只读模式打开
  const query = { id: row.orderId, returnFullPath: router.currentRoute.value.fullPath }
  if (activeTab.value === 'done') {
    query.view = 'true'
  }
  router.push({ path, query })
}

// 加载用户列表
getUserSelectList().then(res => {
  userList.value = res.data || []
})
getList()
</script>

<style lang="scss">
.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
