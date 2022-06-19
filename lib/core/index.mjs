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
} from './esm.production.js';

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
} from './esm.development.js';

const isProd = process.env.NODE_ENV === 'production';

export const Fragment = isProd ? Fragment_prod : Fragment_dev;
export const TextNode = isProd ? TextNode_prod : TextNode_dev;
export const render = isProd ? render_prod : render_dev;
export const createElement = isProd ? createElement_prod : createElement_dev;
export const jsx = isProd ? jsx_prod : jsx_dev;
export const createPortal = isProd ? createPortal_prod : createPortal_dev;
export const createRef = isProd ? createRef_prod : createRef_dev;
export const useState = isProd ? useState_prod : useState_dev;
export const useError = isProd ? useError_prod : useError_dev;
export const useEffect = isProd ? useEffect_prod : useEffect_dev;
export const useLayoutEffect = isProd ? useLayoutEffect_prod : useLayoutEffect_dev;
export const useRef = isProd ? useRef_prod : useRef_dev;
