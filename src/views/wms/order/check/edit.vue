<template>
  <div v-if="!checking" style="display: flex;justify-content: center;align-items: center;height: 80vh">
    <el-card header="选择仓库库区开始盘库" >
      <el-form>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="form.warehouseId" placeholder="请选择仓库" :disabled="checking"
                     filterable>
            <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                       :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="库区" prop="areaId">
          <el-select v-model="form.areaId" placeholder="请选择库区" :disabled="!form.warehouseId || checking" clearable filterable>
            <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.warehouseId)"
                       :key="item.id" :label="item.areaName" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain="plain" size="default" @click="startCheck"  style="width: 100%!important;">开始盘库</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
  <div v-else v-loading="loading">
    <div class="receipt-order-edit-wrapper app-container" style="margin-bottom: 60px">
      <el-card header="盘库单基本信息">
        <el-form label-width="108px" :model="form" ref="checkForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="盘库单号" prop="checkOrderNo">
                <el-input class="w200" v-model="form.checkOrderNo" placeholder="盘库单号"
                          :disabled="form.id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="仓库" prop="warehouseId">
                <el-select v-model="form.warehouseId" placeholder="请选择仓库" :disabled="checking"
                           filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                             :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="库区" prop="areaId">
                <el-select v-model="form.areaId" placeholder="请选择库区" :disabled="!form.warehouseId || checking" clearable filterable>
                  <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.warehouseId)"
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
              <el-form-item label="盈亏数" prop="checkOrderTotal">
                <el-input-number v-model="form.checkOrderTotal" :controls="false" :precision="0"
                                 :disabled="true"></el-input-number>
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
                  <el-button type="primary" plain="plain" size="default" @click="showSkuSelect" icon="Plus"
                             :disabled="!form.warehouseId">新增库存
                  </el-button>
          </div>
          <el-table :data="form.details" border empty-text="暂无商品明细">
            <el-table-column label="商品信息" prop="itemSku.itemName">
              <template #default="scope">
                  <div>{{
                      scope.row.itemSku.item.itemName + (scope.row.itemSku.item.itemCode ? ('(' + scope.row.itemSku.item.itemCode + ')') : '')
                    }}
                  </div>
                  <div v-if="scope.row.itemSku.item.itemBrand">
                    品牌：{{ useWmsStore().itemBrandMap.get(scope.row.itemSku.item.itemBrand).brandName }}
                  </div>
                </template>
            </el-table-column>
            <el-table-column label="规格信息">
              <template #default="{ row }">
                <template v-if="row.newInventoryDetail">
                  <div v-if="row.itemSku">{{ row.itemSku.skuName + (row.itemSku.barcode ? ('(' + row.itemSku.barcode + ')') : '') }}</div>
                  <div v-else>请选择商品</div>
                </template>
                <template v-else>
                  <div>{{ row.itemSku.skuName + (row.itemSku.barcode ? ('(' + row.itemSku.barcode + ')') : '') }}</div>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="库区" prop="areaName" width="200">
              <template #default="{ row }">
                <template v-if="row.newInventoryDetail">
                  <el-select v-model="row.areaId" placeholder="请选择库区" :disabled="form.areaId" filterable>
                    <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.warehouseId)"
                               :key="item.id" :label="item.areaName" :value="item.id"/>
                  </el-select>
                </template>
                <template v-else>
                  <div>{{ row.areaName }}</div>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="批号" prop="batchNo">
              <template #default="{ row }">
                <template v-if="row.newInventoryDetail">
                  <el-input v-model="row.batchNo"></el-input>
                </template>
                <template v-else>
                  <div>{{ row.batchNo }}</div>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="生产日期/过期日期" prop="productionDate" width="250">
              <template #default="{ row }">
                <template v-if="row.newInventoryDetail">
                  <div class="flex-center">
                    <span>生产日期：</span>
                    <el-date-picker
                      v-model="row.productionDate"
                      type="date"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 150px!important;"
                    />
                  </div>
                  <div class="flex-center mt5">
                    <span>过期日期：</span>
                    <el-date-picker
                      v-model="row.expirationDate"
                      type="date"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 150px!important;"
                    />
                  </div>
                </template>
                <template v-else>
                  <div v-if="row.productionDate">生产日期：{{ row.productionDate.substring(0, 10) }}</div>
                  <div v-if="row.expirationDate">过期日期：{{ row.expirationDate.substring(0, 10) }}</div>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="入库日期" prop="receiptTime" width="200">
              <template #default="{ row }">
                <template v-if="row.newInventoryDetail">
                  <el-date-picker
                    v-model="row.receiptTime"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 150px!important;"
                  />
                </template>
                <div v-else>
                  {{ parseTime(row.receiptTime,  '{y}-{m}-{d}') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="账面库存" align="right" width="150">
              <template #default="{ row }">
                <el-statistic :value="Number(row.quantity)" :precision="0"/>
              </template>
            </el-table-column>
            <el-table-column label="盈亏数" prop="remainQuantity" align="right" width="150">
              <template #default="{ row }">
                <el-statistic :value="Number(row.checkQuantity) - Number(row.quantity)" :precision="0"/>
              </template>
            </el-table-column>
            <el-table-column label="实际库存" prop="checkQuantity" width="280">
              <template #default="scope">
                <!-- SN模式：显示SN码管理 -->
                <div v-if="mode && checkSnEnabled(scope.row)">
                  <div class="sn-mode-quantity">
                    <span>数量：{{ scope.row.checkQuantity }}</span>
                    <el-button type="primary" size="small" icon="Edit" @click="showSnInput(scope.row)">
                      {{ scope.row.snCodes && scope.row.snCodes.length > 0 ? '编辑SN码' : '录入SN码' }}
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
                  v-model="scope.row.checkQuantity"
                  placeholder="实际库存"
                  :min="0"
                  @change="handleChangeQuantity"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="right" fixed="right">
              <template #default="scope">
                <el-button icon="Delete" type="danger" plain size="small" v-if="scope.row.newInventoryDetail"
                           @click="handleDeleteDetail(scope.row, scope.$index)" link>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <SkuSelect
        ref="sku-select"
        :model-value="skuSelectShow"
        @handleOkClick="handleOkClick"
        @handleCancelClick="skuSelectShow = false"
        :size="'80%'"
      />

    <!-- SN码输入对话框 -->
    <el-dialog title="SN码管理" v-model="snInputDialog" width="700px" append-to-body>
      <el-form label-width="100px">
        <el-form-item label="单个SN码">
          <el-input
            v-model="snInputForm.singleSn"
            placeholder="请输入或扫描SN码"
            clearable
            @keyup.enter="addSingleSnCode"
            class="sn-single-input"
          >
            <template #append>
              <el-button type="primary" @click="addSingleSnCode">添加</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="批量SN码">
          <el-input
            v-model="snInputForm.batchSn"
            type="textarea"
            :rows="5"
            placeholder="请输入SN码，每行一个"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="addBatchSnCodes">批量添加</el-button>
          <el-button type="warning" @click="generateSnCodes" class="ml10">自动生成</el-button>
        </el-form-item>
        <el-divider />
        <el-form-item label="生成数量">
          <el-input-number v-model="snInputForm.generateCount" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="SN前缀">
          <el-input v-model="snInputForm.prefix" placeholder="SN码前缀" clearable />
        </el-form-item>
        <el-form-item label="已添加SN">
          <div class="sn-code-list">
            <el-tag
              v-for="(sn, index) in (snInputRow?.snCodes || [])"
              :key="index"
              size="small"
              closable
              @close="removeSnCode(snInputRow, index)"
            >
              {{ sn }}
            </el-tag>
            <span v-if="!snInputRow?.snCodes || snInputRow?.snCodes.length === 0" class="text-muted">
              暂无SN码
            </span>
          </div>
        </el-form-item>
        <el-form-item label="SN数量">
          <span>{{ snInputRow?.snCodes?.length || 0 }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="snInputDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    </div>
    <div class="footer-global" v-if="checking">
      <div class="btn-box">
        <div>
          <el-button @click="doCheck" type="primary" class="ml10">完成盘库</el-button>
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

<script setup name="CheckOrderEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRef, toRefs, watch} from "vue";
import {addCheckOrder, getCheckOrder, updateCheckOrder, check} from "@/api/wms/checkOrder";
import {delCheckOrderDetail} from "@/api/wms/checkOrderDetail";
import {listInventoryDetailNoPage} from "@/api/wms/inventoryDetail";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import {numSub, generateNo} from '@/utils/ruoyi'
import SkuSelect from "@/views/components/SkuSelect.vue";

const {proxy} = getCurrentInstance();
const {wms_shipment_type} = proxy.useDict("wms_shipment_type");

const mode = ref(false)
const checkGreaterThanZero = ref(false)
const loading = ref(false)
const initFormData = {
  id: undefined,
  checkOrderNo: undefined,
  checkOrderStatus: 0,
  remark: undefined,
  warehouseId: undefined,
  areaId: undefined,
  checkOrderTotal: 0,
  details: [],
}
const inventorySelectRef = ref(null)
const selectedInventory = ref([])
const data = reactive({
  form: {...initFormData},
  rules: {
    checkOrderNo: [
      {required: true, message: "盘库单号不能为空", trigger: "blur"}
    ],
    warehouseId: [
      {required: true, message: "请选择仓库", trigger: ['blur', 'change']}
    ],
  }
});
const {form, rules} = toRefs(data);
const cancel = async () => {
  await proxy?.$modal.confirm('确认取消编辑盘库单吗？');
  close()
}
const close = () => {
  const obj = {path: "/checkOrder"};
  proxy?.$tab.closeOpenPage(obj);
}
const inventorySelectShow = ref(false)
const skuSelectShow = ref(false)
const currentSkuSelectIndex = ref(null)
// 盘库中标识
const checking = ref(false)

/** SN码相关变量 */
const snInputDialog = ref(false)
const snInputRow = ref(null)
const snInputForm = reactive({
  singleSn: '',
  batchSn: '',
  generateCount: 10,
  prefix: 'SN'
})

// 选择商品 start
const startCheck = () => {
  if (!form.value.warehouseId) {
    return ElMessage.error('请先选择仓库！')
  }
  const query = {
    warehouseId: form.value.warehouseId,
    areaId: form.value.areaId
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
            warehouseId: it.warehouseId,
            areaId: it.areaId,
            quantity: Number(it.remainQuantity),
            checkQuantity: Number(it.remainQuantity),
            areaName: useWmsStore().areaMap.get(it.areaId)?.areaName,
            batchNo: it.batchNo,
            productionDate: it.productionDate,
            expirationDate: it.expirationDate,
            receiptTime: it.createTime,
            newInventoryDetail: false
          }
        )
      }
    })
  }).finally(() => loading.value = false)
}
// 选择成功
const handleOkClick = (item) => {
  skuSelectShow.value = false
  selectedInventory.value = [...item]
  item.forEach(it => {
      form.value.details.push(
        {
          itemSku: {...it},
          skuId: it.id,
          warehouseId: form.value.warehouseId,
          inventoryDetailId: null,
          areaId: form.value.areaId,
          quantity: 0,
          checkQuantity: 0,
          areaName: useWmsStore().areaMap.get(form.value.areaId)?.areaName,
          batchNo: undefined,
          productionDate: undefined,
          expirationDate: undefined,
          receiptTime: proxy.parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
          newInventoryDetail: true
        })
  })
}

