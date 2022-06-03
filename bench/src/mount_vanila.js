export function mount(app, root, {onFinish}) {
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
    root.appendChild(app);
    onFinish();
}
