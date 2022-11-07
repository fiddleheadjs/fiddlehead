type Props = Record<string, any>;

interface JSXElement {
}

interface PortalElement {
}

export interface Ref<T> {
    current: T
}

export const Fragment: string;

export const Text: string;

export function render(
    children: any,
    target: Element
): void;

export function createPortal(
    children: any,
    target: Element
): PortalElement;

export function createElement(
    type: string | ((props: Props) => any),
    props: Props,
    ...children: any[]
): JSXElement;

export {createElement as jsx};

export function createRef<T>(initialValue: T): Ref<T>;

export function useState<T>(initialValue: T): [
    T,
    (value: T | ((prevValue: T) => T)) => void
];

export function useCatch(): [
    any | null,
    () => void
];

export function useEffect(
    mount: () => (() => void) | void,
    deps?: any[]
): void;

export function useLayoutEffect(
    mount: () => (() => void) | void,
    deps?: any[]
): void;

export function useRef<T>(initialValue: T): Ref<T>;

export function useCallback<T>(
    callback: T,
    deps?: any[]
): T;

export function useMemo<T>(
    create: () => T,
    deps?: any[]
): T;

export function useTreeId(): object;
