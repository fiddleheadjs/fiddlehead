import {linkNativeNode, NODE_TEXT} from './VirtualNode';
import {updateNativeElementAttributes, updateNativeTextNode} from './NativeDOM';

export function commitView(oldViewableVirtualNodeMap, newViewableVirtualNodeMap) {
    // for key in oldMap
    //     if newMap.has(key)
    //         updateNativeNodes
    //     else
    //         removeNativeNodes
    //
    // for key in newMap
    //     if !oldMap.has(key)
    //         insertNativeNodes
    //

    _removeAndUpdate(oldViewableVirtualNodeMap, newViewableVirtualNodeMap);
    _insert(oldViewableVirtualNodeMap, newViewableVirtualNodeMap);
}

function _removeAndUpdate(oldViewableVirtualNodeMap, newViewableVirtualNodeMap) {
    // If the current node is under the last removed node
    // So dont need to remove current node anymore
    // Use lastRemovedKey to track
    let lastRemovedKey = '';

    oldViewableVirtualNodeMap.forEach((oldViewableVirtualNode, key) => {
        if (newViewableVirtualNodeMap.has(key)) {
            const newViewableVirtualNode = newViewableVirtualNodeMap.get(key);

            // Reuse the existing native node
            linkNativeNode(newViewableVirtualNode, oldViewableVirtualNode.nativeNode_);

            if (newViewableVirtualNode.type_ === NODE_TEXT) {
                if (newViewableVirtualNode.data_ !== oldViewableVirtualNode.data_) {
                    updateNativeTextNode(
                        newViewableVirtualNode.nativeNode_,
                        newViewableVirtualNode.data_
                    );
                }
            } else {
                updateNativeElementAttributes(
                    newViewableVirtualNode.nativeNode_,
                    newViewableVirtualNode.props_,
                    oldViewableVirtualNode.props_
                );
            }
        } else {
            if (!key.startsWith(lastRemovedKey + '/')) {
                _removeNativeNodesOfVirtualNode(oldViewableVirtualNode);
                lastRemovedKey = key;
            }
        }
    });
}

function _insert(oldViewableVirtualNodeMap, newViewableVirtualNodeMap) {
    let pendingVirtualNodes = [];

    newViewableVirtualNodeMap.forEach((newViewableVirtualNode, key) => {
        if (!oldViewableVirtualNodeMap.has(key)) {
            pendingVirtualNodes.push(newViewableVirtualNode);
        } else {
            _insertClosestNativeNodesOfVirtualNodes(pendingVirtualNodes, oldViewableVirtualNodeMap.get(key));
            pendingVirtualNodes.length = 0;
        }
    });

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
