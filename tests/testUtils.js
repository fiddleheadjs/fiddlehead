import {waitFor} from '@testing-library/dom';
import {render} from 'core.pkg';
import {createRoot} from 'react-dom/client';

export function renderView(component) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    render(component, container);

    return {container};
}

export async function React_renderViewAsync(component) {
    const container = document.createElement('div');
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
