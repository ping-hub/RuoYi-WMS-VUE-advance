<template>
  <div v-if="!checking && !isViewMode" style="display: flex;justify-content: center;align-items: center;height: 80vh">
    <el-card header="选择盘点范围开始盘点" >
      <el-form>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="form.warehouseId" placeholder="请选择仓库" :disabled="checking"
                     @change="handleWarehouseChange"
                     filterable>
            <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                       :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="库区" prop="areaId">
          <el-select v-model="form.areaId" placeholder="请选择库区" :disabled="!form.warehouseId || checking" clearable filterable
                     @change="handleAreaChange">
            <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.warehouseId)"
                       :key="item.id" :label="item.areaName" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="货架" prop="rackId">
          <RackSelect v-model="form.rackId" :warehouse-id="form.warehouseId" :area-id="form.areaId" :disabled="!form.areaId || checking" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain="plain" size="default" @click="startCheck"  style="width: 100%!important;">开始盘点</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
  <div v-else v-loading="loading">
    <div class="receipt-order-edit-wrapper app-container" :class="{ 'is-view-mode': isViewMode }" style="margin-bottom: 60px">
      <el-alert v-if="isViewMode" class="mb10" type="info" :closable="false" title="当前为联查查看模式，已禁用编辑、作废和完成盘点操作。" />
      <el-card header="盘点单基本信息">
        <el-form label-width="108px" :model="form" ref="checkForm" :rules="rules" :disabled="isViewMode">
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="盘点单号" prop="checkOrderNo">
                <el-input v-model="form.checkOrderNo" placeholder="保存后自动生成" disabled style="width: 100%"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="仓库" prop="warehouseId">
                <el-select v-model="form.warehouseId" placeholder="请选择仓库" :disabled="true"
                           filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                             :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="库区" prop="areaId">
                <el-select v-model="form.areaId" placeholder="请选择库区" :disabled="true" clearable filterable>
                  <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.warehouseId)"
                             :key="item.id" :label="item.areaName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="货架" prop="rackId">
                <RackSelect v-model="form.rackId" :warehouse-id="form.warehouseId" :area-id="form.areaId" :disabled="true" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="范围类型" prop="checkScopeType">
                <el-select v-model="form.checkScopeType" placeholder="请选择盘点范围" style="width: 100%" :disabled="true">
                  <el-option v-for="item in wms_check_scope_type" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="盘点日期" prop="checkDate">
                <el-date-picker v-model="form.checkDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="盘点人" prop="checkerName">
                <el-input v-model="form.checkerName" placeholder="请输入盘点人" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="复核人" prop="reviewerName">
                <el-input v-model="form.reviewerName" placeholder="请输入复核人" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="form.remark"
                  placeholder="备注...100个字符以内"
                  rows="4"
                  maxlength="100"
                  type="textarea"
                  show-word-limit="show-word-limit"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card header="盘点明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8">
            <div>
              <el-tag type="info">仅盘点在库明细，实际库存不能大于账面数量，盘点后可继续联查器材与追踪信息</el-tag>
            </div>
          </div>
          <el-table :data="form.details" border empty-text="暂无盘点明细">
            <el-table-column label="器材实例编码" min-width="180">
              <template #default="{ row }">
                <span>{{ row.instanceCode || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="器材信息" prop="itemSku.itemName" min-width="240">
              <template #default="scope">
                <div>{{ scope.row.itemSku.item.itemName || '-' }}</div>
                <div v-if="scope.row.itemSku.item.itemCode" class="sub-text">器材编码：{{ scope.row.itemSku.item.itemCode }}</div>
                <div v-if="scope.row.skuName || scope.row.itemSku?.skuName" class="sub-text">规格型号：{{ scope.row.skuName || scope.row.itemSku?.skuName }}</div>
                <div v-if="scope.row.productIdentifier || scope.row.itemSku?.productIdentifier" class="sub-text">产品标识：{{ scope.row.productIdentifier || scope.row.itemSku?.productIdentifier }}</div>
                <div v-if="scope.row.qualityGrade || scope.row.itemSku?.qualityGrade" class="sub-text">质量等级：{{ scope.row.qualityGrade || scope.row.itemSku?.qualityGrade }}</div>
              </template>
            </el-table-column>
            <el-table-column label="货位信息" min-width="150">
              <template #default="{ row }">
                <div v-if="getWarehouseName(row.warehouseId)">仓库：{{ getWarehouseName(row.warehouseId) }}</div>
                <div v-if="getAreaName(row.areaId, row.areaName)">库区：{{ getAreaName(row.areaId, row.areaName) }}</div>
                <div v-if="getRackName(row.rackId, row.rackName)">货架：{{ getRackName(row.rackId, row.rackName) }}</div>
                <div v-if="getLocationName(row.locationId, row.locationName)">货位：{{ getLocationName(row.locationId, row.locationName) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="入库日期" prop="receiptTime" width="140">
              <template #default="{ row }">
                <template v-if="row.newInventoryDetail">
                  <el-date-picker
                    v-model="row.receiptTime"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled="isViewMode"
                    style="width: 150px!important;"
                  />
                </template>
                <div v-else>
                  {{ parseTime(row.receiptTime,  '{y}-{m}-{d}') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="账面库存" align="right" width="110">
              <template #default="{ row }">
                <el-statistic :value="Number(row.quantity)" :precision="0"/>
              </template>
            </el-table-column>
            <el-table-column label="盈亏数" prop="remainQuantity" align="right" width="110">
              <template #default="{ row }">
                <el-statistic :value="Number(row.checkQuantity) - Number(row.quantity)" :precision="0"/>
              </template>
            </el-table-column>
            <el-table-column label="实际库存" prop="checkQuantity" width="160">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.checkQuantity"
                  placeholder="实际库存"
                  :min="0"
                  :max="Number(scope.row.quantity || 0)"
                  :disabled="isViewMode"
                  @change="handleChangeQuantity"
                ></el-input-number>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
    <div class="footer-global" v-if="checking">
      <div class="btn-box">
        <div v-if="!isViewMode">
          <el-button @click="doCheck" type="primary" class="ml10">完成盘点</el-button>
          <el-button @click="updateToInvalid" type="danger" v-if="form.id">作废</el-button>
        </div>
        <div>
          <el-button v-if="!isViewMode" @click="save" type="primary">暂存</el-button>
          <el-button @click="cancel" class="mr10">{{ isViewMode ? '关闭' : '取消' }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="CheckOrderEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRef, toRefs, watch} from "vue";
import {addCheckOrder, getCheckOrder, updateCheckOrder, check} from "@/api/wms/checkOrder";
import {listInventoryDetailNoPage} from "@/api/wms/inventoryDetail";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import {numSub} from '@/utils/ruoyi'
import RackSelect from "@/views/components/RackSelect.vue";
import { listRackNoPage } from "@/api/wms/rack";
import { listLocationNoPage } from "@/api/wms/location";

const {proxy} = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const wmsStore = useWmsStore();
const isViewMode = computed(() => route.query.mode === 'view');
const {wms_check_scope_type} = proxy.useDict("wms_check_scope_type");
const checkGreaterThanZero = ref(false)
const loading = ref(false)
const rackMap = ref(new Map())
const locationMap = ref(new Map())
const initFormData = {
  id: undefined,
  checkOrderNo: undefined,
  checkOrderStatus: 0,
  remark: undefined,
  warehouseId: undefined,
  areaId: undefined,
  rackId: undefined,
  checkScopeType: 'warehouse',
  checkDate: undefined,
  checkerName: undefined,
  reviewerName: undefined,
  checkOrderTotal: 0,
  details: [],
}
const data = reactive({
  form: {...initFormData},
  rules: {
    warehouseId: [
      {required: true, message: "请选择仓库", trigger: ['blur', 'change']}
    ],
  }
});
const {form, rules} = toRefs(data);
const cancel = async () => {
  if (isViewMode.value) {
    close()
    return
  }
  await proxy?.$modal.confirm('确认取消编辑盘点单吗？');
  close()
}
const close = () => {
  if (route.query.returnFullPath) {
    proxy?.$tab.closeOpenPage(route.query.returnFullPath);
    return
  }
  proxy?.$tab.closePage();
}
// 盘点中标识
const checking = ref(false)

const syncCheckScopeType = () => {
  if (form.value.rackId) {
    form.value.checkScopeType = 'rack'
    return
  }
  if (form.value.areaId) {
    form.value.checkScopeType = 'area'
    return
  }
  form.value.checkScopeType = 'warehouse'
}

const handleWarehouseChange = () => {
  form.value.areaId = undefined
  form.value.rackId = undefined
  syncCheckScopeType()
}

const handleAreaChange = () => {
  form.value.rackId = undefined
  syncCheckScopeType()
}

watch(() => form.value.rackId, () => {
  syncCheckScopeType()
})

const buildIdNameMap = (list, idKey, nameKey) => {
  const map = new Map()
  (list || []).forEach(item => {
    map.set(item[idKey], item[nameKey])
  })
  return map
}

const loadPlaceNameMap = async () => {
  const [rackRes, locationRes] = await Promise.all([
    listRackNoPage({}),
    listLocationNoPage({})
  ])
  rackMap.value = buildIdNameMap(rackRes.data, 'id', 'rackName')
  locationMap.value = buildIdNameMap(locationRes.data, 'id', 'locationName')
}

const getWarehouseName = (warehouseId) => {
  return wmsStore.warehouseMap.get(warehouseId)?.warehouseName || ''
}

const getAreaName = (areaId, areaName) => {
  return areaName || wmsStore.areaMap.get(areaId)?.areaName || ''
}

const getRackName = (rackId, rackName) => {
  return rackName || rackMap.value.get(rackId) || ''
}

const getLocationName = (locationId, locationName) => {
  return locationName || locationMap.value.get(locationId) || ''
}

// 选择器材 start
const startCheck = () => {
  if (!form.value.warehouseId) {
    return ElMessage.error('请先选择仓库！')
  }
  syncCheckScopeType()
  const query = {
    warehouseId: form.value.warehouseId,
    areaId: form.value.areaId,
    rackId: form.value.rackId
  }
  checking.value = true
  loading.value = true
  listInventoryDetailNoPage(query).then(res => {
    res.data.forEach(it => {
      if (!form.value.details.find(detail => detail.inventoryDetailId === it.id)) {
        form.value.details.push({
            itemSku: it.itemSku,
            inventoryDetailId: it.id,
            skuId: it.itemSku.id,
            itemInstanceId: it.itemInstanceId,
            instanceCode: it.instanceCode,
            warehouseId: it.warehouseId,
            areaId: it.areaId,
            rackId: it.rackId,
            locationId: it.locationId,
            quantity: Number(it.remainQuantity),
            checkQuantity: Number(it.remainQuantity),
            areaName: wmsStore.areaMap.get(it.areaId)?.areaName,
            rackName: getRackName(it.rackId, it.rackName),
            locationName: getLocationName(it.locationId, it.locationName),
            receiptOrderDetailId: it.receiptOrderDetailId,
            receiptTime: it.createTime,
            newInventoryDetail: false
          }
        )
      }
    })
  }).finally(() => loading.value = false)
}
// 选择器材 end

// 初始化receipt-order-form ref
const checkForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('确认暂存盘点单吗？');
  doSave()
}

const doSave = (checkOrderStatus = 0) => {
  //验证shipmentForm表单
  checkForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    let details = []
    if (form.value.details?.length) {
      // 构建参数
      details = form.value.details.map(it => {
        return {
          id: it.id,
          checkOrderId: form.value.id,
          skuId: it.skuId,
          quantity: it.quantity,
          checkQuantity: it.checkQuantity,
          inventoryDetailId: it.inventoryDetailId,
          warehouseId: form.value.warehouseId,
          areaId: it.areaId,
          rackId: it.rackId,
          locationId: it.locationId,
          receiptTime: it.receiptTime
        }
      })
    }
    const params = {
      id: form.value.id,
      checkOrderNo: form.value.checkOrderNo,
      checkOrderStatus,
      remark: form.value.remark,
      checkOrderTotal: form.value.checkOrderTotal,
      warehouseId: form.value.warehouseId,
      areaId: form.value.areaId,
      rackId: form.value.rackId,
      checkScopeType: form.value.checkScopeType,
      checkDate: form.value.checkDate,
      checkerName: form.value.checkerName,
      reviewerName: form.value.reviewerName,
      details: details
    }
    if (params.id) {
      updateCheckOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      })
    } else {
      addCheckOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      })
    }
  })
}


