'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core_pkg = require('hook');

/**
 * 
 * @param {{}} initialData 
 * @returns {Store}
 */
let createStore = (initialData) => {
    if (!(
        initialData != null && // not nullish
        initialData.constructor === Object
    )) {
        throw new Error('Store data must be a plain object');
    }
    
    let data = initialData;
    let subscribers = new Set();

    return {
        get data() {
            return data;
        },
        setData(setFn) {
            setFn(data);
            subscribers.forEach((subscriber) => {
                subscriber(data);
            });
        },
        subscribe: subscribers.add.bind(subscribers),
        unsubscribe: subscribers.delete.bind(subscribers),
    };
};

/**
 * 
 * @param {Store} store
 * @param {function} readFn
 * @param {function?} compareFn
 * @returns {any}
 */
let useGlobalStoreRead = (store, readFn, compareFn) => {
    let datum = core_pkg.useState(readFn(store.data));

    core_pkg.useEffect(() => {
        let subscriber = (data) => {
            if (compareFn === undefined) {
                datum[1](readFn(data));
            } else {
                datum[1]((prevValue) => {
                    let newValue = readFn(data);
                    if (compareFn(prevValue, newValue)) {
                        return prevValue;
                    } else {
                        return newValue;
                    }
                });
            }
        };
        store.subscribe(subscriber);
        return () => {
            store.unsubscribe(subscriber);
        };
    }, [store, readFn, compareFn]);

    return datum[0];
};

/**
 * 
 * @param {Store} store
 * @param {function} writeFn
 * @returns {function}
 */
let useGlobalStoreWrite = (store, writeFn) => {
    return (value) => {
        store.setData((data) => {
            writeFn(data, value);
        });
    };
};

/**
 * @type {WeakMap<VNode, WeakMap<object, Store>}
 */
let storesMap = new WeakMap();

/**
 * 
 * @param {object} scope
 * @param {{}} initialData 
 */
let useStoreInit = (scope, initialData) => {
    let rootVNode = core_pkg.resolveRootVNode();
    let scoped = storesMap.get(rootVNode);
    if (scoped === undefined) {
        scoped = new WeakMap();
        storesMap.set(rootVNode, scoped);
    }
    if (scoped.has(scope)) {
        if (true) {
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
let useStore = (scope) => {
    let store;
    let rootVNode = core_pkg.resolveRootVNode();
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
let useStoreRead = (scope, readFn, compareFn) => {
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
let useStoreWrite = (scope, writeFn) => {
    let store = useStore(scope);
    return useGlobalStoreWrite(store, writeFn);
};

exports.createStore = createStore;
exports.useGlobalStoreRead = useGlobalStoreRead;
exports.useGlobalStoreWrite = useGlobalStoreWrite;
exports.useStoreInit = useStoreInit;
exports.useStoreRead = useStoreRead;
exports.useStoreWrite = useStoreWrite;
