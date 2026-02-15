import { describe, it, expect } from 'vitest';
import {
  toProperCase,
  toUpperCase,
  listToDelimitedString,
  mergeListUnique,
  listContainsAny,
  listContains,
  removeFromList,
  removeByKey,
  groupBy,
  sortByPosition,
  toMap,
  findByKey
} from './collections.js';

describe('Collection Utilities', () => {
  describe('toProperCase', () => {
    it('should capitalize first letter of each word', () => {
      expect(toProperCase('hello world')).toBe('Hello World');
      expect(toProperCase('HELLO WORLD')).toBe('Hello World');
      expect(toProperCase('hElLo WoRlD')).toBe('Hello World');
    });

    it('should handle empty string', () => {
      expect(toProperCase('')).toBe('');
    });

    it('should handle single word', () => {
      expect(toProperCase('hello')).toBe('Hello');
    });
  });

  describe('toUpperCase', () => {
    it('should convert to uppercase', () => {
      expect(toUpperCase('hello')).toBe('HELLO');
    });

    it('should handle null/undefined', () => {
      expect(toUpperCase(null as any)).toBe('');
      expect(toUpperCase(undefined as any)).toBe('');
    });
  });

  describe('listToDelimitedString', () => {
    it('should join with default delimiter', () => {
      expect(listToDelimitedString(['a', 'b', 'c'])).toBe('a • b • c');
    });

    it('should join with custom delimiter', () => {
      expect(listToDelimitedString(['a', 'b', 'c'], ', ')).toBe('a, b, c');
    });

    it('should filter out falsy values', () => {
      expect(listToDelimitedString(['a', '', 'b', null as any, 'c'])).toBe('a • b • c');
    });

    it('should handle empty array', () => {
      expect(listToDelimitedString([])).toBe('');
    });
  });

  describe('mergeListUnique', () => {
    interface Item { id: string; name: string }

    it('should merge two lists removing duplicates', () => {
      const list1: Item[] = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }];
      const list2: Item[] = [{ id: '2', name: 'B2' }, { id: '3', name: 'C' }];

      const result = mergeListUnique(list1, list2, item => item.id);

      expect(result).toHaveLength(3);
      expect(result.map(r => r.id)).toEqual(['1', '2', '3']);
      // First occurrence wins
      expect(result.find(r => r.id === '2')?.name).toBe('B');
    });

    it('should handle empty lists', () => {
      const list1: Item[] = [];
      const list2: Item[] = [{ id: '1', name: 'A' }];

      expect(mergeListUnique(list1, list2, item => item.id)).toHaveLength(1);
      expect(mergeListUnique(list2, list1, item => item.id)).toHaveLength(1);
    });
  });

  describe('listContainsAny', () => {
    it('should return true if any item matches', () => {
      expect(listContainsAny([1, 2, 3], [3, 4, 5])).toBe(true);
      expect(listContainsAny(['a', 'b'], ['b', 'c'])).toBe(true);
    });

    it('should return false if no items match', () => {
      expect(listContainsAny([1, 2, 3], [4, 5, 6])).toBe(false);
    });

    it('should handle empty arrays', () => {
      expect(listContainsAny([], [1, 2, 3])).toBe(false);
      expect(listContainsAny([1, 2, 3], [])).toBe(false);
    });
  });

  describe('listContains', () => {
    it('should return true if item exists', () => {
      expect(listContains([1, 2, 3], 2)).toBe(true);
    });

    it('should return false if item does not exist', () => {
      expect(listContains([1, 2, 3], 4)).toBe(false);
    });
  });

  describe('removeFromList', () => {
    it('should remove items matching predicate', () => {
      const list = [1, 2, 3, 4, 5];
      const result = removeFromList(list, x => x % 2 === 0);
      expect(result).toEqual([1, 3, 5]);
    });

    it('should not modify original array', () => {
      const list = [1, 2, 3];
      removeFromList(list, x => x === 2);
      expect(list).toEqual([1, 2, 3]);
    });
  });

  describe('removeByKey', () => {
    interface Item { id: string }

    it('should remove items by key', () => {
      const list: Item[] = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const result = removeByKey(list, ['2'], item => item.id);
      expect(result.map(r => r.id)).toEqual(['1', '3']);
    });

    it('should handle non-existent keys', () => {
      const list: Item[] = [{ id: '1' }];
      const result = removeByKey(list, ['999'], item => item.id);
      expect(result).toHaveLength(1);
    });
  });

  describe('groupBy', () => {
    interface Item { type: string; name: string }

    it('should group items by key', () => {
      const items: Item[] = [
        { type: 'fruit', name: 'apple' },
        { type: 'vegetable', name: 'carrot' },
        { type: 'fruit', name: 'banana' }
      ];

      const grouped = groupBy(items, item => item.type as 'fruit' | 'vegetable');

      expect(grouped.fruit).toHaveLength(2);
      expect(grouped.vegetable).toHaveLength(1);
    });
  });

  describe('sortByPosition', () => {
    interface Item { pos: number; name: string }

    it('should sort by numeric position', () => {
      const items: Item[] = [
        { pos: 3, name: 'C' },
        { pos: 1, name: 'A' },
        { pos: 2, name: 'B' }
      ];

      const sorted = sortByPosition(items, item => item.pos);

      expect(sorted.map(s => s.name)).toEqual(['A', 'B', 'C']);
    });

    it('should not modify original array', () => {
      const items: Item[] = [{ pos: 2, name: 'B' }, { pos: 1, name: 'A' }];
      sortByPosition(items, item => item.pos);
      expect(items[0].name).toBe('B');
    });
  });

  describe('toMap', () => {
    interface Item { id: string; value: number }

    it('should create map from list', () => {
      const items: Item[] = [
        { id: 'a', value: 1 },
        { id: 'b', value: 2 }
      ];

      const map = toMap(items, item => item.id as 'a' | 'b');

      expect(map.a.value).toBe(1);
      expect(map.b.value).toBe(2);
    });
  });

  describe('findByKey', () => {
    interface Item { id: string; name: string }

    it('should find item by key', () => {
      const items: Item[] = [
        { id: '1', name: 'First' },
        { id: '2', name: 'Second' }
      ];

      const found = findByKey(items, '2', item => item.id);
      expect(found?.name).toBe('Second');
    });

    it('should return undefined if not found', () => {
      const items: Item[] = [{ id: '1', name: 'First' }];
      expect(findByKey(items, '999', item => item.id)).toBeUndefined();
    });
  });
});
