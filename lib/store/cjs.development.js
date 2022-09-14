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
        initialData != null && // is not nullish
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
let useGlobalReadableStore = (store, readFn, compareFn) => {
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
let useGlobalWritableStore = (store, writeFn) => {
    return (value) => {
        store.setData((data) => {
            writeFn(data, value);
        });
    };
};

/**
 * @type {WeakMap<Store>}
 */
let storeMap = new WeakMap();

/**
 * 
 * @param {{}} initialData 
 */
let applyStore = (initialData) => {
    let rootVNode = core_pkg.resolveRootVNode();
    if (storeMap.has(rootVNode)) {
        if (true) {
            console.error('Store already has been applied');
        }
    } else {
        storeMap.set(rootVNode, createStore(initialData));
    }
};

/**
 * 
 * @returns {Store}
 * @throws
 */
let useStore = () => {
    let rootVNode = core_pkg.resolveRootVNode();
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
let useReadableStore = (readFn, compareFn) => {
    let store = useStore();
    return useGlobalReadableStore(store, readFn, compareFn);
};

/**
 * 
 * @param {function} writeFn
 * @returns {function}
 * @throws
 */
let useWritableStore = (writeFn) => {
    let store = useStore();
    return useGlobalWritableStore(store, writeFn);
};

exports.applyStore = applyStore;
exports.createStore = createStore;
exports.useGlobalReadableStore = useGlobalReadableStore;
exports.useGlobalWritableStore = useGlobalWritableStore;
exports.useReadableStore = useReadableStore;
exports.useWritableStore = useWritableStore;
