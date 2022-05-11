/**
 *
 * @param {VirtualNode|null} parent
 * @param {[]} routeFromParent
 * @param {VirtualNode} current
 * @return {AppendInfo}
 * @constructor
 */
export function AppendInfo(parent, routeFromParent, current) {
    this.parent = parent;
    this.routeFromParent = routeFromParent;
    this.current = current;
}

const appendInfoCollection = [];

export function addAppendInfo(appendInfo) {
    appendInfoCollection.push(appendInfo);
}

export function cloneAppendInfoCollection() {
    return [...appendInfoCollection];
}

export function clearAppendInfoCollection() {
    appendInfoCollection.length = 0;
}
