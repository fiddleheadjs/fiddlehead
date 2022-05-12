import {hasOwnProperty} from './Util';
import {linkNativeNode, NODE_TEXT} from './VirtualNode';
import {updateNativeElementAttributes, updateNativeTextNode} from './NativeDOM';

export function commitView(oldVirtualNodeMap, newVirtualNodeMap) {
    _removeOldNativeNodes(oldVirtualNodeMap, newVirtualNodeMap);
    _updateExistingNativeNodes(oldVirtualNodeMap, newVirtualNodeMap);
    _insertNewNativeNodes(oldVirtualNodeMap, newVirtualNodeMap);
}

function _removeOldNativeNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    // If the current node is under the last removed node
    // So dont need to remove current node anymore
    // Use lastRemovedKey to track
    let lastRemovedKey = '';
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key) && !hasOwnProperty(newVirtualNodeMap, key)) {
            if (!key.startsWith(lastRemovedKey + '/')) {
                const oldVirtualNode = oldVirtualNodeMap[key];
                if (oldVirtualNode.nativeNode !== null) {
                    _removeNativeNodesOfVirtualNode(oldVirtualNode);
                    lastRemovedKey = key;
                }
            }
        }
    }
}

function _updateExistingNativeNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    const mergedKeys = Object.keys({
        ...oldVirtualNodeMap,
        ...newVirtualNodeMap,
    });

    for (let i = 0; i < mergedKeys.length; i++) {
        const key = mergedKeys[i];

        if (hasOwnProperty(oldVirtualNodeMap, key) && hasOwnProperty(newVirtualNodeMap, key)) {
            const newVirtualNode = newVirtualNodeMap[key];
            if (newVirtualNode.nativeNode !== null) {
                const oldVirtualNode = oldVirtualNodeMap[key];

                // Reuse the existing native node
                linkNativeNode(newVirtualNode, oldVirtualNode.nativeNode);

                if (newVirtualNode.type === NODE_TEXT) {
                    if (newVirtualNode.data !== oldVirtualNode.data) {
                        updateNativeTextNode(
                            newVirtualNode.nativeNode,
                            newVirtualNode.data
                        );
                    }
                } else {
                    updateNativeElementAttributes(
                        newVirtualNode.nativeNode,
                        newVirtualNode.props,
                        oldVirtualNode.props
                    );
                }
            }
        }
    }
}

function _insertNewNativeNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    let pendingVirtualNodes = [];

    for (let key in newVirtualNodeMap) {
        if (hasOwnProperty(newVirtualNodeMap, key)) {
            if (!hasOwnProperty(oldVirtualNodeMap, key)) {
                const newVirtualNode = newVirtualNodeMap[key];
                if (newVirtualNode.nativeNode !== null) {
                    pendingVirtualNodes.push(newVirtualNode);
                }
            } else {
                _insertClosestNativeNodesOfVirtualNodes(pendingVirtualNodes, oldVirtualNodeMap[key]);
                pendingVirtualNodes.length = 0;
            }
        }
    }

    if (pendingVirtualNodes.length > 0) {
        _insertClosestNativeNodesOfVirtualNodes(pendingVirtualNodes, null);
    }
}

function _insertClosestNativeNodesOfVirtualNodes(virtualNodes, virtualNodeAfter) {
    const nativeNodeAfter = virtualNodeAfter && _findClosestNativeNodes(virtualNodeAfter)[0] || null;
    
    for (let i = 0; i < virtualNodes.length; i++) {
        const virtualNode = virtualNodes[i];
        
        if (virtualNode.nativeNode !== null) {
            const nativeHost = _findNativeHost(virtualNode);

            if (nativeHost !== null) {
                if (nativeNodeAfter !== null && nativeHost === nativeNodeAfter.parentNode) {
                    nativeHost.insertBefore(virtualNode.nativeNode, nativeNodeAfter);
                } else {
                    nativeHost.appendChild(virtualNode.nativeNode);
                }
            }
        }
    }
}

function _removeNativeNodesOfVirtualNode(virtualNode) {
    const nativeNodes = _findClosestNativeNodes(virtualNode);

    for (let i = 0; i < nativeNodes.length; i++) {
        const nativeNode = nativeNodes[i];

        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    }
}

function _findNativeHost(virtualNode) {
    if (virtualNode.parent === null) {
        return null;
    }

    if (virtualNode.parent.nativeNode === null) {
        return _findNativeHost(virtualNode.parent);
    }

    return virtualNode.parent.nativeNode;
}

function _findClosestNativeNodes(virtualNode) {
    if (virtualNode.nativeNode !== null) {
        return [virtualNode.nativeNode];
    } else {
        return virtualNode.children.reduce((arr, childVirtualNode) => {
            return arr.concat(_findClosestNativeNodes(childVirtualNode));
        }, []);
    }
}
