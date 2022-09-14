import {
    createStore as createStore_prod,
    useGlobalReadableStore as useGlobalReadableStore_prod,
    useGlobalWritableStore as useGlobalWritableStore_prod,
    applyStore as applyStore_prod,
    useReadableStore as useReadableStore_prod,
    useWritableStore as useWritableStore_prod,
} from './esm.production.js';

import {
    createStore as createStore_dev,
    useGlobalReadableStore as useGlobalReadableStore_dev,
    useGlobalWritableStore as useGlobalWritableStore_dev,
    applyStore as applyStore_dev,
    useReadableStore as useReadableStore_dev,
    useWritableStore as useWritableStore_dev,
} from './esm.development.js';

const isProd = process.env.NODE_ENV === 'production';

export const createStore = isProd ? createStore_prod : createStore_dev;
export const useGlobalReadableStore = isProd ? useGlobalReadableStore_prod : useGlobalReadableStore_dev;
export const useGlobalWritableStore = isProd ? useGlobalWritableStore_prod : useGlobalWritableStore_dev;
export const applyStore = isProd ? applyStore_prod : applyStore_dev;
export const useReadableStore = isProd ? useReadableStore_prod : useReadableStore_dev;
export const useWritableStore = isProd ? useWritableStore_prod : useWritableStore_dev;
