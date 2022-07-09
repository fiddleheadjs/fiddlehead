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
let useReadableStore = (store, readFn, compareFn) => {
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
let useWritableStore = (store, writeFn) => {
    return (value) => {
        store.setData((data) => {
            writeFn(data, value);
        });
    };
};

exports.createStore = createStore;
exports.useReadableStore = useReadableStore;
exports.useWritableStore = useWritableStore;
