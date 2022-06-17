interface VirtualNode {

}

export interface Ref {
    current: any
}

export const Fragment: string;

export const TextNode: string;

export function render(children: any, target: Element): void;

export function createElement(
    type: string | ((props: Record<string, any>) => VirtualNode),
    props: Record<string, any>,
    ...children: any[]
): VirtualNode;

export {createElement as jsx};

export function createPortal(children: any, target: Element): VirtualNode;

export function createRef(initialValue: any): Ref;

export function useState<T>(initialValue: T): [
    value: T,
    setValue: (value: T | ((prevValue: T) => T)) => void
];

export function useError(): [error: Error | null, clearError: () => void];

export function useEffect(callback: () => (() => void) | void): void;

export function useLayoutEffect(callback: () => (() => void) | void): void;

export function useRef(initialValue: any): Ref;
