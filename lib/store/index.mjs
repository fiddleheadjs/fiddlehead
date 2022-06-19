import * as prod from './esm.production';
import * as dev from './esm.development';

export const {
    createStore,
    useReadableStore,
    useWritableStore,
} = process.env.NODE_ENV === 'production' ? prod : dev;
