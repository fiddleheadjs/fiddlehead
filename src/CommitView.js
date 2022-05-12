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
                if (oldVirtualNode.nativeNode_ !== null) {
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
            if (newVirtualNode.nativeNode_ !== null) {
                const oldVirtualNode = oldVirtualNodeMap[key];

                // Reuse the existing native node
                linkNativeNode(newVirtualNode, oldVirtualNode.nativeNode_);

                if (newVirtualNode.type_ === NODE_TEXT) {
                    if (newVirtualNode.data_ !== oldVirtualNode.data_) {
                        updateNativeTextNode(
                            newVirtualNode.nativeNode_,
                            newVirtualNode.data_
                        );
                    }
                } else {
                    updateNativeElementAttributes(
                        newVirtualNode.nativeNode_,
                        newVirtualNode.props_,
                        oldVirtualNode.props_
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
                if (newVirtualNode.nativeNode_ !== null) {
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
        
        if (virtualNode.nativeNode_ !== null) {
            const nativeHost = _findNativeHost(virtualNode);

            if (nativeHost !== null) {
                if (nativeNodeAfter !== null && nativeHost === nativeNodeAfter.parentNode) {
                    nativeHost.insertBefore(virtualNode.nativeNode_, nativeNodeAfter);
                } else {
                    nativeHost.appendChild(virtualNode.nativeNode_);
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
    if (virtualNode.parent_ === null) {
        return null;
    }

    if (virtualNode.parent_.nativeNode_ === null) {
        return _findNativeHost(virtualNode.parent_);
    }

    return virtualNode.parent_.nativeNode_;
}

function _findClosestNativeNodes(virtualNode) {
    if (virtualNode.nativeNode_ !== null) {
        return [virtualNode.nativeNode_];
    }
    
    {
        const output = [];
        for (let i = 0; i < virtualNode.children_.length; i++) {
            const childVirtualNode = virtualNode.children_[i];
            output.push(..._findClosestNativeNodes(childVirtualNode));
        }
        return output;
    }
}
