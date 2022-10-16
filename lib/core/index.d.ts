type Props = Record<string, any>;

interface JSXElement {
};

interface PortalElement {
};

export interface Ref<T> {
    current: T
};

export const Fragment: string;

export const TextNode: string;

export function render(children: any, target: Element): void;

export function createPortal(children: any, target: Element): PortalElement;

export function createElement(
    type: string | ((props: Props) => any),
    props: Props,
    ...children: any[]
): JSXElement;

export {createElement as jsx};

export function createRef<T>(initialValue: T): Ref<T>;

export function useState<T>(initialValue: T): [
    value: T,
    setValue: (value: T | ((prevValue: T) => T)) => void
];

export function useCatch(): [
    error: any | null,
    clearError: () => void
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

export function useCallback(
    callback: Function,
    deps?: any[]
): void;

export function useMemo(
    create: Function,
    deps?: any[]
): void;

export function useTreeId(): object;
