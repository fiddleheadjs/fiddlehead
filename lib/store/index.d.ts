type Subscriber = (data: object) => void;

export interface Store {
    readonly data: object,
    setData: (setFn: (data: object) => void) => void,
    subscribe: (subscriber: Subscriber) => void,
    unsubscribe: (subscriber: Subscriber) => void,
}

export function createStore(initialData: object): Store;

export function useGlobalReadableStore<T>(
    store: Store,
    readFn: (data: object) => T,
    compareFn?: (value1: T, value2: T) => boolean
): T;

export function useGlobalWritableStore<T>(
    store: Store,
    writeFn: (data: object, value: T) => void
): (value: T) => void;

export function applyStore(initialData: object): void;

export function useReadableStore<T>(
    readFn: (data: object) => T,
    compareFn?: (value1: T, value2: T) => boolean
): T;

export function useWritableStore<T>(
    writeFn: (data: object, value: T) => void
): (value: T) => void;
