<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="入库单基本信息">
        <el-form label-width="108px" :model="form" ref="receiptForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="入库单号" prop="receiptOrderNo">
                <el-input class="w200" v-model="form.receiptOrderNo" placeholder="入库单号" :disabled="form.id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="仓库" prop="warehouseId">
                <el-select v-model="form.warehouseId" placeholder="请选择仓库" @change="handleChangeWarehouse" filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="库区" prop="areaId">
                <el-popover
                  placement="left"
                  title="提示"
                  :width="200"
                  trigger="hover"
                  :disabled="form.warehouseId"
                  content="请先选择仓库！"
                >
                  <template #reference>
                    <el-select v-model="form.areaId" placeholder="请选择库区" :disabled="!form.warehouseId" clearable filterable @change="handleChangeArea" style="width: 100%!important;">
                      <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.warehouseId)" :key="item.id" :label="item.areaName" :value="item.id"/>
                    </el-select>
                  </template>
                </el-popover>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="入库类型" prop="receiptOrderType">
                <el-radio-group v-model="form.receiptOrderType">
                  <el-radio-button
                    v-for="item in wms_receipt_type"
                    :key="item.value"
                    :label="item.value"
                    >{{ item.label }}</el-radio-button
                  >
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="供应商" prop="merchantId">
                <el-select v-model="form.merchantId" placeholder="请选择供应商" clearable filterable>
                  <el-option v-for="item in useWmsStore().merchantList" :key="item.id" :label="item.merchantName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="订单号" prop="orderNo">
                <el-input v-model="form.orderNo" placeholder="请输入订单号"></el-input>
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
              <div style="display: flex;align-items: start">
                <el-form-item label="金额" prop="payableAmount">
                  <el-input-number v-model="form.payableAmount" :precision="2" :min="0"></el-input-number>
                </el-form-item>
                <el-button link type="primary" @click="handleAutoCalc" class="ml20" style="line-height: 32px">自动计算</el-button>
              </div>
            </el-col>
            <el-col :span="6">
              <el-form-item label="数量" prop="totalQuantity">
                <el-input-number v-model="form.totalQuantity" :controls="false" :precision="0" :disabled="true"></el-input-number>
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
              :disabled="form.warehouseId"
              content="请先选择仓库！"
            >
              <template #reference>
                <el-button type="primary" plain="plain" size="default" @click="showAddItem" icon="Plus" :disabled="!form.warehouseId">添加商品</el-button>
              </template>
            </el-popover>
          </div>
          <el-table :data="form.details" border empty-text="暂无商品明细">
            <el-table-column label="商品信息" prop="itemSku.itemName">
              <template #default="{ row }">
                <div>{{ row.itemSku.item.itemName + (row.itemSku.item.itemCode ? ('(' + row.itemSku.item.itemCode + ')') : '') }}</div>
                <div v-if="row.itemSku.item.itemBrand">品牌：{{ useWmsStore().itemBrandMap.get(row.itemSku.item.itemBrand).brandName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="规格信息">
              <template #default="{ row }">
                <div>{{ row.itemSku.skuName }}</div>
                <div v-if="row.itemSku.barcode">条码：{{row.itemSku.barcode}}</div>
              </template>
            </el-table-column>
            <el-table-column label="库区" prop="itemSku.skuName" width="200">
              <template #default="{ row }">
                <el-popover
                  placement="left"
                  title="提示"
                  :width="200"
                  trigger="hover"
                  :disabled="form.warehouseId"
                  content="请先选择仓库！"
                >
                  <template #reference>
                    <el-select v-model="row.areaId" placeholder="请选择库区" :disabled="!form.warehouseId || !!form.areaId" filterable>
                      <el-option v-for="item in useWmsStore().areaList.filter(it => it.warehouseId === form.warehouseId)" :key="item.id" :label="item.areaName" :value="item.id"/>
                    </el-select>
                  </template>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="quantity" width="280">
              <template #default="scope">
                <!-- SN模式：显示SN码输入 -->
                <div v-if="mode && checkSnEnabled(scope.row)">
                  <div class="sn-mode-quantity">
                    <span>数量：{{ scope.row.quantity }}</span>
                    <el-button type="primary" size="small" icon="Edit" @click="showSnInput(scope.row)">
                      {{ scope.row.snCodes && scope.row.snCodes.length > 0 ? '编辑SN码' : '添加SN码' }}
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
                  placeholder="数量"
                  :min="1"
                  :precision="0"
                  @change="handleChangeQuantity"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="价格" prop="amount" width="180">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.amount"
                  placeholder="价格"
                  :precision="2"
                  :min="0"
                  :max="2147483647"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="批号" prop="batchNo" width="150">
              <template #default="scope">
                <el-input v-model="scope.row.batchNo"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="生产日期/过期日期" width="250">
              <template #default="scope">
                <div class="flex-center">
                  <span>生产日期：</span>
                  <el-date-picker
                    v-model="scope.row.productionDate"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 150px!important;"
                  />
                </div>
                <div class="flex-center mt5">
                  <span>过期日期：</span>
                  <el-date-picker
                    v-model="scope.row.expirationDate"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 150px!important;"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="right" fixed="right">
              <template #default="scope">
                <el-button icon="Delete" type="danger" plain size="small" @click="handleDeleteDetail(scope.row, scope.$index)" link>删除</el-button>
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
    </div>

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
    <div class="footer-global">
      <div class="btn-box">
        <div>
          <el-button @click="doWarehousing" type="primary" class="ml10">完成入库</el-button>
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

<script setup name="ReceiptOrderEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRef, toRefs, watch, nextTick} from "vue";
import {addReceiptOrder, getReceiptOrder, updateReceiptOrder, warehousing} from "@/api/wms/receiptOrder";
import {ElMessage, ElMessageBox} from "element-plus";
import SkuSelect from "../../../components/SkuSelect.vue";
import {useRoute} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import { numSub, generateNo } from '@/utils/ruoyi'
import { delReceiptOrderDetail } from '@/api/wms/receiptOrderDetail'

const {proxy} = getCurrentInstance();
const { wms_receipt_type } = proxy.useDict("wms_receipt_type");
const mode = ref(false)
const loading = ref(false)
const initFormData = {
  id: undefined,
  receiptOrderNo: undefined,
  receiptOrderType: "2",
  merchantId: undefined,
  orderNo: undefined,
  payableAmount: undefined,
  receiptOrderStatus: 0,
  remark: undefined,
  warehouseId: undefined,
  areaId: undefined,
  totalQuantity: 0,
  details: [],
}
const data = reactive({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    receiptOrderNo: undefined,
    receiptOrderType: undefined,
    orderNo: undefined,
    payableAmount: undefined,
    receiptOrderStatus: undefined,
  },
  rules: {
    id: [
      {required: true, message: "不能为空", trigger: "blur"}
    ],
    receiptOrderNo: [
      {required: true, message: "入库单号不能为空", trigger: "blur"}
    ],
    receiptOrderType: [
      {required: true, message: "入库类型不能为空", trigger: "change"}
    ],
    receiptOrderStatus: [
      {required: true, message: "入库状态不能为空", trigger: "change"}
    ],
    warehouseId: [
      {required: true, message: "请选择仓库", trigger: ['blur', 'change']}
    ],
  }
});
const { form, rules} = toRefs(data);

const cancel = async () => {
  await proxy?.$modal.confirm('确认取消编辑入库单吗？');
  close()
}
const close = () => {
  const obj = {path: "/receiptOrder"};
  proxy?.$tab.closeOpenPage(obj);
}
const skuSelectShow = ref(false)

// 选择商品 start
const showAddItem = () => {
  skuSelectShow.value = true
}
// 选择成功
const handleOkClick = (item) => {
  skuSelectShow.value = false
  item.forEach((it) => {
    form.value.details.push(
      {
        itemSku: {...it},
        amount: undefined,
        quantity: it.quantity,
        batchNo: undefined,
        productionDate: undefined,
        expirationDate: undefined,
        warehouseId: form.value.warehouseId,
        areaId: form.value.areaId
      }
    )
  })
}
// 选择商品 end

// 初始化receipt-order-form ref
const receiptForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('确认暂存入库单吗？');
  doSave()
}

