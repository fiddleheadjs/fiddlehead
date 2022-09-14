interface JSXElement {
}

interface PortalElement {
}

interface VNode {
}

export interface Ref<T> {
    current: T
}

export const Fragment: string;

export const TextNode: string;

export function render(children: any, target: Element): void;

export function createPortal(children: any, target: Element): PortalElement;

export function createElement(
    type: string | ((props: Record<string, any>) => any),
    props: Record<string, any>,
    ...children: any[]
): JSXElement;

export {createElement as jsx};

export function createRef<T>(initialValue: T): Ref<T>;

export function useState<T>(initialValue: T): [
    value: T,
    setValue: (value: T | ((prevValue: T) => T)) => void
];

export function useError(): [
    error: Error | null,
    clearError: () => void
];

export function useEffect(
    callback: () => (() => void) | void,
    deps?: any[]
): void;

export function useLayoutEffect(
    callback: () => (() => void) | void,
    deps?: any[]
): void;

export function useRef<T>(initialValue: T): Ref<T>;

export function resolveRootVNode(): VNode;
