import {useTreeId} from 'core.pkg';
import {createStore, useGlobalStoreRead, useGlobalStoreWrite} from './Store';

/**
 * @type {WeakMap<object, WeakMap<object, Store>}
 */
let storesMap = new WeakMap();

/**
 * 
 * @param {object} scope
 * @param {object} data 
 */
export let useStoreInit = (scope, data) => {
    if (scope !== Object(scope)) {
        throw new TypeError('The store scope must be a reference type.');
    }
    let treeId = useTreeId();
    let scoped = storesMap.get(treeId);
    if (scoped === undefined) {
        scoped = new WeakMap();
        storesMap.set(treeId, scoped);
    }
    if (scoped.has(scope)) {
        if (__DEV__) {
            console.warn('The store already has been initialized.');
        }
    } else {
        scoped.set(scope, createStore(data));
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
    let treeId = useTreeId();
    let scoped = storesMap.get(treeId);
    if (scoped !== undefined) {
        store = scoped.get(scope);
    }
    if (store === undefined) {
        throw new ReferenceError('Attempting to access an uninitialized store.');
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