const doSave = async (receiptOrderStatus = 0) => {
  //验证receiptForm表单
  receiptForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    if (form.value.details?.length) {
      const invalidAreaList = form.value.details.filter(it => !it.areaId )
      if (invalidAreaList?.length) {
        return ElMessage.error('请选择库区')
      }
      const invalidQuantityList = form.value.details.filter(it => !it.quantity)
      if (invalidQuantityList?.length) {
        return ElMessage.error('请选择数量')
      }
    }
    // 构建参数
    const details = form.value.details.map(it => {
      return {
        id: it.id,
        receiptOrderId: form.value.id,
        skuId: it.itemSku.id,
        amount: it.amount,
        quantity: it.quantity,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        warehouseId: form.value.warehouseId,
        areaId: it.areaId,
        snCodes: it.snCodes || null
      }
    })

    const params = {
      id: form.value.id,
      receiptOrderNo: form.value.receiptOrderNo,
      receiptOrderStatus,
      receiptOrderType: form.value.receiptOrderType,
      merchantId: form.value.merchantId,
      orderNo: form.value.orderNo,
      remark: form.value.remark,
      payableAmount: form.value.payableAmount,
      totalQuantity: form.value.totalQuantity,
      warehouseId: form.value.warehouseId,
      areaId: form.value.areaId,
      details: details
    }
    if (params.id) {
      updateReceiptOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      })
    } else {
      addReceiptOrder(params).then((res) => {
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
  await proxy?.$modal.confirm('确认作废入库单吗？');
  doSave(-1)
}

const doWarehousing = async () => {
  await proxy?.$modal.confirm('确认入库吗？');
  receiptForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    if (!form.value.details?.length) {
      return ElMessage.error('请选择商品')
    }
    const invalidAreaList = form.value.details.filter(it => !it.areaId )
    if (invalidAreaList?.length) {
      return ElMessage.error('请选择库区')
    }
    const invalidQuantityList = form.value.details.filter(it => !it.quantity)
    if (invalidQuantityList?.length) {
      return ElMessage.error('请选择数量')
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
        receiptOrderId: form.value.id,
        skuId: it.itemSku.id,
        amount: it.amount,
        quantity: it.quantity,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        warehouseId: form.value.warehouseId,
        areaId: it.areaId,
        snCodes: it.snCodes || null
      }
    })

    //('提交前校验',form.value)
    const params = {
      id: form.value.id,
      receiptOrderNo: form.value.receiptOrderNo,
      receiptOrderStatus: form.value.receiptOrderStatus,
      receiptOrderType: form.value.receiptOrderType,
      merchantId: form.value.merchantId,
      orderNo: form.value.orderNo,
      remark: form.value.remark,
      payableAmount: form.value.payableAmount,
      totalQuantity: form.value.totalQuantity,
      warehouseId: form.value.warehouseId,
      areaId: form.value.areaId,
      details: details
    }
    warehousing(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('入库成功')
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
    form.value.receiptOrderNo = 'RK' + generateNo()
  }
})


