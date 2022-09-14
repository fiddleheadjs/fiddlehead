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
    resolveRootVNode as resolveRootVNode_prod,
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
    resolveRootVNode as resolveRootVNode_dev,
} from './esm.development.js';

let isProd = process.env.NODE_ENV === 'production';

export let Fragment = isProd ? Fragment_prod : Fragment_dev;
export let TextNode = isProd ? TextNode_prod : TextNode_dev;
export let render = isProd ? render_prod : render_dev;
export let createElement = isProd ? createElement_prod : createElement_dev;
export let jsx = isProd ? jsx_prod : jsx_dev;
export let createPortal = isProd ? createPortal_prod : createPortal_dev;
export let createRef = isProd ? createRef_prod : createRef_dev;
export let useState = isProd ? useState_prod : useState_dev;
export let useError = isProd ? useError_prod : useError_dev;
export let useEffect = isProd ? useEffect_prod : useEffect_dev;
export let useLayoutEffect = isProd ? useLayoutEffect_prod : useLayoutEffect_dev;
export let useRef = isProd ? useRef_prod : useRef_dev;
export let resolveRootVNode = isProd ? resolveRootVNode_prod : resolveRootVNode_dev;
