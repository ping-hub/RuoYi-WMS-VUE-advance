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
      v-for="item in rackList"
      :key="item.id"
      :label="getOptionLabel(item)"
      :value="item.id"
    />
  </el-select>
</template>

<script setup name="RackSelect">
import { onMounted, ref, watch } from 'vue';
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
  }
});

const emit = defineEmits(['update:modelValue']);

const rackList = ref([]);

const getOptionLabel = (item) => {
  return item.rackCode ? `${item.rackName} (${item.rackCode})` : item.rackName;
};

const handleChange = (value) => {
  emit('update:modelValue', value);
};

const loadRackList = async () => {
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
