import { useState, useLayoutEffect, useCallback, useTreeId } from 'fiddlehead';

/**
 * 
 * @param {object} data 
 * @returns {Store}
 */
let createStore = (data) => {
    if (data !== Object(data)) {
        throw new TypeError('The store data must be a reference type.');
    }

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
    let datum = useState(readFn(store.data));

    useLayoutEffect(() => {
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

        // readFn and compareFn must be pure functions
        // we only accept ones have been passed from the first call
    }, [store]);

    return datum[0];
};

/**
 * 
 * @param {Store} store
 * @param {function} writeFn
 * @returns {function}
 */
let useGlobalStoreWrite = (store, writeFn) => {
    return useCallback((value) => {
        store.setData((data) => {
            writeFn(value, data);
        });

        // writeFn must be a pure function
        // we only accept one was passed from the first call
    }, [store]);
};

/**
 * @type {WeakMap<object, WeakMap<object, Store>}
 */
let storesMap = new WeakMap();

/**
 * 
 * @param {object} scope
 * @param {object} data 
 */
let useStoreInit = (scope, data) => {
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
        if (true) {
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
let useStore = (scope) => {
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

export { createStore, useGlobalStoreRead, useGlobalStoreWrite, useStoreInit, useStoreRead, useStoreWrite };
