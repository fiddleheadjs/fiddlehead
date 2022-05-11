let componentTempPathDec = 0;
export function generateTemporaryPath() {
    return [--componentTempPathDec];
}

export function stringifyPath(path) {
    return path.join('/');
}

export function escapeKey(key) {
    return '@' + encodeURIComponent(key);
}
