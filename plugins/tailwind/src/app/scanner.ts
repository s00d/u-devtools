/**
 * Element Scanner
 * Reads computed styles from DOM elements
 */

export interface ComputedStyles {
  color: string;
  backgroundColor: string;
  fontSize: string;
  fontWeight: string;
  textAlign: string;
  display: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  gap: string;
  margin: string;
  padding: string;
  width: string;
  height: string;
  borderWidth: string;
  borderRadius: string;
  border: string;
  boxShadow: string;
}

/**
 * Scan element and extract computed styles
 */
export function scanElementStyles(el: HTMLElement): ComputedStyles {
  const styles = window.getComputedStyle(el);

  return {
    color: styles.color,
    backgroundColor: styles.backgroundColor,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    textAlign: styles.textAlign,
    display: styles.display,
    flexDirection: styles.flexDirection,
    justifyContent: styles.justifyContent,
    alignItems: styles.alignItems,
    gap: styles.gap,
    margin: styles.margin,
    padding: styles.padding,
    width: styles.width,
    height: styles.height,
    borderWidth: styles.borderWidth,
    borderRadius: styles.borderRadius,
    border: styles.border,
    boxShadow: styles.boxShadow,
  };
}

