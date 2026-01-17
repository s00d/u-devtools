// Class sorting order (simplified version)
// For full implementation, consider using prettier-plugin-tailwindcss

const VARIANT_ORDER = [
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  'hover',
  'focus',
  'active',
  'disabled',
  'dark',
];

// Prefix priority (lower = earlier in order)
const PREFIX_PRIORITY: Record<string, number> = {
  // Layout
  container: 1,
  // Position
  absolute: 2,
  relative: 2,
  fixed: 2,
  sticky: 2,
  // Layout properties
  top: 3,
  right: 3,
  bottom: 3,
  left: 3,
  z: 3,
  // Display
  flex: 4,
  grid: 4,
  block: 4,
  inline: 4,
  hidden: 4,
  // Flex/Grid
  'flex-row': 5,
  'flex-col': 5,
  'flex-wrap': 5,
  'grid-cols': 5,
  'grid-rows': 5,
  // Spacing
  m: 6,
  mt: 6,
  mr: 6,
  mb: 6,
  ml: 6,
  mx: 6,
  my: 6,
  p: 7,
  pt: 7,
  pr: 7,
  pb: 7,
  pl: 7,
  px: 7,
  py: 7,
  // Size
  w: 8,
  h: 8,
  'min-w': 8,
  'max-w': 8,
  'min-h': 8,
  'max-h': 8,
  // Typography
  text: 9,
  font: 9,
  leading: 9,
  tracking: 9,
  // Visual
  bg: 10,
  border: 10,
  rounded: 10,
  shadow: 10,
  opacity: 10,
  // Misc
  cursor: 11,
  transition: 11,
  transform: 11,
};

function getPrefixPriority(className: string): number {
  // Remove variant prefix
  const base = className.split(':').pop() || className;
  // Remove important
  const clean = base.startsWith('!') ? base.slice(1) : base;
  // Extract prefix
  const dashIndex = clean.indexOf('-');
  const prefix = dashIndex === -1 ? clean : clean.substring(0, dashIndex);

  return PREFIX_PRIORITY[prefix] || 99;
}

function getVariantOrder(className: string): number {
  if (!className.includes(':')) return -1;
  const variant = className.split(':')[0];
  const index = VARIANT_ORDER.indexOf(variant);
  return index === -1 ? 999 : index;
}

/**
 * Sort classes according to Tailwind recommended order
 */
export function sortClasses(classes: string[]): string[] {
  // 1. Separate variants from base classes
  const base: string[] = [];
  const variants: string[] = [];

  for (const c of classes) {
    if (c.includes(':')) {
      variants.push(c);
    } else {
      base.push(c);
    }
  }

  // 2. Sort base classes by prefix priority, then alphabetically
  base.sort((a, b) => {
    const priorityDiff = getPrefixPriority(a) - getPrefixPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return a.localeCompare(b);
  });

  // 3. Sort variants by variant order, then by base class priority
  variants.sort((a, b) => {
    const variantDiff = getVariantOrder(a) - getVariantOrder(b);
    if (variantDiff !== 0) return variantDiff;
    const priorityDiff = getPrefixPriority(a) - getPrefixPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return a.localeCompare(b);
  });

  return [...base, ...variants];
}
