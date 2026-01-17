/**
 * Class manipulation utilities
 * Handles adding, removing, sorting, and conflict resolution
 */

import { findConflictingClasses } from '../utils/conflicts';
import { sortClasses } from '../utils/sorter';

/**
 * Add a class, removing conflicts if needed
 */
export function addClass(classes: string[], newClass: string): string[] {
  // Find conflicts
  const conflicts = findConflictingClasses(newClass, classes);
  
  // Remove conflicts and add new class
  const filtered = classes.filter((c) => !conflicts.includes(c));
  filtered.push(newClass);
  
  return filtered;
}

/**
 * Remove a class
 */
export function removeClass(classes: string[], classToRemove: string): string[] {
  return classes.filter((c) => c !== classToRemove);
}

/**
 * Toggle a class
 */
export function toggleClass(
  classes: string[],
  classToToggle: string,
  groupRegex?: RegExp
): string[] {
  const hasClass = classes.includes(classToToggle);
  
  if (hasClass) {
    return removeClass(classes, classToToggle);
  } else {
    // If part of a group, remove group members first
    if (groupRegex) {
      const filtered = classes.filter((c) => !groupRegex.test(c));
      return addClass(filtered, classToToggle);
    }
    return addClass(classes, classToToggle);
  }
}

/**
 * Sort and deduplicate classes
 */
export function tidyClasses(classes: string[]): string[] {
  const unique = [...new Set(classes)];
  return sortClasses(unique);
}

/**
 * Check if classes array contains a class
 */
export function hasClass(classes: string[], className: string): boolean {
  return classes.includes(className);
}

