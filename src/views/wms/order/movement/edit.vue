<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="移库单基本信息">
        <el-form label-width="108px" :model="form" ref="movementForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="移库单号" prop="movementOrderNo">
                <el-input class="w200" v-model="form.movementOrderNo" placeholder="移库单号"
                          :disabled="form.id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="源仓库" prop="sourceWarehouseId">
                <el-select v-model="form.sourceWarehouseId" placeholder="请选择源仓库" @change="handleChangeSourceWarehouse"
                           filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                             :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="源库区" prop="sourceAreaId">
                <el-select v-model="form.sourceAreaId" placeholder="请选择源库区" :disabled="!form.sourceWarehouseId" clearable
                           filterable @change="handleChangeSourceArea" style="width: 100%!important;">
                  <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.sourceWarehouseId)"
                             :key="item.id" :label="item.areaName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="11">
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
            <el-col :span="6">
              <el-form-item label="目标仓库" prop="targetWarehouseId">
                <el-select v-model="form.targetWarehouseId" placeholder="请选择目标仓库" @change="handleChangeTargetWarehouse"
                           filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                             :value="item.id"/>
                </el-select>
              </el-form-item>
              <el-form-item label="数量" prop="totalQuantity">
                <el-input-number v-model="form.totalQuantity" :controls="false" :precision="0"
                                 :disabled="true"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="目标库区" prop="targetAreaId">
                <el-select v-model="form.targetAreaId" placeholder="请选择目标库区" :disabled="!form.targetWarehouseId" clearable
                           filterable @change="handleChangeTargetArea" style="width: 100%!important;">
                  <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.targetWarehouseId)"
                             :key="item.id" :label="item.areaName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card header="商品明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8">
            <div>
              <span>一物一码/SN模式：</span>
              <el-switch
                :before-change="goSaasTip"
                class="mr10 ml10"
                inline-prompt
                size="large"
                v-model="mode"
                :active-value="true"
                :inactive-value="false"
                active-text="开启"
                inactive-text="关闭"
              />
            </div>
            <el-popover
              placement="left"
              title="提示"
              :width="200"
              trigger="hover"
              :disabled="form.sourceWarehouseId && form.targetWarehouseId"
              content="请先选择源仓库和目标仓库！"
            >
              <template #reference>
                <el-button type="primary" plain="plain" size="default" @click="showAddItem" icon="Plus"
                           :disabled="!form.sourceWarehouseId || !form.targetWarehouseId">添加商品
                </el-button>
              </template>
            </el-popover>
          </div>
          <el-table :data="form.details" border empty-text="暂无商品明细">
            <el-table-column label="商品信息" prop="itemSku.itemName">
              <template #default="{ row }">
                <div>{{
                    row.itemSku.item.itemName + (row.itemSku.item.itemCode ? ('(' + row.itemSku.item.itemCode + ')') : '')
                  }}
                </div>
                <div v-if="row.itemSku.item.itemBrand">
                  品牌：{{ useWmsStore().itemBrandMap.get(row.itemSku.item.itemBrand).brandName }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="规格信息">
              <template #default="{ row }">
                <div>{{ row.itemSku.skuName}}</div>
                <div v-if="row.itemSku.barcode">条码：{{ row.itemSku.barcode }}</div>
              </template>
            </el-table-column>
            <el-table-column label="源库区" width="200" prop="sourceAreaName" />
            <el-table-column label="目标库区" width="200">
              <template #default="{ row }">
                <el-select v-model="row.targetAreaId" placeholder="请选择目标库区" filterable :disabled="!!form.targetAreaId">
                  <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.targetWarehouseId)"
                             :key="item.id" :label="item.areaName" :value="item.id"/>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="批号" prop="batchNo" />
            <el-table-column label="生产日期" prop="productionDate">
              <template #default="{ row }">
                <div v-if="row.productionDate">{{ row.productionDate.substring(0, 10) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="过期日期" prop="expirationDate">
              <template #default="{ row }">
                <div v-if="row.expirationDate">{{ row.expirationDate.substring(0, 10) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="剩余库存" prop="remainQuantity" align="right" width="150">
              <template #default="{ row }">
                <el-statistic :value="Number(row.remainQuantity)" :precision="0"/>
              </template>
            </el-table-column>
            <el-table-column label="移库数量" prop="quantity" width="280">
              <template #default="scope">
                <!-- SN模式：显示SN码选择 -->
                <div v-if="mode && checkSnEnabled(scope.row)">
                  <div class="sn-mode-quantity">
                    <span>数量：{{ scope.row.quantity }}</span>
                    <el-button type="primary" size="small" icon="Edit" @click="showSnSelect(scope.row)">
                      {{ scope.row.snCodes && scope.row.snCodes.length > 0 ? '编辑SN码' : '选择SN码' }}
                    </el-button>
                  </div>
                  <div class="sn-code-list">
                    <el-tag
                      v-for="(sn, index) in (scope.row.snCodes || [])"
                      :key="index"
                      size="small"
                      closable
                      @close="removeSnCode(scope.row, index)"
                    >
                      {{ sn }}
                    </el-tag>
                    <span v-if="!scope.row.snCodes || scope.row.snCodes.length === 0" class="text-muted">
                      暂无SN码
                    </span>
                  </div>
                </div>
                <!-- 非SN模式：显示数量输入框 -->
                <el-input-number
                  v-else
                  v-model="scope.row.quantity"
                  placeholder="移库数量"
                  :min="1"
                  :precision="0"
                  :max="scope.row.remainQuantity"
                  @change="handleChangeQuantity"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="right" fixed="right">
              <template #default="scope">
                <el-button icon="Delete" type="danger" plain size="small"
                           @click="handleDeleteDetail(scope.row, scope.$index)" link>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <InventoryDetailSelect
        ref="inventorySelectRef"
        :model-value="inventorySelectShow"
        @handleOkClick="handleOkClick"
        @handleCancelClick="inventorySelectShow = false"
        :size="'90%'"
        :select-warehouse-disable="false"
        :select-area-disable="!!form?.sourceAreaId"
        :warehouse-id="form.sourceWarehouseId"
        :area-id="form.sourceAreaId"
        :selected-inventory="selectedInventory"
      />

    <!-- SN码选择对话框 -->
    <el-dialog title="SN码选择" v-model="snSelectDialog" width="900px" append-to-body>
      <el-form :model="snQueryParams" :inline="true" label-width="80px">
        <el-form-item label="SN码" prop="querySnCode">
          <el-input v-model="snQueryParams.querySnCode" placeholder="请输入SN码" clearable @keyup.enter="getAvailableSnList"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getAvailableSnList">搜索</el-button>
          <el-button icon="Refresh" @click="resetSnQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        ref="snTableRef"
        :data="availableSnList"
        @selection-change="handleSnSelectionChange"
        border
        empty-text="暂无数据"
        v-loading="snLoading"
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
        v-show="snTotal > 0"
        :total="snTotal"
        v-model:page="snQueryParams.pageNum"
        v-model:limit="snQueryParams.pageSize"
        @pagination="getAvailableSnList"
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="snSelectDialog = false">取 消</el-button>
          <el-button type="primary" @click="confirmSnSelection" :disabled="selectedSnList.length === 0">
            确定选择({{ selectedSnList.length }})
          </el-button>
        </div>
      </template>
    </el-dialog>
    </div>
    <div class="footer-global">
      <div class="btn-box">
        <div>
          <el-button @click="doMovement" type="primary" class="ml10">完成移库</el-button>
          <el-button @click="updateToInvalid" type="danger" v-if="form.id">作废</el-button>
        </div>
        <div>
          <el-button @click="save" type="primary">暂存</el-button>
          <el-button @click="cancel" class="mr10">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="MovementOrderEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRef, toRefs, watch} from "vue";
import {addMovementOrder, getMovementOrder, updateMovementOrder, movement} from "@/api/wms/movementOrder";
import {delMovementOrderDetail} from "@/api/wms/movementOrderDetail";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import {numSub, generateNo} from '@/utils/ruoyi'
import InventoryDetailSelect from "@/views/components/InventoryDetailSelect.vue";
import { listItemSnBySkuId } from '@/api/wms/itemSn';

const {proxy} = getCurrentInstance();
const {wms_shipment_type} = proxy.useDict("wms_shipment_type");

const mode = ref(false)
const loading = ref(false)
const initFormData = {
  id: undefined,
  movementOrderNo: undefined,
  shipmentOrderStatus: 0,
  remark: undefined,
  sourceWarehouseId: undefined,
  sourceAreaId: undefined,
  targetWarehouseId: undefined,
  targetAreaId: undefined,
  totalQuantity: 0,
  details: [],
}
const inventorySelectRef = ref(null)
const selectedInventory = ref([])

/** SN码相关变量 */
const snSelectDialog = ref(false)
const snLoading = ref(true)
const availableSnList = ref([])
const selectedSnList = ref([])
const snTotal = ref(0)
const snTableRef = ref(null)
const snSelectRow = ref(null)

const data = reactive({
  snQueryParams: {
    pageNum: 1,
    pageSize: 10,
    querySnCode: null,
    querySkuId: null,
    queryWarehouseId: null,
    queryAreaId: null,
    queryStatus: 0
  },
  form: {...initFormData},
  rules: {
    movementOrderNo: [
      {required: true, message: "出库单号不能为空", trigger: "blur"}
    ],
    sourceWarehouseId: [
      {required: true, message: "请选择源仓库", trigger: ['blur', 'change']}
    ],
    targetWarehouseId: [
      {required: true, message: "请选择目标仓库", trigger: ['blur', 'change']}
    ],
  }
});
const {form, rules, snQueryParams} = toRefs(data);
const cancel = async () => {
  await proxy?.$modal.confirm('确认取消编辑移库单吗？');
  close()
}
const close = () => {
  const obj = {path: "/movementOrder"};
  proxy?.$tab.closeOpenPage(obj);
}
const inventorySelectShow = ref(false)

// 选择商品 start
const showAddItem = () => {
  inventorySelectRef.value.getList()
  inventorySelectShow.value = true
}
// 选择成功
const handleOkClick = (item) => {
  inventorySelectShow.value = false
  selectedInventory.value = [...item]
  item.forEach(it => {
    if (!form.value.details.find(detail => detail.inventoryDetailId === it.id)) {
      form.value.details.push(
        {
          itemSku: {
            ...it.itemSku,
            item: it.item
          },
          skuId: it.skuId,
          quantity: undefined,
          remainQuantity: it.remainQuantity,
          batchNo: it.batchNo,
          productionDate: it.productionDate,
          expirationDate: it.expirationDate,
          sourceWarehouseId: form.value.warehouseId,
          sourceAreaId: form.value.areaId ?? it.areaId,
          inventoryDetailId: it.id,
          targetAreaId: form.value.targetAreaId,
          sourceAreaName: useWmsStore().areaMap.get(form.value.areaId ?? it.areaId)?.areaName
        })
    }
  })
}

const getPlaceAndSkuKey = (row) => {
  return row.warehouseId + '_' + row.areaId + '_' + row.skuId
}
// 选择商品 end

// 初始化receipt-order-form ref
const movementForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('确认暂存移库单吗？');
  doSave()
}

const doSave = (movementOrderStatus = 0) => {
  movementForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    let details = []
    if (form.value.details?.length) {
      const invalidQuantityList = form.value.details.filter(it => !it.quantity)
      if (invalidQuantityList?.length) {
        return ElMessage.error('请选择数量')
      }
      // 构建参数
      details = form.value.details.map(it => {
        return {
          id: it.id,
          movementOrderId: form.value.id,
          skuId: it.skuId,
          quantity: it.quantity,
          batchNo: it.batchNo,
          productionDate: it.productionDate,
          expirationDate: it.expirationDate,
          inventoryDetailId: it.inventoryDetailId,
          sourceWarehouseId: form.value.warehouseId,
          sourceAreaId: it.sourceAreaId,
          targetWarehouseId: form.value.targetWarehouseId,
          targetAreaId: it.targetAreaId,
          snCodes: it.snCodes || null
        }
      })
    }

    const params = {
      id: form.value.id,
      movementOrderNo: form.value.movementOrderNo,
      movementOrderStatus,
      remark: form.value.remark,
      totalQuantity: form.value.totalQuantity,
      sourceWarehouseId: form.value.sourceWarehouseId,
      sourceAreaId: form.value.sourceAreaId,
      targetWarehouseId: form.value.targetWarehouseId,
      targetAreaId: form.value.targetAreaId,
      details: details
    }
    if (params.id) {
      updateMovementOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      })
    } else {
      addMovementOrder(params).then((res) => {
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
  await proxy?.$modal.confirm('确认作废移库单吗？');
  doSave(-1)
}

const doMovement = async () => {
  await proxy?.$modal.confirm('确认移库吗？');
  movementForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    if (!form.value.details?.length) {
      return ElMessage.error('请选择商品')
    }
    const invalidQuantityList = form.value.details.filter(it => !it.quantity)
    if (invalidQuantityList?.length) {
      return ElMessage.error('请选择移库数量')
    }

    // SN模式校验：如果开启了SN模式且有SN管理的商品，必须选择SN码
    if (mode.value) {
      const snEnabledItems = form.value.details.filter(detail =>
        detail.itemSku && detail.itemSku.snEnabled === 1
      )
      if (snEnabledItems.length > 0) {
        const missingSnItems = snEnabledItems.filter(detail =>
          !detail.snCodes || detail.snCodes.length === 0
        )
        if (missingSnItems.length > 0) {
          const itemNames = missingSnItems.map(d => d.itemSku?.item?.itemName || d.itemSku?.skuName || '未知商品').join('、')
          return ElMessage.error(`以下商品需要选择SN码：${itemNames}`)
        }
      }
    }

    // 构建参数
    const details = form.value.details.map(it => {
      return {
        id: it.id,
        movementOrderId: form.value.id,
        skuId: it.skuId,
        quantity: it.quantity,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        inventoryDetailId: it.inventoryDetailId,
        sourceWarehouseId: form.value.sourceWarehouseId,
        sourceAreaId: it.sourceAreaId,
        targetWarehouseId: form.value.targetWarehouseId,
        targetAreaId: it.targetAreaId,
        snCodes: it.snCodes || null
      }
    })

    //('提交前校验',form.value)
    const params = {
      id: form.value.id,
      movementOrderNo: form.value.movementOrderNo,
      remark: form.value.remark,
      totalQuantity: form.value.totalQuantity,
      sourceWarehouseId: form.value.sourceWarehouseId,
      sourceAreaId: form.value.sourceAreaId,
      targetWarehouseId: form.value.targetWarehouseId,
      targetAreaId: form.value.targetAreaId,
      details: details
    }
    movement(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('移库成功')
        close()
      } else {
        ElMessage.error(res.msg)
      }
    })
  })
}

