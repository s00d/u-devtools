<docs>
# Card Component

Карточка — это универсальный контейнер для группировки связанного контента.

## Основное использование

Простая карточка с заголовком и описанием:

```vue
<Card title="Hello World" description="This is a simple card example">
  <p>Card content goes here.</p>
</Card>
```

## Карточка с футером

Используйте слот `footer` для добавления действий в нижнюю часть карточки:

```vue
<Card title="Card with Actions" description="This card has a footer">
  <p>Card content.</p>
  <template #footer>
    <div class="flex gap-2">
      <Button label="Save" variant="primary" />
      <Button label="Cancel" variant="secondary" />
    </div>
  </template>
</Card>
```

## Минимальная карточка

Карточка может использоваться без заголовка и описания, только с контентом:

```vue
<Card>
  <p>Just content, no title or description.</p>
</Card>
```
</docs>

<script setup>
import Card from './Card.vue';
import Button from '../Button/Button.vue';
</script>

<script>
// Экспорт целевого компонента для Matrix View
import Card from './Card.vue';
export const component = Card;
</script>

<template>
  <div class="p-10 flex flex-col gap-4 max-w-2xl">
    <!-- Simple card -->
    <Card title="Hello World" description="This is a simple card example">
      <p class="text-gray-700 dark:text-gray-300">
        This is the card content. You can put any content here.
      </p>
    </Card>

    <!-- Card with footer -->
    <Card title="Card with Actions" description="This card has a footer with buttons">
      <p class="text-gray-700 dark:text-gray-300">
        Card content goes here.
      </p>
      <template #footer>
        <div class="flex gap-2">
          <Button label="Save" variant="primary" size="sm" />
          <Button label="Cancel" variant="secondary" size="sm" />
        </div>
      </template>
    </Card>

    <!-- Card without title -->
    <Card>
      <p class="text-gray-700 dark:text-gray-300">
        This card has no title or description, just content.
      </p>
    </Card>
  </div>
</template>

