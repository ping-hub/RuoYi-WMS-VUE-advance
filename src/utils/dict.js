import useDictStore from '@/store/modules/dict'
import { getDicts } from '@/api/system/dict/data'

/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({});
  // 预初始化每个 dictType 为空数组，确保 toRefs 能创建响应式 ref
  args.forEach(dictType => { res.value[dictType] = []; });
  const store = useDictStore();

  const fetchDicts = () => {
    args.forEach((dictType) => {
      const dicts = store.getDict(dictType);
      if (dicts) {
        res.value[dictType] = dicts;
      } else {
        getDicts(dictType).then(resp => {
          const data = resp.data.map(p => ({ label: p.dictLabel, value: p.dictValue, elTagType: p.listClass, elTagClass: p.cssClass }))
          res.value[dictType] = data;
          store.setDict(dictType, data);
        })
      }
    });
  };

  fetchDicts();

  // 监听 store version 变化（cleanDict 时自增），自动重新拉取字典
  watch(() => store.version, () => {
    fetchDicts();
  });

  return toRefs(res.value);
}
