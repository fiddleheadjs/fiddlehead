import {
    createStore as createStore_prod,
    useReadableStore as useReadableStore_prod,
    useWritableStore as useWritableStore_prod,
} from './esm.production.js';

import {
    createStore as createStore_dev,
    useReadableStore as useReadableStore_dev,
    useWritableStore as useWritableStore_dev,
} from './esm.development.js';

const isProd = process.env.NODE_ENV === 'production';

export const createStore = isProd ? createStore_prod : createStore_dev;
export const useReadableStore = isProd ? useReadableStore_prod : useReadableStore_dev;
export const useWritableStore = isProd ? useWritableStore_prod : useWritableStore_dev;
