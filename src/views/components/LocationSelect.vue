<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    filterable
    :filter-method="handleFilter"
    style="width: 100%"
    @update:model-value="handleChange"
  >
    <el-option
      v-for="item in filteredLocationList"
      :key="item.id"
      :label="getOptionLabel(item)"
      :value="item.id"
    />
  </el-select>
</template>

<script setup name="LocationSelect">
import { computed, onMounted, ref, watch } from 'vue';
import { listLocationNoPage } from '@/api/wms/location';

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
  rackId: {
    type: [Number, String],
    default: undefined
  },
  placeholder: {
    type: String,
    default: '请选择货位'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  /** 外部预加载的货位列表，传入后组件不再自行请求接口 */
  options: {
    type: Array,
    default: undefined
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const locationList = ref([]);
const filterQuery = ref('');

/** 优先使用外部传入的 options，否则使用内部加载的 locationList */
const internalLocationList = computed(() => {
  if (props.options !== undefined) {
    // 如果外部传入了 options，根据 rackId 过滤（因为不同行可能有不同货架）
    if (props.rackId) {
      return props.options.filter(item => !item.rackId || item.rackId === props.rackId);
    }
    return props.options;
  }
  return locationList.value;
});

/** 根据搜索关键字过滤后的货位列表（忽略大小写模糊匹配） */
const filteredLocationList = computed(() => {
  const query = filterQuery.value.trim().toLowerCase();
  if (!query) return internalLocationList.value;
  return internalLocationList.value.filter(item => {
    const name = (item.locationName || '').toLowerCase();
    const code = (item.locationCode || '').toLowerCase();
    return name.includes(query) || code.includes(query);
  });
});

const handleFilter = (val) => {
  filterQuery.value = val;
};

const getOptionLabel = (item) => {
  return item.locationName;
};

const handleChange = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
};

const loadLocationList = async () => {
  // 如果外部传入了 options，不需要自行加载
  if (props.options !== undefined) return;
  const query = { pageSize: 99999 };
  if (props.warehouseId !== undefined && props.warehouseId !== null && props.warehouseId !== '') {
    query.warehouseId = props.warehouseId;
  }
  if (props.areaId !== undefined && props.areaId !== null && props.areaId !== '') {
    query.areaId = props.areaId;
  }
  if (props.rackId !== undefined && props.rackId !== null && props.rackId !== '') {
    query.rackId = props.rackId;
  }
  const res = await listLocationNoPage(query);
  locationList.value = res.data || [];
  if (props.modelValue && !locationList.value.some(item => item.id === props.modelValue)) {
    emit('update:modelValue', undefined);
  }
};

watch(
  () => [props.warehouseId, props.areaId, props.rackId],
  () => {
    loadLocationList();
  }
);

onMounted(() => {
  loadLocationList();
});
</script>
