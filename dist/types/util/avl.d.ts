export default class AVLTree<K, V, O = K> {
    private root;
    private compareKey;
    private compareOrder;
    private calculateOrder;
    constructor(compare: (fst: K, snd: K) => -1 | 0 | 1, compareOrder: (fst: O, snd: O) => -1 | 0 | 1, calculateOrder: (key: K) => O);
    clear(): void;
    has(key: K): boolean;
    get(key: K): V | undefined;
    floor(key: K): V | undefined;
    ceil(key: K): V | undefined;
    forEach(func: (value: V) => void): void;
    range(from: O, to: O): Generator<V>;
    insert(key: K, value: V): void;
    delete(key: K): void;
    toString(): string;
}
//# sourceMappingURL=avl.d.ts.map