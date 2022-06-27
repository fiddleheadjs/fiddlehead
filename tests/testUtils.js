import {render} from 'core.pkg';

export function  renderView(component) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    render(component, container);

    return {
        container,
    };
}

export function cleanupView() {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
}