const updateToInvalid = async () => {
  await proxy?.$modal.confirm('确认作废盘点单吗？');
  doSave(-1)
}

const doCheck = async () => {
  await proxy?.$modal.confirm('确认盘点结束吗？');
  checkForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    // 构建参数
    const details = form.value.details.map(it => {
      return {
        id: it.id,
        checkOrderId: form.value.id,
        skuId: it.skuId,
        quantity: it.quantity,
        checkQuantity: it.checkQuantity,
        warehouseId: form.value.warehouseId,
        areaId: it.areaId,
        rackId: it.rackId,
        locationId: it.locationId,
        receiptTime: it.receiptTime,
        inventoryDetailId: it.inventoryDetailId
      }
    })

    const params = {
      id: form.value.id,
      checkOrderNo: form.value.checkOrderNo,
      checkOrderTotal: form.value.checkOrderTotal,
      warehouseId: form.value.warehouseId,
      areaId: form.value.areaId,
      rackId: form.value.rackId,
      checkScopeType: form.value.checkScopeType,
      checkDate: form.value.checkDate,
      checkerName: form.value.checkerName,
      reviewerName: form.value.reviewerName,
      remark: form.value.remark,
      details: details
    }
    check(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('盘点成功')
        close()
      } else {
        ElMessage.error(res.msg)
      }
    })
  })
}