const showSkuSelect = () => {
  skuSelectShow.value = true
}
// 选择商品 end

// 初始化receipt-order-form ref
const checkForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('确认暂存盘库单吗？');
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
          batchNo: it.batchNo,
          productionDate: it.productionDate,
          expirationDate: it.expirationDate,
          receiptTime: it.receiptTime,
          snCodes: it.snCodes || null
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
  await proxy?.$modal.confirm('确认作废盘库单吗？');
  doSave(-1)
}

const doCheck = async () => {
  await proxy?.$modal.confirm('确认盘库结束吗？');
  checkForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    const newList = form.value.details.filter(it => it.newInventoryDetail)
    if (newList?.length) {
      if (newList.filter(it => !it.areaId)?.length) {
        return ElMessage.error('请选择库区')
      }
    }

    // SN模式校验：如果开启了SN模式且有SN管理的商品，必须录入SN码
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
          return ElMessage.error(`以下商品需要录入SN码：${itemNames}`)
        }
      }
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
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        receiptTime: it.receiptTime,
        inventoryDetailId: it.inventoryDetailId,
        snCodes: it.snCodes || null
      }
    })

    const params = {
      id: form.value.id,
      checkOrderNo: form.value.checkOrderNo,
      checkOrderTotal: form.value.checkOrderTotal,
      warehouseId: form.value.warehouseId,
      areaId: form.value.areaId,
      remark: form.value.remark,
      details: details
    }
    check(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('盘库成功')
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
    checking.value = true
    loadDetail(id)
  } else {
    form.value.checkOrderNo = 'PK' + generateNo()
  }
})


