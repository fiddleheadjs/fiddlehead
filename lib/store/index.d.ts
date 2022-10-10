type Data = Record<any, any>;

type Subscriber = (data: Data) => void;

export interface Store {
    readonly data: Data,
    setData: (setFn: (data: Data) => void) => void,
    subscribe: (subscriber: Subscriber) => void,
    unsubscribe: (subscriber: Subscriber) => void,
};

export function createStore(initialData: Data): Store;

export function useGlobalStoreRead<T>(
    store: Store,
    readFn: (data: Data) => T,
    compareFn?: (value1: T, value2: T) => boolean
): T;

export function useGlobalStoreWrite<T>(
    store: Store,
    writeFn: (data: Data, value: T) => void
): (value: T) => void;

export function useStoreInit(
    scope: object,
    initialData: Data
): void;

export function useStoreRead<T>(
    scope: object,
    readFn: (data: Data) => T,
    compareFn?: (value1: T, value2: T) => boolean
): T;

export function useStoreWrite<T>(
    scope: object,
    writeFn: (data: Data, value: T) => void
): (value: T) => void;
