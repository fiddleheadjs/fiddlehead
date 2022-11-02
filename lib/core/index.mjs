import {
    Fragment as Fragment_prod,
    Text as Text_prod,
    render as render_prod,
    createElement as createElement_prod,
    jsx as jsx_prod,
    createPortal as createPortal_prod,
    createRef as createRef_prod,
    useState as useState_prod,
    useCatch as useCatch_prod,
    useEffect as useEffect_prod,
    useLayoutEffect as useLayoutEffect_prod,
    useRef as useRef_prod,
    useCallback as useCallback_prod,
    useMemo as useMemo_prod,
    useTreeId as useTreeId_prod,
} from './esm.production.js';

import {
    Fragment as Fragment_dev,
    Text as Text_dev,
    render as render_dev,
    createElement as createElement_dev,
    jsx as jsx_dev,
    createPortal as createPortal_dev,
    createRef as createRef_dev,
    useState as useState_dev,
    useCatch as useCatch_dev,
    useEffect as useEffect_dev,
    useLayoutEffect as useLayoutEffect_dev,
    useRef as useRef_dev,
    useCallback as useCallback_dev,
    useMemo as useMemo_dev,
    useTreeId as useTreeId_dev,
} from './esm.development.js';

let isProd = process.env.NODE_ENV === 'production';

export let Fragment = isProd
    ? Fragment_prod
    : Fragment_dev;

export let Text = isProd
    ? Text_prod
    : Text_dev;

export let render = isProd
    ? render_prod
    : render_dev;

export let createElement = isProd
    ? createElement_prod
    : createElement_dev;

export let jsx = isProd
    ? jsx_prod
    : jsx_dev;

export let createPortal = isProd
    ? createPortal_prod
    : createPortal_dev;

export let createRef = isProd
    ? createRef_prod
    : createRef_dev;

export let useState = isProd
    ? useState_prod
    : useState_dev;

export let useCatch = isProd
    ? useCatch_prod
    : useCatch_dev;

export let useEffect = isProd
    ? useEffect_prod
    : useEffect_dev;

export let useLayoutEffect = isProd
    ? useLayoutEffect_prod
    : useLayoutEffect_dev;

export let useRef = isProd
    ? useRef_prod
    : useRef_dev;

export let useCallback = isProd
    ? useCallback_prod
    : useCallback_dev;

export let useMemo = isProd
    ? useMemo_prod
    : useMemo_dev;

export let useTreeId = isProd
    ? useTreeId_prod
    : useTreeId_dev;
