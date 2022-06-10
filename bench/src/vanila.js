export function render(app, root, {onFinish}) {
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
    root.appendChild(app);
    onFinish();
}