onMounted(() => {
  const id = route.query && route.query.id;
  loadPlaceNameMap()
  if (id) {
    checking.value = true
    loadDetail(id)
  }
})


// 获取入库单详情
const loadDetail = (id) => {
  loading.value = true
  getCheckOrder(id).then((response) => {
    if (response.data.details?.length) {
      response.data.details.forEach(detail => {
        detail.areaName = wmsStore.areaMap.get(detail.areaId)?.areaName
        detail.rackName = getRackName(detail.rackId, detail.rackName)
        detail.locationName = getLocationName(detail.locationId, detail.locationName)
        detail.newInventoryDetail = false
        detail.quantity = detail.remainQuantity
      })
    }
    response.data.checkScopeType = response.data.checkScopeType || (response.data.rackId ? 'rack' : (response.data.areaId ? 'area' : 'warehouse'))
    form.value = {...response.data}
    Promise.resolve();
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleChangeQuantity = () => {
  let checkOrderTotal = 0
  form.value.details.forEach(it => {
    if (it.quantity !== it.checkQuantity) {
      checkOrderTotal += (it.checkQuantity - it.quantity)
    }
  })
  form.value.checkOrderTotal = checkOrderTotal
}

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

.el-statistic__content {
  font-size: 14px;
}

.item-title {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.sub-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.hover-text {
  color: black; /* 初始文字颜色 */
  text-decoration: none; /* 初始没有下划线 */
  transition: color 0.3s, text-decoration 0.3s; /* 平滑过渡效果 */
}

.hover-text:hover {
  color: #409EFF; /* 鼠标移上去时文字颜色变为蓝色 */
  text-decoration: underline; /* 鼠标移上去时带有下划线 */
}

</style>

