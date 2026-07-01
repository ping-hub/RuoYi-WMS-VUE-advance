<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" :class="{ 'is-view-mode': isViewMode }" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="借用单基本信息">
        <el-form label-width="108px" :model="form" ref="borrowForm" :rules="rules" :disabled="formReadonly">
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="借用单号" prop="borrowOrderNo">
                <el-input v-model="form.borrowOrderNo" placeholder="保存后自动生成" style="width: 100%" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="借用人" prop="borrower">
                <el-input v-model="form.borrower" placeholder="请输入借用人" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="借用时间" prop="borrowTime">
                <el-date-picker v-model="form.borrowTime" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="计划归还" prop="planReturnDate">
                <el-date-picker v-model="form.planReturnDate" type="date" format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="发货单位" prop="fromUnit">
                <el-input v-model="form.fromUnit" placeholder="请输入发货单位" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="收货单位" prop="toUnit">
                <el-input v-model="form.toUnit" placeholder="请输入收货单位" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="发货人" prop="fromPerson">
                <el-input v-model="form.fromPerson" placeholder="请输入发货人" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="收货人" prop="toPerson">
                <el-input v-model="form.toPerson" placeholder="请输入收货人" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" placeholder="备注...100个字符以内" maxlength="100" show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card header="器材明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8">
            <div>
              <el-tag type="info">支持"选择器材实例"或扫码枪扫二维码直接新增，当前只允许选择在库实例</el-tag>
            </div>
            <div class="add-actions">
              <el-button type="primary" plain size="default" @click="showAddItemInstance" icon="Tickets" :disabled="formReadonly">
                选择器材实例
              </el-button>
            </div>
          </div>
          <el-table
            :data="form.details"
            border
            empty-text="暂无器材明细"
            @row-click="handleDetailRowClick"
            style="cursor: pointer"
          >
            <el-table-column label="器材实例编码" prop="instanceCode" min-width="160" show-overflow-tooltip />
            <el-table-column label="器材名称" min-width="160">
              <template #default="{ row }">
                <span>{{ row.itemName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="规格型号" min-width="120">
              <template #default="{ row }">
                <span>{{ row.skuName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="货架" min-width="120">
              <template #default="{ row }">
                <span>{{ row.rackName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="货位" min-width="120">
              <template #default="{ row }">
                <span>{{ row.locationName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="isViewMode && [1, 2].includes(Number(form.borrowOrderStatus))" label="归还状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.returnStatus === 1 ? 'success' : 'warning'" size="small">
                  {{ row.returnStatus === 1 ? '已归还' : '未归还' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="请输入备注" :disabled="formReadonly" />
              </template>
            </el-table-column>
            <el-table-column v-if="!formReadonly" label="操作" width="88" align="right">
              <template #default="scope">
                <el-button icon="Delete" type="danger" plain size="small"
                  @click.stop="handleDeleteDetail(scope.row, scope.$index)" link>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <!-- 器材详情弹窗 -->
      <el-dialog v-model="itemDetailDialog.visible" title="器材详情" width="520px" append-to-body>
        <div v-loading="itemDetailDialog.loading">
          <el-descriptions v-if="itemDetailDialog.data" :column="2" border>
            <el-descriptions-item label="实例编码">{{ itemDetailDialog.data.instanceCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="器材名称">{{ itemDetailDialog.data.itemName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="器材编码">{{ itemDetailDialog.data.itemCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="规格型号">{{ itemDetailDialog.data.skuName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="计量单位">{{ itemDetailDialog.data.unit || '-' }}</el-descriptions-item>
            <el-descriptions-item label="产品标识">{{ itemDetailDialog.data.productIdentifier || '-' }}</el-descriptions-item>
            <el-descriptions-item label="质量等级"><dict-tag :options="wms_quality_grade" :value="itemDetailDialog.data.qualityGrade" v-if="itemDetailDialog.data.qualityGrade" /><span v-else>-</span></el-descriptions-item>
            <el-descriptions-item label="状态">{{ itemDetailDialog.data.instanceStatus || '-' }}</el-descriptions-item>
          </el-descriptions>
          <el-empty v-else-if="!itemDetailDialog.loading" description="暂无器材详情" />
        </div>
        <template #footer>
          <el-button @click="itemDetailDialog.visible = false">关闭</el-button>
        </template>
      </el-dialog>
      <!-- 选择器材实例弹窗 -->
      <el-dialog v-model="itemInstanceDialog.visible" title="选择器材实例" width="1100px" append-to-body>
        <el-form :inline="true" :model="itemInstanceDialog.query" label-width="76px" class="item-instance-search-form">
          <el-form-item label="器材名称">
            <el-input v-model="itemInstanceDialog.query.itemName" placeholder="请输入器材名称" clearable
              style="width: 140px" @keyup.enter="getItemInstanceList" />
          </el-form-item>
          <el-form-item label="器材规格">
            <el-input v-model="itemInstanceDialog.query.skuName" placeholder="请输入器材规格" clearable
              style="width: 150px" @keyup.enter="getItemInstanceList" />
          </el-form-item>
          <el-form-item label="器材实例编码" label-width="100px">
            <el-input v-model="itemInstanceDialog.query.instanceCode" placeholder="请输入器材实例编码" clearable
              style="width: 150px" @keyup.enter="getItemInstanceList" />
          </el-form-item>
          <el-form-item class="item-instance-search-form__action">
            <el-button type="primary" @click="getItemInstanceList">查询</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="itemInstanceDialog.loading" :data="itemInstanceDialog.list"
          @selection-change="handleItemInstanceSelectionChange" border row-key="id">
          <el-table-column type="selection" width="55" :selectable="isItemInstanceSelectable" />
          <el-table-column label="器材实例编码" prop="instanceCode" min-width="160" />
          <el-table-column label="器材名称" prop="itemName" min-width="160" />
          <el-table-column label="器材规格" prop="skuName" min-width="160" />
          <el-table-column label="货架" prop="rackName" width="120" />
          <el-table-column label="货位" prop="locationName" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <dict-tag :options="wms_item_instance_status" :value="row.instanceStatus" />
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="itemInstanceDialog.total > 0"
          :total="itemInstanceDialog.total"
          v-model:page="itemInstanceDialog.pageNum"
          v-model:limit="itemInstanceDialog.pageSize"
          @pagination="getItemInstanceList"
        />
        <template #footer>
          <el-button @click="itemInstanceDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmItemInstance">确认添加</el-button>
        </template>
      </el-dialog>
    </div>
    <div class="footer-global">
      <div class="btn-box">
        <div v-if="!isViewMode && [0].includes(Number(form.borrowOrderStatus))">
          <el-button @click="save" type="primary">暂存</el-button>
          <el-button @click="handleConfirmBorrow" type="warning">确认借出</el-button>
          <el-button @click="handleVoid" type="danger" v-if="form.id">作废</el-button>
        </div>
        <div v-if="!isViewMode && Number(form.borrowOrderStatus) === 1">
          <el-button @click="handleReturnAll" type="success">全部归还</el-button>
        </div>
        <div>
          <el-button @click="cancel" class="mr10">{{ isViewMode ? '关闭' : '取消' }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="BorrowOrderEdit">
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, toRefs } from 'vue';
import { addBorrowOrder, getBorrowOrder, updateBorrowOrder, confirmBorrow, returnBorrowOrder, voidBorrowOrder } from '@/api/wms/borrowOrder';
import { useRoute } from 'vue-router';
import useTagsViewStore from '@/store/modules/tagsView';
import { useWmsStore } from '@/store/modules/wms';
import { ElMessage } from 'element-plus';
import { getItemInstanceByCode, listItemInstance } from '@/api/wms/itemInstance';
import RackSelect from '@/views/components/RackSelect.vue';

const { proxy } = getCurrentInstance();
const route = useRoute();
const tagsViewStore = useTagsViewStore();

const { wms_item_instance_status, wms_quality_grade } = proxy.useDict('wms_item_instance_status', 'wms_quality_grade');

const isViewMode = computed(() => route.query.mode === 'view');
const formReadonly = computed(() => {
  if (isViewMode.value) return true;
  const s = Number(form.value.borrowOrderStatus);
  return !isNaN(s) && s !== 0;
});

const loading = ref(false);
const initFormData = {
  id: undefined,
  borrowOrderNo: undefined,
  borrower: undefined,
  borrowTime: undefined,
  planReturnDate: undefined,
  fromUnit: undefined,
  toUnit: undefined,
  fromPerson: undefined,
  toPerson: undefined,
  borrowOrderStatus: 0,
  returnTime: undefined,
  totalQuantity: 0,
  remark: undefined,
  details: []
};

const data = reactive({
  form: { ...initFormData },
  rules: {
    borrower: [
      { required: true, message: '借用人不能为空', trigger: 'blur' }
    ],
    planReturnDate: [
      { required: true, message: '计划归还日期不能为空', trigger: 'change' }
    ]
  }
});
const { form, rules } = toRefs(data);

const borrowForm = ref();

const itemDetailDialog = reactive({
  visible: false,
  loading: false,
  data: null
});

const itemInstanceDialog = reactive({
  visible: false,
  loading: false,
  list: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  selection: [],
  query: {
    instanceCode: undefined,
    itemName: undefined,
    skuName: undefined
  }
});

const borrowScanBuffer = reactive({
  value: '',
  lastTime: 0,
  pending: false
});

const cancel = async () => {
  if (formReadonly.value) {
    close();
    return;
  }
  await proxy?.$modal.confirm('确认取消编辑借用单吗？');
  close();
};

const close = () => {
  if (route.query.returnFullPath) {
    proxy?.$tab.closeOpenPage(route.query.returnFullPath);
    return;
  }
  proxy?.$tab.closePage();
};

const doSave = () => {
  return new Promise((resolve, reject) => {
    borrowForm.value?.validate((valid) => {
      if (!valid) {
        ElMessage.error('请填写必填项');
        return reject(new Error('validate failed'));
      }
      const details = (form.value.details || []).map(it => ({
        id: it.id,
        borrowOrderId: form.value.id,
        instanceCode: it.instanceCode,
        skuId: it.skuId,
        itemCode: it.itemCode,
        itemName: it.itemName,
        skuName: it.skuName,
        unit: it.unit,
        productIdentifier: it.productIdentifier,
        qualityGrade: it.qualityGrade,
        warehouseId: it.warehouseId,
        areaId: it.areaId,
        rackId: it.rackId,
        locationId: it.locationId,
        remark: it.remark
      }));
      const params = {
        id: form.value.id,
        borrowOrderNo: form.value.borrowOrderNo,
        borrower: form.value.borrower,
        borrowTime: form.value.borrowTime,
        planReturnDate: form.value.planReturnDate,
        fromUnit: form.value.fromUnit,
        toUnit: form.value.toUnit,
        fromPerson: form.value.fromPerson,
        toPerson: form.value.toPerson,
        borrowOrderStatus: form.value.borrowOrderStatus || 0,
        totalQuantity: form.value.details?.length || 0,
        remark: form.value.remark,
        details: details
      };
      if (params.id) {
        updateBorrowOrder(params).then((res) => {
          if (res.code === 200) {
            resolve(res);
          } else {
            ElMessage.error(res.msg);
            reject(new Error(res.msg));
          }
        }).catch(reject);
      } else {
        addBorrowOrder(params).then((res) => {
          if (res.code === 200) {
            if (res.data) form.value.id = res.data;
            resolve(res);
          } else {
            ElMessage.error(res.msg);
            reject(new Error(res.msg));
          }
        }).catch(reject);
      }
    });
  });
};

const save = async () => {
  await proxy?.$modal.confirm('确认暂存借用单吗？');
  doSave().then(() => {
    ElMessage.success('暂存成功');
    close();
  }).catch(() => {});
};

const handleConfirmBorrow = async () => {
  await proxy?.$modal.confirm('确认提交并借出吗？确认后器材将被标记为借出状态。');
  try {
    if (!form.value.id) {
      await doSave();
    }
    const res = await confirmBorrow(form.value.id);
    if (res.code === 200) {
      ElMessage.success('确认借出成功');
      close();
    } else {
      ElMessage.error(res.msg);
    }
  } catch (e) {
    // 校验失败或保存失败，已提示过
  }
};

const handleReturnAll = async () => {
  await proxy?.$modal.confirm('确认将借用单【' + form.value.borrowOrderNo + '】全部归还吗？');
  try {
    const res = await returnBorrowOrder(form.value.id);
    if (res.code === 200) {
      ElMessage.success('归还成功');
      close();
    } else {
      ElMessage.error(res.msg);
    }
  } catch (e) {
    // 用户取消
  }
};

const handleVoid = async () => {
  await proxy?.$modal.confirm('确认作废该借用单吗？');
  voidBorrowOrder(form.value.id).then((res) => {
    if (res.code === 200) {
      ElMessage.success('已作废');
      close();
    } else {
      ElMessage.error(res.msg);
    }
  });
};

const loadDetail = (id) => {
  loading.value = true;
  getBorrowOrder(id).then((response) => {
    form.value = {
      ...response.data,
      details: response.data.details || []
    };
  }).finally(() => {
    loading.value = false;
  });
};

// ========== 器材明细操作 ==========

const handleDetailRowClick = async (row) => {
  itemDetailDialog.visible = true;
  itemDetailDialog.loading = true;
  itemDetailDialog.data = null;
  try {
    if (row.instanceCode) {
      const res = await getItemInstanceByCode(row.instanceCode);
      if (res.data) {
        itemDetailDialog.data = {
          itemName: res.data.itemName ?? row.itemName,
          instanceCode: res.data.instanceCode ?? row.instanceCode,
          itemCode: res.data.itemCode ?? row.itemCode,
          skuName: res.data.skuName ?? row.skuName,
          unit: res.data.unit ?? row.unit,
          productIdentifier: res.data.productIdentifier ?? row.productIdentifier,
          qualityGrade: res.data.qualityGrade ?? row.qualityGrade,
          instanceStatus: res.data.instanceStatus ?? '-'
        };
        return;
      }
    }
    itemDetailDialog.data = {
      itemName: row.itemName,
      instanceCode: row.instanceCode,
      itemCode: row.itemCode,
      skuName: row.skuName,
      unit: row.unit,
      productIdentifier: row.productIdentifier,
      qualityGrade: row.qualityGrade,
      instanceStatus: '-'
    };
  } catch (e) {
    itemDetailDialog.data = {
      itemName: row.itemName, instanceCode: row.instanceCode, itemCode: row.itemCode,
      skuName: row.skuName, unit: row.unit, productIdentifier: row.productIdentifier,
      qualityGrade: row.qualityGrade, instanceStatus: '-'
    };
  } finally {
    itemDetailDialog.loading = false;
  }
};

const handleDeleteDetail = (row, index) => {
  form.value.details.splice(index, 1);
};

// ========== 选择器材实例 ==========

const showAddItemInstance = async () => {
  itemInstanceDialog.pageNum = 1;
  itemInstanceDialog.visible = true;
  itemInstanceDialog.selection = [];
  getItemInstanceList();
};

const getItemInstanceList = () => {
  itemInstanceDialog.loading = true;
  listItemInstance({
    pageNum: itemInstanceDialog.pageNum,
    pageSize: itemInstanceDialog.pageSize,
    instanceStatus: '在库',
    ...itemInstanceDialog.query
  }).then((res) => {
    itemInstanceDialog.list = (res.rows || []).filter(
      item => item.instanceStatus === '在库' && !item.shipmentOrderDetailId && !item.movementOrderDetailId
    );
    itemInstanceDialog.total = res.total || 0;
  }).finally(() => {
    itemInstanceDialog.loading = false;
  });
};

const handleItemInstanceSelectionChange = (selection) => {
  itemInstanceDialog.selection = selection;
};

const isItemInstanceSelectable = (row) => {
  return !form.value.details.some(detail => detail.instanceCode === row.instanceCode);
};

const handleConfirmItemInstance = async () => {
  if (!itemInstanceDialog.selection.length) {
    ElMessage.error('请选择器材实例编码');
    return;
  }
  try {
    addItemInstancesToOrder(itemInstanceDialog.selection);
    itemInstanceDialog.visible = false;
  } catch (e) {
    ElMessage.error(e?.message || '器材实例编码添加失败');
  }
};

const addItemInstancesToOrder = (items) => {
  if (!items?.length) return;
  for (const item of items) {
    if (form.value.details.some(detail => detail.instanceCode === item.instanceCode)) {
      throw new Error(`器材实例编码 ${item.instanceCode} 已添加`);
    }
    form.value.details.push({
      instanceCode: item.instanceCode,
      skuId: item.skuId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      skuName: item.skuName,
      unit: item.unit,
      productIdentifier: item.productIdentifier,
      qualityGrade: item.qualityGrade,
      warehouseId: item.warehouseId,
      areaId: item.areaId,
      rackId: item.rackId,
      rackName: item.rackName,
      locationId: item.locationId,
      locationName: item.locationName,
      remark: ''
    });
  }
};

// ========== 扫码支持 ==========

const isTypingTarget = (event) => {
  const tagName = event?.target?.tagName;
  return ['INPUT', 'TEXTAREA'].includes(tagName) || event?.target?.isContentEditable;
};

const handleScanAddItemInstance = async (instanceCode) => {
  const res = await getItemInstanceByCode(instanceCode, { instanceStatus: '在库' });
  const item = res.data;
  if (!item?.id) {
    ElMessage.error(`未找到可在库器材实例：${instanceCode}`);
    return;
  }
  addItemInstancesToOrder([item]);
  ElMessage.success(`已扫码添加：${instanceCode}`);
};

const handleScanKeydown = async (event) => {
  if (formReadonly.value || loading.value || borrowScanBuffer.pending || isTypingTarget(event)) {
    return;
  }
  const now = Date.now();
  if (now - borrowScanBuffer.lastTime > 120) {
    borrowScanBuffer.value = '';
  }
  borrowScanBuffer.lastTime = now;
  if (event.key === 'Enter') {
    const instanceCode = borrowScanBuffer.value.trim();
    borrowScanBuffer.value = '';
    if (!instanceCode) return;
    borrowScanBuffer.pending = true;
    try {
      await handleScanAddItemInstance(instanceCode);
    } catch (e) {
      ElMessage.error(e?.message || '扫码添加失败');
    } finally {
      borrowScanBuffer.pending = false;
    }
    return;
  }
  if (event.key.length === 1) {
    borrowScanBuffer.value += event.key;
  }
};

onMounted(() => {
  if (route.query.mode === 'view') {
    route.meta.title = '查看借用单';
    tagsViewStore.updateVisitedView(route);
  }
  window.addEventListener('keydown', handleScanKeydown);
  const id = route.query && route.query.id;
  if (id) {
    loadDetail(id);
  } else {
    // 新增时默认借用时间为当前时间
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    form.value.borrowTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleScanKeydown);
});
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.module";

.btn-box {
  width: calc(100% - #{$base-sidebar-width});
  display: flex;
  align-items: center;
  justify-content: space-between;
  float: right;
}

.add-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.item-instance-search-form {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.item-instance-search-form :deep(.el-form-item) {
  margin-right: 8px;
  margin-bottom: 12px;
}

.item-instance-search-form :deep(.el-form-item__label) {
  padding-right: 6px;
}

.item-instance-search-form__action {
  margin-left: auto !important;
  margin-right: 0 !important;
}

@media (max-width: 1280px) {
  .item-instance-search-form :deep(.el-form-item) {
    margin-right: 12px;
  }
}
</style>
