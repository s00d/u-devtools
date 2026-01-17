/**
 * Helper to normalize component state from CustomInspectorState to ComponentState format
 */
export function normalizeComponentState(data: any): any {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Check if data has a 'state' property
  const stateArray = data.state;
  
  if (!stateArray || !Array.isArray(stateArray)) {
    return null;
  }

  // Фильтруем невалидные элементы перед обработкой
  const originalLength = stateArray.length;
  const invalidIndices: number[] = [];
  const filteredStateArray = stateArray.filter((item: any, index: number) => {
    if (item == null) {
      invalidIndices.push(index);
      return false;
    }
    if (typeof item !== 'object') {
      invalidIndices.push(index);
      return false;
    }
    // Проверяем наличие хотя бы одного из обязательных полей
      if (!('key' in item) && !('type' in item) && !('value' in item)) {
        invalidIndices.push(index);
        return false;
      }
      return true;
    });

  // Initialize result structure
  const result: Record<string, any[]> = {
    props: [],
    data: [],
    computed: [],
    setupState: [],
    methods: [],
    attrs: [],
    provide: [],
    inject: [],
    refs: [],
  };

  // Helper to safely format value
  const formatValue = (val: any): any => {
    if (val === undefined) return 'undefined';
    if (val === null) return null;
    if (typeof val === 'function') return 'function() { ... }';
    if (typeof val === 'symbol') return String(val);
    
    // Если это DOM элемент
    if (val instanceof HTMLElement) {
      return `<${val.tagName.toLowerCase()} ${val.id ? '#'+val.id : ''} ... />`;
    }
    
    // Если это массив, обрабатываем рекурсивно (но не глубоко)
    if (Array.isArray(val)) {
      return `Array(${val.length})`;
    }
    
    // Если объект большой, не пытаемся его развернуть полностью
    if (typeof val === 'object') {
        const keys = Object.keys(val);
        if (keys.length > 5) return `Object({ ${keys.slice(0, 3).join(', ')}, ... })`;
        return val; // Simple objects are fine
    }

    return val;
  };

  // Group states by type and stateType (используем отфильтрованный массив)
  filteredStateArray.forEach((item: any) => {
    // Проверка item перед доступом к свойствам
    if (!item || typeof item !== 'object') {
      return; 
    }

    // Безопасное чтение свойств
    const itemType = 'type' in item ? String(item.type || '') : '';
    const stateType = ('stateType' in item || 'stateTypeName' in item) 
      ? String(item.stateType || item.stateTypeName || '') 
      : '';
    
    const stateItem = {
      key: 'key' in item ? String(item.key || 'unknown') : 'unknown',
      type: itemType || 'unknown',
      value: 'value' in item ? formatValue(item.value) : undefined,
      editable: 'editable' in item ? item.editable !== false : true,
    };

    // Mapping
    if (itemType === 'props' || stateType === 'props') result.props.push(stateItem);
    else if (itemType === 'data' || stateType === 'data') result.data.push(stateItem);
    else if (itemType === 'computed' || stateType === 'computed') result.computed.push(stateItem);
    else if (itemType === 'setup' && (stateType === 'reactive' || stateType === 'ref')) result.setupState.push(stateItem);
    else if (typeof item.value === 'function' || itemType.includes('method')) result.methods.push(stateItem);
    else if (itemType === 'attrs' || stateType === 'attrs') result.attrs.push(stateItem);
    else if (itemType === 'provide' || stateType.includes('provide')) result.provide.push(stateItem);
    else if (itemType === 'inject' || stateType === 'inject') result.inject.push(stateItem);
    else if (itemType === 'refs' || stateType === 'refs') result.refs.push(stateItem);
    else if (itemType.includes('setup')) result.setupState.push(stateItem);
  });

  // Convert setupState array to object for the final structure
  const setupStateObj = result.setupState.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, any>);

  return {
    ...result,
    setupState: setupStateObj
  };
}
