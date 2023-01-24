import {
    createStore as createStore_prod,
    useGlobalStoreRead as useGlobalStoreRead_prod,
    useGlobalStoreWrite as useGlobalStoreWrite_prod,
    useStoreInit as useStoreInit_prod,
    useStoreRead as useStoreRead_prod,
    useStoreWrite as useStoreWrite_prod,
} from './esm.production.min.js';

import {
    createStore as createStore_dev,
    useGlobalStoreRead as useGlobalStoreRead_dev,
    useGlobalStoreWrite as useGlobalStoreWrite_dev,
    useStoreInit as useStoreInit_dev,
    useStoreRead as useStoreRead_dev,
    useStoreWrite as useStoreWrite_dev,
} from './esm.development.js';

let isProd = process.env.NODE_ENV === 'production';

export let createStore = isProd 
    ? createStore_prod 
    : createStore_dev;

export let useGlobalStoreRead = isProd 
    ? useGlobalStoreRead_prod 
    : useGlobalStoreRead_dev;

export let useGlobalStoreWrite = isProd 
    ? useGlobalStoreWrite_prod 
    : useGlobalStoreWrite_dev;

export let useStoreInit = isProd 
    ? useStoreInit_prod 
    : useStoreInit_dev;

export let useStoreRead = isProd 
    ? useStoreRead_prod 
    : useStoreRead_dev;

export let useStoreWrite = isProd 
    ? useStoreWrite_prod 
    : useStoreWrite_dev;