const route = useRoute();
onMounted(() => {
  const id = route.query && route.query.id;
  if (id) {
    loadDetail(id)
  } else {
    form.value.movementOrderNo = 'YK' + generateNo()
  }
})


// 获取移库单详情
const loadDetail = (id) => {
  loading.value = true
  getMovementOrder(id).then((response) => {

    if (response.data.details?.length) {
      response.data.details.forEach(detail => {
        detail.sourceAreaName = useWmsStore().areaMap.get(detail.sourceAreaId)?.areaName
        detail.targetAreaName = useWmsStore().areaMap.get(detail.targetAreaId)?.areaName
        // 处理SN码数据
        if (detail.snCodes) {
          if (typeof detail.snCodes === 'string') {
            try {
              detail.snCodes = JSON.parse(detail.snCodes)
            } catch (e) {
              detail.snCodes = detail.snCodes.split(',').filter(s => s.trim())
            }
          }
        }
        // 兼容处理：如果itemSku为空对象或缺少必要属性，需要进行初始化
        if (!detail.itemSku || !detail.itemSku.item) {
          // 从缓存中获取完整的itemSku数据
          if (detail.skuId) {
            detail.itemSku = {
              id: detail.skuId,
              skuName: detail.itemSku?.skuName || '',
              skuCode: detail.itemSku?.skuCode || '',
              barcode: detail.itemSku?.barcode || '',
              snEnabled: detail.itemSku?.snEnabled || 0,
              item: detail.itemSku?.item || {
                itemName: detail.itemSku?.item?.itemName || '',
                itemCode: detail.itemSku?.item?.itemCode || '',
                itemBrand: detail.itemSku?.item?.itemBrand || null
              }
            }
          }
        }
      })
      selectedInventory.value = response.data.details.map(it => {
        return {
          id: it.inventoryDetailId,
          areaId: it.sourceAreaId
        }
      })
    }
    form.value = {...response.data}
    inventorySelectRef.value.setWarehouseIdAndAreaId(form.value.sourceWarehouseId, form.value.sourceAreaId)
    Promise.resolve();
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleChangeSourceWarehouse = (e) => {
  form.value.sourceAreaId = undefined
  form.value.details = []
  inventorySelectRef.value.setWarehouseIdAndAreaId(form.value.sourceWarehouseId, form.value.sourceAreaId)
}

const handleChangeSourceArea = (e) => {
  inventorySelectRef.value.setWarehouseIdAndAreaId(form.value.sourceWarehouseId, form.value.sourceAreaId)
  form.value.details = form.value.details.filter(it => it.sourceAreaId === e)
  selectedInventory.value = selectedInventory.value.filter(selected => selected.areaId === e)
}

const handleChangeTargetWarehouse = (e) => {
  form.value.targetAreaId = undefined
  form.value.details.forEach(it => {
    it.targetWarehouseId = e
    it.targetAreaId = undefined
  })

}

const handleChangeTargetArea = (e) => {
  ('targetAreaId', e)
  ('form.value.targetAreaId', form.value.targetAreaId)
  form.value.details.forEach(it => it.targetAreaId = e)
}

const handleChangeQuantity = () => {
  let sum = 0
  form.value.details.forEach(it => {
    if (it.quantity) {
      sum += Number(it.quantity)
    }
  })
  form.value.totalQuantity = sum
}

const handleDeleteDetail = (row, index) => {
  if (row.id) {
    proxy.$modal.confirm('确认删除本条商品明细吗？如确认会立即执行！').then(function () {
      return delMovementOrderDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      proxy.$modal.msgSuccess("删除成功");
    })
  } else {
    form.value.details.splice(index, 1)
    const indexOfSelected = selectedInventory.value.findIndex(it => it.id === row.inventoryDetailId)
    selectedInventory.value.splice(indexOfSelected, 1)
  }
}

/** SN模式相关函数 */
const goSaasTip = () => {
  // SN模式开启前校验
  if (!form.value.sourceWarehouseId || !form.value.targetWarehouseId) {
    ElMessage.warning('请先选择源仓库和目标仓库！')
    return false
  }
  if (!form.value.details || form.value.details.length === 0) {
    ElMessage.warning('请先添加商品！')
    return false
  }

  // 检查是否有商品支持SN模式
  const hasSnEnabledItem = form.value.details.some(detail =>
    detail.itemSku && detail.itemSku.snEnabled === 1
  )

  if (!hasSnEnabledItem) {
    ElMessage.warning('当前商品列表中没有启用SN管理的商品，无法开启SN模式！')
    return false
  }

  ElMessage.success('SN模式已开启，请为SN管理的商品选择SN码')
  return true
}

/** 检查是否需要启用SN模式 */
const checkSnEnabled = (row) => {
  if (!mode.value || !row.itemSku) return false
  return row.itemSku.snEnabled === 1
}

/** 显示SN码选择对话框 */
const showSnSelect = (row) => {
  snSelectRow.value = row
  snSelectDialog.value = true
  resetSnQuery()
}

/** 重置SN查询 */
const resetSnQuery = () => {
  snQueryParams.value.querySnCode = null
  snQueryParams.value.querySkuId = snSelectRow.value?.skuId
  snQueryParams.value.queryWarehouseId = form.value.sourceWarehouseId
  snQueryParams.value.queryAreaId = form.value.sourceAreaId
  snQueryParams.value.queryStatus = 0
  snQueryParams.value.pageNum = 1
  getAvailableSnList()
}

/** 查询可用SN列表 */
const getAvailableSnList = () => {
  snLoading.value = true
  listItemSnBySkuId(snSelectRow.value?.skuId).then(response => {
    // 过滤在库状态的SN
    let list = response.data || []
    if (snQueryParams.value.querySnCode) {
      list = list.filter(item => item.snCode.includes(snQueryParams.value.querySnCode))
    }
    // 只显示源仓库源库区的SN
    availableSnList.value = list.filter(item =>
      item.status === 0 &&
      item.warehouseId === form.value.sourceWarehouseId &&
      item.areaId === form.value.sourceAreaId
    )
    snTotal.value = availableSnList.value.length
    snLoading.value = false
    // 恢复已选择的项
    nextTick(() => {
      if (snTableRef.value) {
        const selectedSnCodes = snSelectRow.value?.snCodes || []
        availableSnList.value.forEach(row => {
          if (selectedSnCodes.includes(row.snCode)) {
            snTableRef.value.toggleRowSelection(row, true)
          }
        })
      }
    })
  })
}

/** 多选框选中数据 */
const handleSnSelectionChange = (selection) => {
  selectedSnList.value = selection
}

/** 确认选择SN码 */
const confirmSnSelection = () => {
  if (!snSelectRow.value) return

  // 过滤掉已选择的SN码
  const currentSnCodes = snSelectRow.value.snCodes || []
  const newSnCodes = selectedSnList.value
    .filter(sn => !currentSnCodes.includes(sn.snCode))
    .map(sn => sn.snCode)

  if (snSelectRow.value.snCodes) {
    snSelectRow.value.snCodes.push(...newSnCodes)
  } else {
    snSelectRow.value.snCodes = newSnCodes
  }

  // 更新数量
  snSelectRow.value.quantity = snSelectRow.value.snCodes.length

  snSelectDialog.value = false
  ElMessage.success(`成功选择${newSnCodes.length}个SN码`)
}

/** 删除SN码 */
const removeSnCode = (row, index) => {
  if (!row.snCodes) return
  row.snCodes.splice(index, 1)
  row.quantity = row.snCodes.length
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

.sn-mode-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sn-code-list {
  margin-top: 8px;
  max-height: 120px;
  overflow-y: auto;
}

.text-muted {
  color: #909399;
  font-size: 14px;
}
</style>
