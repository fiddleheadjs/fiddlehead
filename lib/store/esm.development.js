import { useState, useEffect, useTreeId } from 'fiddlehead';

/**
 * 
 * @param {{}} data 
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

    useEffect(() => {
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
 * @type {WeakMap<object, WeakMap<object, Store>}
 */
let storesMap = new WeakMap();

/**
 * 
 * @param {object} scope
 * @param {{}} initialData 
 */
let useStoreInit = (scope, initialData) => {
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