// 获取入库单详情
const loadDetail = (id) => {
  loading.value = true
  getCheckOrder(id).then((response) => {
    if (response.data.details?.length) {
      response.data.details.forEach(detail => {
        detail.areaName = useWmsStore().areaMap.get(detail.areaId)?.areaName
        detail.newInventoryDetail = !detail.inventoryDetailId
        detail.quantity = detail.remainQuantity
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
    }
    form.value = {...response.data}
    Promise.resolve();
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleDeleteDetail = (row, index) => {
  if (row.id) {
    proxy.$modal.confirm('确认删除本条商品明细吗？如确认会立即执行！').then(function () {
      return delCheckOrderDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      proxy.$modal.msgSuccess("删除成功");
    })
  } else {
    form.value.details.splice(index, 1)
  }
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

/** SN模式相关函数 */
const goSaasTip = () => {
  // SN模式开启前校验
  if (!form.value.warehouseId) {
    ElMessage.warning('请先选择仓库并开始盘库！')
    return false
  }
  if (!form.value.details || form.value.details.length === 0) {
    ElMessage.warning('请先开始盘库或添加库存！')
    return false
  }

  // 检查是否有商品支持SN模式
  const hasSnEnabledItem = form.value.details.some(detail =>
    detail.itemSku && detail.itemSku.snEnabled === 1
  )

  if (!hasSnEnabledItem) {
    ElMessage.warning('当前库存列表中没有启用SN管理的商品，无法开启SN模式！')
    return false
  }

  ElMessage.success('SN模式已开启，请为SN管理的商品录入SN码')
  return true
}

/** 检查是否需要启用SN模式 */
const checkSnEnabled = (row) => {
  if (!mode.value || !row.itemSku) return false
  return row.itemSku.snEnabled === 1
}

/** 显示SN码输入对话框 */
const showSnInput = (row) => {
  snInputRow.value = row
  snInputDialog.value = true
  resetSnInputForm()
}

/** 重置SN输入表单 */
const resetSnInputForm = () => {
  snInputForm.singleSn = ''
  snInputForm.batchSn = ''
  snInputForm.generateCount = 10
  snInputForm.prefix = 'SN'
}

/** 添加单个SN码 */
const addSingleSnCode = () => {
  if (!snInputForm.singleSn) {
    ElMessage.warning('请输入SN码')
    return
  }
  if (!snInputRow.value.snCodes) {
    snInputRow.value.snCodes = []
  }
  if (snInputRow.value.snCodes.includes(snInputForm.singleSn)) {
    ElMessage.warning('SN码已存在')
    return
  }
  snInputRow.value.snCodes.push(snInputForm.singleSn)
  snInputRow.value.checkQuantity = snInputRow.value.snCodes.length
  snInputForm.singleSn = ''
  nextTick(() => {
    const input = document.querySelector('.sn-single-input .el-input__inner')
    if (input) input.focus()
  })
}

/** 批量添加SN码 */
const addBatchSnCodes = () => {
  if (!snInputForm.batchSn) {
    ElMessage.warning('请输入SN码')
    return
  }
  const lines = snInputForm.batchSn.split('\n').filter(line => line.trim())
  if (lines.length === 0) {
    ElMessage.warning('请输入SN码')
    return
  }

  if (!snInputRow.value.snCodes) {
    snInputRow.value.snCodes = []
  }

  let addedCount = 0
  const duplicateCodes = []
  lines.forEach(line => {
    const snCode = line.trim()
    if (!snCode) return
    if (snInputRow.value.snCodes.includes(snCode)) {
      duplicateCodes.push(snCode)
    } else {
      snInputRow.value.snCodes.push(snCode)
      addedCount++
    }
  })

  if (duplicateCodes.length > 0) {
    ElMessage.warning(`以下SN码已存在，已跳过：${duplicateCodes.join('、')}`)
  }

  if (addedCount > 0) {
    snInputRow.value.checkQuantity = snInputRow.value.snCodes.length
    ElMessage.success(`成功添加${addedCount}个SN码`)
  }
  snInputDialog.value = false
}

/** 自动生成SN码 */
const generateSnCodes = () => {
  const count = snInputForm.generateCount || 10
  const prefix = snInputForm.prefix || 'SN'

  if (!snInputRow.value.snCodes) {
    snInputRow.value.snCodes = []
  }

  const timestamp = Date.now()
  for (let i = 0; i < count; i++) {
    const snCode = `${prefix}${timestamp}${String(i + 1).padStart(3, '0')}`
    if (!snInputRow.value.snCodes.includes(snCode)) {
      snInputRow.value.snCodes.push(snCode)
    }
  }

  snInputRow.value.checkQuantity = snInputRow.value.snCodes.length
  ElMessage.success(`成功生成${count}个SN码`)
  snInputDialog.value = false
}

/** 删除SN码 */
const removeSnCode = (row, index) => {
  if (!row.snCodes) return
  row.snCodes.splice(index, 1)
  row.checkQuantity = row.snCodes.length
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
.hover-text {
  color: black; /* 初始文字颜色 */
  text-decoration: none; /* 初始没有下划线 */
  transition: color 0.3s, text-decoration 0.3s; /* 平滑过渡效果 */
}

.hover-text:hover {
  color: #409EFF; /* 鼠标移上去时文字颜色变为蓝色 */
  text-decoration: underline; /* 鼠标移上去时带有下划线 */
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
