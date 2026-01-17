import type { TailwindConfigSummary } from '../types';

// Convert HEX/RGB to RGB object
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Parse RGB string to RGB object
function parseRgb(rgb: string): { r: number; g: number; b: number } | null {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  };
}

// Color distance (simple Euclidean metric)
function colorDistance(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number }
): number {
  return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));
}

// Find closest color in config
export function findClosestColor(
  computedColor: string,
  config: TailwindConfigSummary,
  prefix: 'bg' | 'text' | 'border' = 'bg'
): string | null {
  const target = parseRgb(computedColor);
  if (!target) return null;

  let bestMatch = { name: '', diff: Infinity };

  Object.entries(config.theme.colors).forEach(([colorName, shades]) => {
    if (typeof shades === 'string') {
      const rgb = hexToRgb(shades);
      if (rgb) {
        const diff = colorDistance(target, rgb);
        if (diff < bestMatch.diff) {
          bestMatch = { name: colorName, diff };
        }
      }
    } else {
      Object.entries(shades).forEach(([shade, hex]) => {
        const rgb = hexToRgb(hex as string);
        if (rgb) {
          const diff = colorDistance(target, rgb);
          if (diff < bestMatch.diff) {
            bestMatch = { name: `${colorName}-${shade}`, diff };
          }
        }
      });
    }
  });

  return bestMatch.diff < 50 ? `${prefix}-${bestMatch.name}` : null; // Similarity threshold
}

// Find closest size (px -> rem -> class)
export function findClosestSize(
  pxValue: string,
  configSection: Record<string, string>,
  prefix: string
): string {
  const px = parseFloat(pxValue);
  if (Number.isNaN(px)) return '';

  let bestMatch = { key: '', diff: Infinity };

  Object.entries(configSection).forEach(([key, val]) => {
    // Convert rem to px (assume base = 16px)
    let valPx = 0;
    if (typeof val === 'string') {
      if (val.endsWith('rem')) {
        valPx = parseFloat(val) * 16;
      } else if (val.endsWith('px')) {
        valPx = parseFloat(val);
      } else {
        return;
      }
    } else {
      return;
    }

    const diff = Math.abs(px - valPx);
    if (diff < bestMatch.diff) {
      bestMatch = { key, diff };
    }
  });

  return bestMatch.diff < 4 ? `${prefix}-${bestMatch.key}` : `[${px}px]`; // If far - use arbitrary
}

// Reverse engineer computed styles to Tailwind classes
export function reverseEngineerStyles(
  computed: Record<string, string>,
  config: TailwindConfigSummary
): string[] {
  const suggestions: Set<string> = new Set();

  // 1. Colors (Background)
  if (
    computed.backgroundColor &&
    computed.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
    computed.backgroundColor !== 'transparent'
  ) {
    const bgClass = findClosestColor(computed.backgroundColor, config, 'bg');
    if (bgClass) suggestions.add(bgClass);
  }

  // 2. Colors (Text)
  if (computed.color) {
    const textClass = findClosestColor(computed.color, config, 'text');
    if (textClass) suggestions.add(textClass);
  }

  // 3. Typography
  if (computed.fontSize && config.theme?.fontSize) {
    // Ищем точное или близкое совпадение размера шрифта
    const size = parseFloat(computed.fontSize);
    const fontSizeMatch = findClosestSize(computed.fontSize, config.theme.fontSize as any, 'text');
    if (fontSizeMatch) suggestions.add(fontSizeMatch);
  }

  if (computed.fontWeight === '700' || computed.fontWeight === 'bold') {
    suggestions.add('font-bold');
  }
  if (computed.fontWeight === '600') {
    suggestions.add('font-semibold');
  }
  if (computed.fontWeight === '500') {
    suggestions.add('font-medium');
  }
  if (computed.fontStyle === 'italic') {
    suggestions.add('italic');
  }
  if (computed.textAlign && computed.textAlign !== 'start') {
    suggestions.add(`text-${computed.textAlign}`);
  }

  // 4. Spacing (Padding/Margin)
  if (computed.padding && config.theme?.spacing) {
    const paddingMatch = findClosestSize(computed.padding, config.theme.spacing, 'p');
    if (paddingMatch) suggestions.add(paddingMatch);
  }

  if (computed.margin && config.theme?.spacing) {
    const marginMatch = findClosestSize(computed.margin, config.theme.spacing, 'm');
    if (marginMatch) suggestions.add(marginMatch);
  }

  // 5. Layout
  if (computed.display === 'flex') {
    suggestions.add('flex');
    if (computed.flexDirection === 'column') suggestions.add('flex-col');
    if (computed.flexDirection === 'row') suggestions.add('flex-row');
    if (computed.justifyContent === 'center') suggestions.add('justify-center');
    if (computed.justifyContent === 'space-between') suggestions.add('justify-between');
    if (computed.justifyContent === 'space-around') suggestions.add('justify-around');
    if (computed.justifyContent === 'flex-start') suggestions.add('justify-start');
    if (computed.justifyContent === 'flex-end') suggestions.add('justify-end');
    if (computed.alignItems === 'center') suggestions.add('items-center');
    if (computed.alignItems === 'flex-start') suggestions.add('items-start');
    if (computed.alignItems === 'flex-end') suggestions.add('items-end');
    if (computed.alignItems === 'stretch') suggestions.add('items-stretch');
  } else if (computed.display === 'grid') {
    suggestions.add('grid');
  } else if (computed.display === 'block') {
    suggestions.add('block');
  } else if (computed.display === 'none') {
    suggestions.add('hidden');
  }

  // 6. Gap
  if (computed.gap && config.theme?.spacing) {
    const gapMatch = findClosestSize(computed.gap, config.theme.spacing, 'gap');
    if (gapMatch) suggestions.add(gapMatch);
  }

  // 7. Visuals
  if (computed.borderRadius && computed.borderRadius !== '0px') {
    // Упрощенно - просто rounded, можно улучшить для rounded-lg, rounded-xl и т.д.
    suggestions.add('rounded');
  }

  if (computed.boxShadow && computed.boxShadow !== 'none') {
    suggestions.add('shadow');
  }

  return Array.from(suggestions);
}
