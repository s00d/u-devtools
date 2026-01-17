import type { ClassToken } from '../types';

export interface ClassBreakdown {
  base: string[];
  sm: string[];
  md: string[];
  lg: string[];
  xl: string[];
  '2xl': string[];
  [key: string]: string[];
}

/**
 * Parse a Tailwind class into its components
 */
export function parseClassToken(className: string): ClassToken {
  const important = className.startsWith('!');
  const cleanClass = important ? className.slice(1) : className;

  // Split variant and utility
  const parts = cleanClass.split(':');
  const utility = parts.pop() || '';
  const variant = parts.join(':');

  // Extract prefix and value
  const dashIndex = utility.indexOf('-');
  const prefix = dashIndex === -1 ? utility : utility.substring(0, dashIndex);
  const value = dashIndex === -1 ? '' : utility.substring(dashIndex + 1);

  return {
    raw: className,
    utility,
    variant,
    prefix,
    value,
    important,
  };
}

/**
 * Group classes by breakpoint
 */
export function groupClassesByBreakpoint(classes: string[]): ClassBreakdown {
  const result: ClassBreakdown = { base: [], sm: [], md: [], lg: [], xl: [], '2xl': [] };

  classes.forEach((cls) => {
    const parts = cls.split(':');
    // If there's a prefix (md:p-4)
    if (parts.length > 1) {
      const bp = parts[0]; // md
      const util = parts.slice(1).join(':'); // p-4
      if (result[bp as keyof ClassBreakdown]) {
        result[bp as keyof ClassBreakdown].push(util);
      } else {
        // Custom screens or states (hover:) - put in base or separate group
        // For simplicity, only consider screens
        result.base.push(cls);
      }
    } else {
      result.base.push(cls);
    }
  });

  return result;
}

/**
 * Generate all possible utility classes from config
 * This is a simplified version - in production, you'd generate from actual Tailwind config
 */
export function generateUtilityClasses(config: any): string[] {
  const classes: string[] = [];

  // Generate spacing classes
  if (config.theme?.spacing) {
    const spacingKeys = Object.keys(config.theme.spacing);
    ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'].forEach(
      (prefix) => {
        spacingKeys.forEach((key) => {
          classes.push(`${prefix}-${key}`);
        });
      }
    );
  }

  // Generate color classes
  if (config.theme?.colors) {
    const colorKeys = Object.keys(config.theme.colors);
    ['bg', 'text', 'border'].forEach((prefix) => {
      colorKeys.forEach((color) => {
        classes.push(`${prefix}-${color}`);
      });
    });
  }

  // Add common utilities
  const common = [
    'flex',
    'grid',
    'block',
    'inline-block',
    'hidden',
    'flex-row',
    'flex-col',
    'justify-start',
    'justify-center',
    'justify-end',
    'justify-between',
    'justify-around',
    'items-start',
    'items-center',
    'items-end',
    'items-stretch',
    'w-full',
    'h-full',
    'w-auto',
    'h-auto',
  ];

  classes.push(...common);

  return classes;
}
