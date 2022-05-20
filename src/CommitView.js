import {linkNativeNode, NODE_TEXT, RootType} from './VirtualNode';
import {updateNativeElementAttributes, updateNativeTextNode} from './NativeDOM';
import {PATH_SEP} from './VirtualNode';
import {startsWith} from './Util';
import {hydrateViewableVirtualNode} from './HydrateView';
import {attachVirtualNode} from './Externals';

// !!!IMPORTANT
// Only use this module for viewable nodes
// Passing Functional, Array, Fragment nodes will lead to crash

export const commitView = (oldViewableVirtualNodeMap, newViewableVirtualNodeMap) => {
    if (oldViewableVirtualNodeMap.size === 0) {
        _append(newViewableVirtualNodeMap);
    } else {
        /*
        | for key in oldMap
        |     if newMap.has(key)
        |         updateNativeNodes
        |     else
        |         removeNativeNodes
        |
        | for key in newMap
        |     if !oldMap.has(key)
        |         insertNativeNodes
        */
        _removeAndUpdate(oldViewableVirtualNodeMap, newViewableVirtualNodeMap);
        _insert(oldViewableVirtualNodeMap, newViewableVirtualNodeMap);
    }
}

const _removeAndUpdate = (oldViewableVirtualNodeMap, newViewableVirtualNodeMap) => {
    // New node to be inserted
    let newViewableVirtualNode;

    // If the current node is under the last removed node
    // So dont need to remove current node anymore
    // Use lastRemovedKey to track
    let lastRemovedKey = '';

    oldViewableVirtualNodeMap.forEach((oldViewableVirtualNode, key) => {
        if (newViewableVirtualNodeMap.has(key)) {
            newViewableVirtualNode = newViewableVirtualNodeMap.get(key);

            // Reuse the existing native node
            linkNativeNode(newViewableVirtualNode, oldViewableVirtualNode.nativeNode_);

            if (__DEV__) {
                attachVirtualNode(oldViewableVirtualNode.nativeNode_, newViewableVirtualNode);
            }

            if (newViewableVirtualNode.type_ === NODE_TEXT) {
                if (newViewableVirtualNode.props_.children !== oldViewableVirtualNode.props_.children) {
                    updateNativeTextNode(
                        newViewableVirtualNode.nativeNode_,
                        newViewableVirtualNode.props_.children
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
            if (!startsWith(key, lastRemovedKey + PATH_SEP)) {
                _removeNativeNodesOfVirtualNode(oldViewableVirtualNode);
                lastRemovedKey = key;
            }
        }
    });
}

const _append = (newViewableVirtualNodeMap) => {
    let nativeHost;

    newViewableVirtualNodeMap.forEach((virtualNode) => {
        nativeHost = _findNativeHost(virtualNode);

        if (nativeHost !== null) {
            hydrateViewableVirtualNode(virtualNode);
            nativeHost.appendChild(virtualNode.nativeNode_);
        }
    });
}

const _insert = (oldViewableVirtualNodeMap, newViewableVirtualNodeMap) => {
    let pendingViewableVirtualNodes = [];

    newViewableVirtualNodeMap.forEach((newViewableVirtualNode, key) => {
        if (!oldViewableVirtualNodeMap.has(key)) {
            pendingViewableVirtualNodes.push(newViewableVirtualNode);
        } else {
            _insertClosestNativeNodesOfVirtualNodes(pendingViewableVirtualNodes, oldViewableVirtualNodeMap.get(key));
            pendingViewableVirtualNodes.length = 0;
        }
    });

    if (pendingViewableVirtualNodes.length > 0) {
        _insertClosestNativeNodesOfVirtualNodes(pendingViewableVirtualNodes, null);
    }
}

const _insertClosestNativeNodesOfVirtualNodes = (virtualNodes, virtualNodeAfter) => {
    const nativeNodeAfter = virtualNodeAfter && _findFirstNativeNode(virtualNodeAfter) || null;
    
    for (
        let virtualNode, nativeHost, i = 0, len = virtualNodes.length
        ; i < len
        ; ++i
    ) {
        virtualNode = virtualNodes[i];

        nativeHost = _findNativeHost(virtualNode);
        
        if (nativeHost !== null) {
            hydrateViewableVirtualNode(virtualNode);

            if (nativeNodeAfter !== null && nativeHost === nativeNodeAfter.parentNode) {
                nativeHost.insertBefore(virtualNode.nativeNode_, nativeNodeAfter);
            } else {
                nativeHost.appendChild(virtualNode.nativeNode_);
            }
        }
    }
}

const _removeNativeNodesOfVirtualNode = (virtualNode) => {
    const nativeNodes = _findClosestNativeNodes(virtualNode);

    for (
        let nativeNode, i = 0, len = nativeNodes.length
        ; i < len
        ; ++i
    ) {
        nativeNode = nativeNodes[i];

        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    }
}

const _findNativeHost = (virtualNode) => {
    if (virtualNode.type_ === RootType) {
        return virtualNode.nativeNode_;
    }
    
    if (virtualNode.parent_ === null) {
        return null;
    }

    if (virtualNode.parent_.nativeNode_ === null) {
        return _findNativeHost(virtualNode.parent_);
    }

    return virtualNode.parent_.nativeNode_;
}

const _findFirstNativeNode = (virtualNode) => {
    if (virtualNode.nativeNode_ !== null) {
        return virtualNode.nativeNode_;
    }
    
    let firstNativeNode = null;
    
    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len && firstNativeNode === null
        ; ++i
    ) {
        firstNativeNode = _findFirstNativeNode(virtualNode.children_[i]);
    }

    return firstNativeNode;
}

const _findClosestNativeNodes = (virtualNode) => {
    if (virtualNode.nativeNode_ !== null) {
        return [virtualNode.nativeNode_];
    }
    
    const closestNativeNodes = [];

    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        closestNativeNodes.push(..._findClosestNativeNodes(virtualNode.children_[i]));
    }

    return closestNativeNodes;
}
