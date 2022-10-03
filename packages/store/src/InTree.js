import {resolveRootVNode} from 'core.pkg';
import {createStore, useGlobalStoreRead, useGlobalStoreWrite} from './Store';

/**
 * @type {WeakMap<VNode, WeakMap<object, Store>}
 */
let storesMap = new WeakMap();

/**
 * 
 * @param {object} scope
 * @param {{}} initialData 
 */
export let useStoreInit = (scope, initialData) => {
    let rootVNode = resolveRootVNode();
    let scoped = storesMap.get(rootVNode);
    if (scoped === undefined) {
        scoped = new WeakMap();
        storesMap.set(rootVNode, scoped);
    }
    if (scoped.has(scope)) {
        if (__DEV__) {
            console.error('Store already has been initialized');
        }
    } else {
        scoped.set(scope, createStore(initialData));
    }
};

/**
 * 
 * @param {object} scope
 * @returns {Store}
 * @throws
 */
export let useStore = (scope) => {
    let store;
    let rootVNode = resolveRootVNode();
    let scoped = storesMap.get(rootVNode);
    if (scoped !== undefined) {
        store = scoped.get(scope);
    }
    if (store === undefined) {
        throw new Error('Store has not been initialized');
    }
    return store;
};

/**
 * 
 * @param {object} scope
 * @param {function} readFn
 * @param {function?} compareFn
 * @returns {any}
 * @throws
 */
export let useStoreRead = (scope, readFn, compareFn) => {
    let store = useStore(scope);
    return useGlobalStoreRead(store, readFn, compareFn);
};

/**
 * 
 * @param {object} scope
 * @param {function} writeFn
 * @returns {function}
 * @throws
 */
export let useStoreWrite = (scope, writeFn) => {
    let store = useStore(scope);
    return useGlobalStoreWrite(store, writeFn);
};
