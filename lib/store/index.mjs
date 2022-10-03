import {
    createStore as createStore_prod,
    useGlobalStoreRead as useGlobalStoreRead_prod,
    useGlobalStoreWrite as useGlobalStoreWrite_prod,
    useStoreInit as useStoreInit_prod,
    useStoreRead as useStoreRead_prod,
    useStoreWrite as useStoreWrite_prod,
} from './esm.production.js';

import {
    createStore as createStore_dev,
    useGlobalStoreRead as useGlobalStoreRead_dev,
    useGlobalStoreWrite as useGlobalStoreWrite_dev,
    useStoreInit as useStoreInit_dev,
    useStoreRead as useStoreRead_dev,
    useStoreWrite as useStoreWrite_dev,
} from './esm.development.js';

const isProd = process.env.NODE_ENV === 'production';

export const createStore = isProd ? createStore_prod : createStore_dev;
export const useGlobalStoreRead = isProd ? useGlobalStoreRead_prod : useGlobalStoreRead_dev;
export const useGlobalStoreWrite = isProd ? useGlobalStoreWrite_prod : useGlobalStoreWrite_dev;
export const useStoreInit = isProd ? useStoreInit_prod : useStoreInit_dev;
export const useStoreRead = isProd ? useStoreRead_prod : useStoreRead_dev;
export const useStoreWrite = isProd ? useStoreWrite_prod : useStoreWrite_dev;
