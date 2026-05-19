<template>
  <el-drawer :model-value="show" title="器材选择" @close="handleCancelClick" :size="size" :close-on-click-modal="false" append-to-body>
        <el-form :inline="true" label-width="68px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="器材名称">
                <el-input v-model="query.itemName" clearable placeholder="器材名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="器材编号">
                <el-input class="w200" v-model="query.itemCode" clearable placeholder="器材编号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="规格名称">
                <el-input class="w200" v-model="query.skuName" clearable placeholder="规格名称"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="规格编号">
                <el-input class="w200" v-model="query.barcode" clearable placeholder="规格编号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-button type="primary" @click="clickQuery">查询</el-button>
            </el-col>
          </el-row>
        </el-form>
            <el-table :data="list" @selection-change="handleSelectionChange" border :row-key="getRowKey" empty-text="暂无器材" v-loading="loading" ref="skuSelectFormRef" cell-class-name="my-cell">
              <el-table-column type="selection" width="55" :reserve-selection="true" v-if="!singleSelect"/>
              <el-table-column label="器材信息" prop="itemId">
                <template #default="{ row }">
                  <div>{{ row.item.itemName }}</div>
                  <div v-if="row.item.itemCode">编号：{{ row.item.itemCode }}</div>
                  <div>规格：{{ row.skuName || '-' }}</div>
                  <div v-if="row.productIdentifier">产品标识：{{ row.productIdentifier }}</div>
                  <div v-if="row.qualityGrade">质量等级：{{ row.qualityGrade }}</div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" v-if="singleSelect" align="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="handleChooseSku(row)">选择</el-button>
                </template>
              </el-table-column>
            </el-table>
    <el-row>
      <pagination v-show="total > 0" :total="total" :page-sizes="[5, 10, 20, 50]" v-model:limit="pageReq.size" v-model:page="pageReq.page"
                  @pagination="getList" class="mr10"/>
    </el-row>
    <template v-slot:footer>
      <div style="width: 100%;display: flex;justify-content: space-between">
        <span>
          <el-button @click="goCreateItem" icon="Plus">创建器材</el-button>
          <el-button @click="loadAll" icon="Refresh">刷新</el-button>
        </span>
        <span>
          <el-button @click="handleCancelClick">取消</el-button>
          <el-button type="primary" @click="handleOkClick" v-if="!singleSelect">确认</el-button>
      </span>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts" name="SkuSelect">
import {computed, getCurrentInstance, onMounted, reactive, ref} from 'vue';
import {ElForm} from "element-plus";
import {getRowspanMethod} from "@/utils/getRowSpanMethod";
import {listItemSkuPage} from "@/api/wms/itemSku";
import {useRouter} from "vue-router";

const { proxy } = getCurrentInstance()

const spanMethod = computed(() => getRowspanMethod(list.value, ['itemId']))
const router = useRouter()
const loading = ref(false)
const deptOptions = ref([]);
const query = reactive({
  itemName: '',
  itemCode: '',
  skuName: ''
});
const selectItemSkuVoCheck = ref([])
const skuSelectFormRef = ref(null)
const total = ref(0);
const pageReq = reactive({
  page: 1,
  size: 10,
});
const list = ref([]);
const rightList = ref([]);
const rightListKeySet = computed(() => {
  const set = new Set();
  rightList.value.forEach((it) => set.add(it.id));
  return set
});

const editableList = computed(() => {
  return list.value.filter((it) => !rightListKeySet.value.has(it.id));
});

const loadAll = () => {
  pageReq.page = 1
  const pageReqCopy = {...pageReq};
  const data = {
    ...query,
    pageNum: pageReqCopy.page,
    pageSize: pageReqCopy.size
  }
  loading.value = true
  listItemSkuPage(data).then((res) => {
    const content = [...res.rows];
    list.value = content.map((item) => ({...item, checked: false}));
    total.value = res.total;
  }).finally(() => loading.value = false);
};
const getRowKey = (row: any) => {
  return row.id;
}
const getList = () => {
  const data = {
    ...query,
    pageNum: pageReq.page,
    pageSize: pageReq.size
  }
  listItemSkuPage(data).then((res) => {
    const content = [...res.rows];
    list.value = content.map((item) => ({...item, checked: false}));
    total.value = res.total;
  });
}

const clickQuery = () => {
  pageReq.page = 1;
  loadAll();
};
const goCreateItem = () => {
  const data = proxy.$router.resolve({ path: '/basic/item', query: { openDrawer: true } })
  window.open(data.href, '_blank')
}
// 定义props
const props = defineProps<{
  modelValue?: boolean
  size: number | string
  singleSelect: boolean
}>()

const show = computed(() => {
  return props.modelValue;
})

// 定义事件
const emit = defineEmits<{
  (e: 'handleCancelClick')
  (e: 'handleOkClick', value)
  (e: 'handleSingleOkClick', value)
}>()

function handleCancelClick() {
  emit('handleCancelClick');
  clearQuantity()
}

function handleChooseSku(row) {
  emit('handleSingleOkClick', row);
}

function handleOkClick() {
  emit('handleOkClick', selectItemSkuVoCheck.value);
  clearQuantity()
}
/** 多选框选中数据 */
const handleSelectionChange = (selection) => {
  selectItemSkuVoCheck.value = selection
}


function clearQuantity() {
  skuSelectFormRef.value.clearSelection()
}

onMounted(() => {
  loadAll();
})
</script>
<style lang="scss">
.el-table .my-cell {
  vertical-align: top
}
</style>
