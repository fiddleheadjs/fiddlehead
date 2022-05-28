import {hydrateVirtualNode} from './HydrateView';
import {linkNativeNode, RootType, NODE_FRAGMENT, NODE_TEXT} from './VirtualNode';
import {attachVirtualNode} from './Externals';
import {isFunction} from './Util';
import {updateNativeTextNode, updateNativeElementAttributes} from './NativeDOM';

export const updateView = (newVirtualNode, oldVirtualNode) => {
    // Reuse the existing native node
    linkNativeNode(newVirtualNode, oldVirtualNode.nativeNode_);

    if (__DEV__) {
        attachVirtualNode(oldVirtualNode.nativeNode_, newVirtualNode);
    }

    if (newVirtualNode.type_ === NODE_TEXT) {
        if (newVirtualNode.props_.children !== oldVirtualNode.props_.children) {
            updateNativeTextNode(
                newVirtualNode.nativeNode_,
                newVirtualNode.props_.children
            );
        }
    } else if (newVirtualNode.type_ === NODE_FRAGMENT || isFunction(newVirtualNode.type_)) {
        // Do nothing with fragments
    } else {
        updateNativeElementAttributes(
            newVirtualNode.nativeNode_,
            newVirtualNode.props_,
            oldVirtualNode.props_
        );
    }
}

export const insertView = (node) => {
    hydrateVirtualNode(node);

    const nativeParent = node.parent_.nativeNode_;
    
    const nativeAfter = node.prevSibling_ !== null
        ? node.prevSibling_.nativeNode_.nextSibling
        : nativeParent.firstChild;

    nativeParent.insertBefore(node.nativeNode_, nativeAfter);
}

export const deleteView = (subtree) => {
    _loopClosestNativeNodes(subtree, (nativeNode) => {
        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    });
}

const _findNativeHost = (virtualNode) => {
    if (virtualNode.type_ === RootType) {
        return virtualNode.nativeNode_;
    }
    
    if (virtualNode.parent_ === null) {
        return null;
    }

    if (virtualNode.parent_.nativeNode_ !== null) {
        return virtualNode.parent_.nativeNode_;
    }
    
    return _findNativeHost(virtualNode.parent_);
}

const _loopClosestNativeNodes = (virtualNode, callback) => {
    if (virtualNode.nativeNode_ !== null) {
        callback(virtualNode.nativeNode_);
        return;
    }
    
    let childNode = virtualNode.child_;
    while (childNode !== null) {
        _loopClosestNativeNodes(childNode, callback);
        childNode = childNode.sibling_;
    }
}
