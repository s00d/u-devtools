export interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
  data?: Record<string, unknown>;
  isExpanded?: boolean;
  isSelected?: boolean;
  isCurrent?: boolean;
  icon?: string;
  [key: string]: unknown;
}

export interface DropdownOption {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
}

export interface ColorOption {
  name: string;
  value: string; // Tailwind class (e.g., 'text-red-500', 'bg-blue-600')
  hex?: string; // Hex color for preview
}
