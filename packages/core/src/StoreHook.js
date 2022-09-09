import {resolveRootVNode} from './CurrentlyProcessing';
import {createStore, useGlobalReadableStore, useGlobalWritableStore} from './Store';

/**
 * @type {WeakMap<Store>}
 */
let storeMap = new WeakMap();

/**
 * 
 * @param {{}} initialData 
 */
export let applyStore = (initialData) => {
    let rootVNode = resolveRootVNode();
    if (storeMap.has(rootVNode)) {
        throw new Error('Store already has been applied');
    }
    storeMap.set(rootVNode, createStore(initialData));
};

/**
 * 
 * @returns {Store}
 * @throws
 */
export let useStore = () => {
    let rootVNode = resolveRootVNode();
    let store = storeMap.get(rootVNode);
    if (store === undefined) {
        throw new Error('Store has not been applied');
    }
    return store;
};

/**
 * 
 * @param {function} readFn
 * @param {function?} compareFn
 * @returns {any}
 * @throws
 */
export let useReadableStore = (readFn, compareFn) => {
    let store = useStore();
    return useGlobalReadableStore(store, readFn, compareFn);
};

/**
 * 
 * @param {function} writeFn
 * @returns {function}
 * @throws
 */
export let useWritableStore = (writeFn) => {
    let store = useStore();
    return useGlobalWritableStore(store, writeFn);
};
