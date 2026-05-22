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
      v-for="item in locationList"
      :key="item.id"
      :label="getOptionLabel(item)"
      :value="item.id"
    />
  </el-select>
</template>

<script setup name="LocationSelect">
import { onMounted, ref, watch } from 'vue';
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
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const locationList = ref([]);

const getOptionLabel = (item) => {
  return item.locationCode ? `${item.locationName} (${item.locationCode})` : item.locationName;
};

const handleChange = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
};

const loadLocationList = async () => {
  const query = {};
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