// 获取入库单详情
const loadDetail = (id) => {
  loading.value = true
  getReceiptOrder(id).then((response) => {
    form.value = {...response.data}
    // 处理SN码数据
    if (form.value.details?.length) {
      form.value.details.forEach(detail => {
        if (detail.snCodes) {
          // 如果是字符串，尝试解析为数组
          if (typeof detail.snCodes === 'string') {
            try {
              detail.snCodes = JSON.parse(detail.snCodes)
            } catch (e) {
              // 如果JSON解析失败，尝试按逗号分隔
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
    Promise.resolve();
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleChangeWarehouse = (e) => {
  form.value.areaId = undefined
  form.value.details.forEach(it => {
    it.areaId = undefined
  })
}

const handleChangeArea = (e) => {
  form.value.details.forEach(it => {
    it.areaId = e
  })
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

const handleAutoCalc = () => {
  let sum = undefined
  form.value.details.forEach(it => {
    if (it.amount >= 0) {
      if (!sum) {
        sum = 0
      }
      sum = numSub(sum, -Number(it.amount))
    }
  })
  form.value.payableAmount = sum
}

const handleDeleteDetail = (row, index) => {
  if (row.id) {
    proxy.$modal.confirm('确认删除本条商品明细吗？如确认会立即执行！').then(function () {
      return delReceiptOrderDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      proxy.$modal.msgSuccess("删除成功");
    });
  } else {
    form.value.details.splice(index, 1)
  }
}
/** SN码输入对话框状态 */
const snInputDialog = ref(false)
const snInputRow = ref(null)
const snInputForm = reactive({
  singleSn: '',
  batchSn: '',
  generateCount: 10,
  prefix: 'SN'
})

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
  snInputRow.value.quantity = snInputRow.value.snCodes.length
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
    snInputRow.value.quantity = snInputRow.value.snCodes.length
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

  snInputRow.value.quantity = snInputRow.value.snCodes.length
  ElMessage.success(`成功生成${count}个SN码`)
  snInputDialog.value = false
}

/** 删除SN码 */
const removeSnCode = (row, index) => {
  if (!row.snCodes) return
  row.snCodes.splice(index, 1)
  row.quantity = row.snCodes.length
}

const goSaasTip = () => {
  // SN模式开启前校验
  if (!form.value.warehouseId) {
    ElMessage.warning('请先选择仓库！')
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

  ElMessage.success('SN模式已开启，请为SN管理的商品录入SN码')
  return true
}

/** 检查是否需要启用SN模式 */
const checkSnEnabled = (row) => {
  if (!mode.value || !row.itemSku) return false
  return row.itemSku.snEnabled === 1
}

/** 初始化明细行的SN码数组 */
const initDetailSnCodes = (row) => {
  if (!row.snCodes) {
    row.snCodes = []
  }
  row.snEnabled = checkSnEnabled(row)
}

/** 监听明细变化，自动初始化SN码 */
watch(() => form.value.details, (newDetails) => {
  newDetails.forEach(row => {
    initDetailSnCodes(row)
  })
}, { immediate: true })
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
