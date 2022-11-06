import {waitFor} from '@testing-library/dom';
import {render} from 'core.pkg';
import {createRoot} from 'react-dom/client';

export function renderView(component) {
    const container = document.createElement('test-container');
    document.body.appendChild(container);
    render(component, container);

    return {container};
}

export async function React_renderViewAsync(component) {
    const container = document.createElement('test-container');
    document.body.appendChild(container);
    createRoot(container).render(component);

    await waitFor(() => {
        expect(container.firstChild).not.toBe(null);
    });

    return {container};
}

export function cleanupView() {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
}

export async function sleep(timeout = 50) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}

export function walkTree(root, performUnit, onGoDown, onReturn) {
    let current = root;
    while (true) {
        performUnit(current, root);
        if (current.child_ !== null) {
            current = current.child_;
            if (onGoDown != null) {
                onGoDown(current);
            }
            continue;
        }
        if (current === root) {
            return;
        }
        while (current.sibling_ === null) {
            if (current.parent_ === null || current.parent_ === root) {
                return;
            }
            current = current.parent_;
            if (onReturn != null) {
                onReturn(current);
            }
        }
        current = current.sibling_;
    }
}
