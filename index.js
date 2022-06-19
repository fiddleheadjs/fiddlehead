// module.exports = require('./lib/core');

import {
    Fragment as Fragment_dev,
    TextNode as TextNode_dev,
    render as render_dev,
    createElement as createElement_dev,
    jsx as jsx_dev,
    createPortal as createPortal_dev,
    createRef as createRef_dev,
    useState as useState_dev,
    useError as useError_dev,
    useEffect as useEffect_dev,
    useLayoutEffect as useLayoutEffect_dev,
    useRef as useRef_dev,
} from './lib/core/esm.development';


import {
    Fragment as Fragment_prod,
    TextNode as TextNode_prod,
    render as render_prod,
    createElement as createElement_prod,
    jsx as jsx_prod,
    createPortal as createPortal_prod,
    createRef as createRef_prod,
    useState as useState_prod,
    useError as useError_prod,
    useEffect as useEffect_prod,
    useLayoutEffect as useLayoutEffect_prod,
    useRef as useRef_prod,
} from './lib/core/esm.development';

const prod = process.env.NODE_ENV === 'production';

export const Fragment = prod ? Fragment_prod : Fragment_dev;
export const TextNode = prod ? TextNode_prod : TextNode_dev;
export const render = prod ? render_prod : render_dev;
export const createElement = prod ? createElement_prod : createElement_dev;
export const jsx = prod ? jsx_prod : jsx_dev;
export const createPortal = prod ? createPortal_prod : createPortal_dev;
export const createRef = prod ? createRef_prod : createRef_dev;
export const useState = prod ? useState_prod : useState_dev;
export const useError = prod ? useError_prod : useError_dev;
export const useEffect = prod ? useEffect_prod : useEffect_dev;
export const useLayoutEffect = prod ? useLayoutEffect_prod : useLayoutEffect_dev;
export const useRef = prod ? useRef_prod : useRef_dev;
