import {useEffect, useState} from '../../../output';

export function createStore(initialData) {
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

export function useReadableStore(store, getFn) {
    const [value, setValue] = useState(getFn(store.data));

    useEffect(() => {
        const subscriber = (data) => {
            setValue(getFn(data));
        };
        store.subscribe(subscriber);
        return () => store.unsubscribe(subscriber);
    }, [store, getFn]);

    return value;
}

export function useWritableStore(store, setFn) {
    return (value) => {
        store.setData(data => {
            setFn(data, value);
        });
    };
}
