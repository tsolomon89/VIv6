/**
 * Collection utilities ported from oblio_eav custom_functions.dart
 */

/**
 * Convert a string to proper case (capitalize first letter of each word)
 */
export function toProperCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert a string to upper case
 */
export function toUpperCase(str: string): string {
  return str?.toUpperCase() || '';
}

/**
 * Join a list of strings with a bullet delimiter
 */
export function listToDelimitedString(list: string[], delimiter = ' • '): string {
  return list.filter(Boolean).join(delimiter);
}

/**
 * Merge two lists, removing duplicates based on a key function
 */
export function mergeListUnique<T>(
  list1: T[],
  list2: T[],
  keyFn: (item: T) => string
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of [...list1, ...list2]) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

/**
 * Check if a list contains any of the specified items
 */
export function listContainsAny<T>(list: T[], items: T[]): boolean {
  const listSet = new Set(list);
  return items.some(item => listSet.has(item));
}

/**
 * Check if a list contains a specific item
 */
export function listContains<T>(list: T[], item: T): boolean {
  return list.includes(item);
}

/**
 * Remove items from a list based on a predicate
 */
export function removeFromList<T>(
  list: T[],
  predicate: (item: T) => boolean
): T[] {
  return list.filter(item => !predicate(item));
}

/**
 * Remove items from a list by key
 */
export function removeByKey<T>(
  list: T[],
  keysToRemove: string[],
  keyFn: (item: T) => string
): T[] {
  const removeSet = new Set(keysToRemove);
  return list.filter(item => !removeSet.has(keyFn(item)));
}

/**
 * Group items in a list by a key function
 */
export function groupBy<T, K extends string>(
  list: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return list.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

/**
 * Sort a list by a numeric key
 */
export function sortByPosition<T>(
  list: T[],
  positionFn: (item: T) => number
): T[] {
  return [...list].sort((a, b) => positionFn(a) - positionFn(b));
}

/**
 * Create a map from a list using a key function
 */
export function toMap<T, K extends string>(
  list: T[],
  keyFn: (item: T) => K
): Record<K, T> {
  return list.reduce((acc, item) => {
    acc[keyFn(item)] = item;
    return acc;
  }, {} as Record<K, T>);
}

/**
 * Find an item in a list by key
 */
export function findByKey<T>(
  list: T[],
  key: string,
  keyFn: (item: T) => string
): T | undefined {
  return list.find(item => keyFn(item) === key);
}
