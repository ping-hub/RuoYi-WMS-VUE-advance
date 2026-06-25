<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    filterable
    style="width: 100%"
    @update:model-value="handleChange"
  >
    <el-option
      v-for="item in internalRackList"
      :key="item.id"
      :label="getOptionLabel(item)"
      :value="item.id"
    />
  </el-select>
</template>

<script setup name="RackSelect">
import { computed, onMounted, ref, watch } from 'vue';
import { listRackNoPage } from '@/api/wms/rack';

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: undefined
  },
  warehouseId: {
    type: [Number, String],
    default: undefined
  },
  areaId: {
    type: [Number, String],
    default: undefined
  },
  placeholder: {
    type: String,
    default: '请选择货架'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  /** 外部预加载的货架列表，传入后组件不再自行请求接口 */
  options: {
    type: Array,
    default: undefined
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const rackList = ref([]);

/** 优先使用外部传入的 options，否则使用内部加载的 rackList */
const internalRackList = computed(() => {
  if (props.options !== undefined) {
    return props.options;
  }
  return rackList.value;
});

const getOptionLabel = (item) => {
  return item.rackCode ? `${item.rackName} (${item.rackCode})` : item.rackName;
};

const handleChange = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
};

const loadRackList = async () => {
  // 如果外部传入了 options，不需要自行加载
  if (props.options !== undefined) return;
  const query = {};
  if (props.warehouseId !== undefined && props.warehouseId !== null && props.warehouseId !== '') {
    query.warehouseId = props.warehouseId;
  }
  if (props.areaId !== undefined && props.areaId !== null && props.areaId !== '') {
    query.areaId = props.areaId;
  }
  const res = await listRackNoPage(query);
  rackList.value = res.data || [];
  if (props.modelValue && !rackList.value.some(item => item.id === props.modelValue)) {
    emit('update:modelValue', undefined);
  }
};

watch(
  () => [props.warehouseId, props.areaId],
  () => {
    loadRackList();
  }
);

onMounted(() => {
  loadRackList();
});
</script>
