'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core_pkg = require('hook');

/**
 * 
 * @param {{}} initialData 
 * @returns {Store}
 */
function createStore(initialData) {
    if (initialData === null || typeof initialData !== 'object') {
        throw new Error('Store data must be an object');
    }
    
    const data = initialData;
    const subscribers = new Set();

    return {
        get data() {
            return data;
        },
        setData(setFn) {
            setFn(data);
            subscribers.forEach(function (subscriber) {
                subscriber(data);
            });
        },
        subscribe: subscribers.add.bind(subscribers),
        unsubscribe: subscribers.delete.bind(subscribers),
    };
}

/**
 * 
 * @param {Store} store
 * @param {function} readFn
 * @param {function?} compareFn
 * @returns {any}
 */
function useReadableStore(store, readFn, compareFn) {
    const [value, setValue] = core_pkg.useState(readFn(store.data));

    core_pkg.useEffect(function () {
        const subscriber = function (data) {
            if (compareFn === undefined) {
                setValue(readFn(data));
            } else {
                setValue(function (prevValue) {
                    const newValue = readFn(data);
                    if (compareFn(prevValue, newValue)) {
                        return prevValue;
                    } else {
                        return newValue;
                    }
                });
            }
        };
        store.subscribe(subscriber);
        return function () {
            store.unsubscribe(subscriber);
        };
    }, [store, readFn, compareFn]);

    return value;
}

/**
 * 
 * @param {Store} store
 * @param {function} writeFn
 * @returns {function}
 */
function useWritableStore(store, writeFn) {
    return function (value) {
        store.setData(function (data) {
            writeFn(data, value);
        });
    };
}

exports.createStore = createStore;
exports.useReadableStore = useReadableStore;
exports.useWritableStore = useWritableStore;
