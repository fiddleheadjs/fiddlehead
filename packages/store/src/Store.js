import {useEffect, useState, useCallback} from 'core.pkg';

/**
 * 
 * @param {object} data 
 * @returns {Store}
 */
export let createStore = (data) => {
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
export let useGlobalStoreRead = (store, readFn, compareFn) => {
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

        // readFn and compareFn must be pure functions
        // we only accept ones was passed from the first call
    }, [store]);

    return datum[0];
};

/**
 * 
 * @param {Store} store
 * @param {function} writeFn
 * @returns {function}
 */
export let useGlobalStoreWrite = (store, writeFn) => {
    return useCallback((value) => {
        store.setData((data) => {
            writeFn(data, value);
        });

        // writeFn must be a pure function
        // we only accept one was passed from the first call
    }, [store]);
};
