// Mapping of class prefixes to property groups
// This is a simplified version, in reality it's more comprehensive
const PROPERTY_GROUPS: Record<string, string[]> = {
  spacing: ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'],
  sizing: ['w', 'h', 'min-w', 'max-w', 'min-h', 'max-h'],
  flex: ['flex', 'grid', 'block', 'inline', 'hidden', 'items', 'justify', 'content', 'gap'],
  typo: ['text', 'font', 'leading', 'tracking', 'align'],
  visual: ['bg', 'opacity', 'border', 'rounded', 'shadow'],
  position: ['absolute', 'relative', 'fixed', 'top', 'left', 'right', 'bottom', 'z'],
};

// Parse class name into components
export function parseClass(className: string): { variant: string; root: string; prefix: string } {
  // hover:bg-red-500 -> variant: hover, root: bg-red-500
  const parts = className.split(':');
  const root = parts.pop()!; // Last part
  const variant = parts.join(':'); // Everything before

  // bg-red-500 -> prefix: bg
  const dashIndex = root.indexOf('-');
  const prefix = dashIndex === -1 ? root : root.substring(0, dashIndex);

  return { variant, root, prefix };
}

// Find conflicting classes
export function findConflictingClasses(newClass: string, currentClasses: string[]): string[] {
  const parsedNew = parseClass(newClass);

  return currentClasses.filter((cls) => {
    // Don't conflict with itself
    if (cls === newClass) return false;

    const parsedOld = parseClass(cls);

    // Conflicts only within the same variant (hover:p-4 doesn't conflict with p-2)
    if (parsedOld.variant !== parsedNew.variant) return false;

    // Hard conflicts (p-4 vs p-8)
    if (parsedOld.prefix === parsedNew.prefix) {
      // Exceptions: text-red-500 and text-lg don't conflict, even though they start with text
      if (parsedNew.prefix === 'text') {
        // Simple heuristic: if both are colors or both are sizes
        const isColor1 =
          /text-(red|blue|green|gray|white|black|slate|indigo|purple|pink|yellow|orange|emerald|teal|cyan|sky|violet|fuchsia|rose|amber|lime|zinc|neutral|stone)/.test(
            newClass
          );
        const isColor2 =
          /text-(red|blue|green|gray|white|black|slate|indigo|purple|pink|yellow|orange|emerald|teal|cyan|sky|violet|fuchsia|rose|amber|lime|zinc|neutral|stone)/.test(
            cls
          );
        return isColor1 === isColor2;
      }
      return true;
    }

    return false;
  });
}
