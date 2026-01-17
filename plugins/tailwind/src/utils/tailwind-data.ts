// Static data for Tailwind utilities
// This can be expanded with more comprehensive lists

export const DISPLAY_UTILITIES = [
  'block',
  'inline-block',
  'inline',
  'flex',
  'inline-flex',
  'grid',
  'inline-grid',
  'table',
  'inline-table',
  'table-row',
  'table-cell',
  'contents',
  'list-item',
  'hidden',
] as const;

export const FLEX_DIRECTION_UTILITIES = [
  'flex-row',
  'flex-row-reverse',
  'flex-col',
  'flex-col-reverse',
] as const;

export const JUSTIFY_UTILITIES = [
  'justify-start',
  'justify-end',
  'justify-center',
  'justify-between',
  'justify-around',
  'justify-evenly',
] as const;

export const ALIGN_ITEMS_UTILITIES = [
  'items-start',
  'items-end',
  'items-center',
  'items-baseline',
  'items-stretch',
] as const;

export const ALIGN_CONTENT_UTILITIES = [
  'content-start',
  'content-end',
  'content-center',
  'content-between',
  'content-around',
  'content-evenly',
  'content-baseline',
  'content-stretch',
] as const;

export const VARIANTS = [
  'hover',
  'focus',
  'active',
  'disabled',
  'dark',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
] as const;
