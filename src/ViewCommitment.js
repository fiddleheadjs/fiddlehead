import {hasOwnProperty} from './Util';
import {linkViewNode, NODE_TEXT} from './VirtualNode';
import {updateViewElementAttributes} from './ViewManipulation';

export function commitView(oldVirtualNodeMap, newVirtualNodeMap) {
    _removeOldViewNodes(oldVirtualNodeMap, newVirtualNodeMap);
    _updateExistingViewNodes(oldVirtualNodeMap, newVirtualNodeMap);
    _insertNewViewNodes(oldVirtualNodeMap, newVirtualNodeMap);
}

function _removeOldViewNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    // If the current node is under the last removed node
    // So dont need to remove current node anymore
    // Use lastRemovedKey to track
    let lastRemovedKey = '';
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key) && !hasOwnProperty(newVirtualNodeMap, key)) {
            if (!key.startsWith(lastRemovedKey + '/')) {
                const oldVirtualNode = oldVirtualNodeMap[key];
                if (oldVirtualNode.viewNode !== null) {
                    _removeViewNodesOfVirtualNode(oldVirtualNode);
                    lastRemovedKey = key;
                }
            }
        }
    }
}

function _updateExistingViewNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    const mergedKeys = Object.keys({
        ...oldVirtualNodeMap,
        ...newVirtualNodeMap,
    });

    for (let i = 0; i < mergedKeys.length; i++) {
        const key = mergedKeys[i];

        if (hasOwnProperty(oldVirtualNodeMap, key) && hasOwnProperty(newVirtualNodeMap, key)) {
            const newVirtualNode = newVirtualNodeMap[key];
            if (newVirtualNode.viewNode !== null) {
                const oldVirtualNode = oldVirtualNodeMap[key];

                // Reuse the existing view node
                linkViewNode(newVirtualNode, oldVirtualNode.viewNode);

                if (newVirtualNode.type === NODE_TEXT) {
                    if (newVirtualNode.text !== oldVirtualNode.text) {
                        newVirtualNode.viewNode.textContent = newVirtualNode.text;
                    }
                } else {
                    updateViewElementAttributes(
                        newVirtualNode.viewNode,
                        newVirtualNode.props,
                        oldVirtualNode.props
                    );
                }
            }
        }
    }
}

function _insertNewViewNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    let pendingVirtualNodes = [];

    for (let key in newVirtualNodeMap) {
        if (hasOwnProperty(newVirtualNodeMap, key)) {
            if (!hasOwnProperty(oldVirtualNodeMap, key)) {
                const newVirtualNode = newVirtualNodeMap[key];
                if (newVirtualNode.viewNode !== null) {
                    pendingVirtualNodes.push(newVirtualNode);
                }
            } else {
                _insertClosestViewNodesOfVirtualNodes(pendingVirtualNodes, oldVirtualNodeMap[key]);
                pendingVirtualNodes.length = 0;
            }
        }
    }

    if (pendingVirtualNodes.length > 0) {
        _insertClosestViewNodesOfVirtualNodes(pendingVirtualNodes, null);
    }
}

function _insertClosestViewNodesOfVirtualNodes(virtualNodes, virtualNodeAfter) {
    const viewNodeAfter = virtualNodeAfter && _findClosestViewNodes(virtualNodeAfter)[0] || null;
    
    for (let i = 0; i < virtualNodes.length; i++) {
        const virtualNode = virtualNodes[i];
        
        if (virtualNode.viewNode !== null) {
            const viewHost = _findViewHost(virtualNode);

            if (viewHost !== null) {
                if (viewNodeAfter !== null && viewHost === viewNodeAfter.parentNode) {
                    viewHost.insertBefore(virtualNode.viewNode, viewNodeAfter);
                } else {
                    viewHost.appendChild(virtualNode.viewNode);
                }
            }
        }
    }
}

function _removeViewNodesOfVirtualNode(virtualNode) {
    const viewNodes = _findClosestViewNodes(virtualNode);

    for (let i = 0; i < viewNodes.length; i++) {
        const viewNode = viewNodes[i];

        if (viewNode.parentNode !== null) {
            viewNode.parentNode.removeChild(viewNode);
        }
    }
}

function _findViewHost(virtualNode) {
    if (virtualNode.parent === null) {
        console.log(virtualNode);
        return null;
    }

    if (virtualNode.parent.viewNode === null) {
        return _findViewHost(virtualNode.parent);
    }

    return virtualNode.parent.viewNode;
}

function _findClosestViewNodes(virtualNode) {
    if (virtualNode.viewNode !== null) {
        return [virtualNode.viewNode];
    } else {
        return virtualNode.children.reduce((arr, childVirtualNode) => {
            return arr.concat(_findClosestViewNodes(childVirtualNode));
        }, []);
    }
}
