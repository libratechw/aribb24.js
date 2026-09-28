import AVLTree from '@/util/avl';
import { describe, test, expect } from 'vitest';

const compareNumber = (a: number, b: number) => {
  return Math.sign(a - b) as (-1 | 0 | 1);
}

describe("AVL", () => {
  test('range includes both endpoints', () => {
    const avl = new AVLTree<number, number>(compareNumber, compareNumber, (val) => val);
    for (const value of [1, 2, 3]) avl.insert(value, value);
    expect([...avl.range(2, 2)]).toEqual([2]);
    expect([...avl.range(1.5, 3)]).toEqual([2, 3]);
  });
  test('range includes every key sharing its upper order boundary', () => {
    const compareKey = (a: { dts: number; lang: number }, b: { dts: number; lang: number }) =>
      compareNumber(a.dts, b.dts) || compareNumber(a.lang, b.lang);
    const avl = new AVLTree<{ dts: number; lang: number }, string, number>(
      compareKey, compareNumber, ({ dts }) => dts,
    );
    avl.insert({ dts: 1, lang: 0 }, 'management');
    avl.insert({ dts: 1, lang: 1 }, 'statement');
    expect([...avl.range(0, 1)]).toEqual(['management', 'statement']);
    expect([...avl.range(1, 1)]).toEqual(['management', 'statement']);
  });
  test('floor and ceil retain an ancestor candidate across the opposite branch', () => {
    for (const keys of [[5, 0, 10, 15], Array.from({length: 100}, (_, index) => index)]) {
      const avl = new AVLTree<number, number>(compareNumber, compareNumber, (val) => val);
      for (const value of keys) avl.insert(value, value);
      const sorted = [...keys].sort((a, b) => a - b);
      for (let query = sorted[0] - 1; query <= sorted.at(-1)! + 1; query++) {
        expect(avl.floor(query)).toBe(sorted.filter(value => value <= query).at(-1));
        expect(avl.ceil(query)).toBe(sorted.find(value => value >= query));
      }
    }
  });

  test('Insert', () => {
    const avl = new AVLTree<number, number>(compareNumber, compareNumber, (val) => val);

    const data = Array.from({ length: 100}, (_, i) => i);
    for (const datum of data) {
      avl.insert(datum, datum);
    }

    for (const datum of data) {
      expect(avl.get(datum)).toStrictEqual(datum);
    }
  });

  test('Delete', () => {
    const avl = new AVLTree<number, number>(compareNumber, compareNumber, (val) => val);

    const data = Array.from({ length: 120 }, (_, i) => Math.floor(Math.random() * 120));
    for (let i = 0; i < data.length; i++) {
      avl.insert(data[i], data[i]);
    }
    for (let i = 0; i < data.length; i += 4) {
      avl.delete(data[i]);
    }

    for (let i = 0; i < data.length; i += 4) {
      expect(avl.get(data[i])).toStrictEqual(undefined);
    }
  });
});
