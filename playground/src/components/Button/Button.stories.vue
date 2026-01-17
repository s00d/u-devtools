<script setup>
import Button from './Button.vue';
</script>

<script>
// Экспорт целевого компонента для Matrix View
import Button from './Button.vue';
export const component = Button;
</script>

<template>
  <div class="p-4 space-y-4">
    <Button label="Primary Button" variant="primary" />
    <Button label="Secondary Button" variant="secondary" />
    <Button label="Danger Button" variant="danger" />
    <Button label="Disabled Button" disabled />
    <Button label="Small Button" size="sm" variant="primary" />
    <Button label="Large Button" size="lg" variant="primary" />
  </div>
</template>

<docs>
# Button Component

Кнопка — это основной элемент взаимодействия в интерфейсе.

## Использование

Используйте `variant="primary"` для главных действий на странице, `variant="secondary"` для второстепенных действий и `variant="danger"` для деструктивных операций.

```vue
<Button label="Save" variant="primary" />
<Button label="Cancel" variant="secondary" />
<Button label="Delete" variant="danger" />
```

## Размеры

Компонент поддерживает три размера: `sm` (маленький), `md` (средний, по умолчанию) и `lg` (большой).

```vue
<Button label="Small" size="sm" />
<Button label="Medium" size="md" />
<Button label="Large" size="lg" />
```

## Состояния

Кнопка может быть отключена через проп `disabled`:

```vue
<Button label="Disabled Button" disabled />
```
</docs>

