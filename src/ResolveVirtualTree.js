import {escapeVirtualNodeKey, NS_HTML, NS_SVG, PATH_SEP} from './VirtualNode';
import {getFunctionalTypeAlias} from './Externals';
import {findMemoizedHooks, linkMemoizedHooks} from './MemoizedHooks';
import {StateHook} from './StateHook';
import { isFunction, isNullish } from './Util';

export const resolveVirtualTree = (functionalVirtualNode) => {
    // Functional nodes always have children
    // so, don't need to check if children_ !== undefined
    for (
        let i = 0, len = functionalVirtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _resolveVirtualNodeRecursive(functionalVirtualNode.children_[i], functionalVirtualNode.path_, i);
    }
}

/**
 *
 * @param {VirtualNode} virtualNode
 * @param {string} parentPath
 * @private
 */
const _resolveVirtualNodeRecursive = (virtualNode, parentPath, posInRow) => {
    const functional = isFunction(virtualNode.type_);

    // Set path
    virtualNode.path_ = (
        parentPath
        + PATH_SEP
        + (!isNullish(virtualNode.key_)
            ? escapeVirtualNodeKey(virtualNode.key_)
            : posInRow)
        + PATH_SEP
        + (functional
            ? getFunctionalTypeAlias(virtualNode.type_)
            : virtualNode.type_)
    );

    // Restore memoized states
    if (functional) {
        const memoizedHooks = findMemoizedHooks(virtualNode.path_);
        if (memoizedHooks !== null) {
            // Here, new node does not have any hooks
            // because it is in the pending state
            // After when the tree is established
            // and then updating, the hooks will be called (or created if it is the first time)
            virtualNode.hooks_ = memoizedHooks;

            for (
                let hook, i = 0, len = virtualNode.hooks_.length
                ; i < len
                ; ++i
            ) {
                hook = virtualNode.hooks_[i];

                if (hook instanceof StateHook) {
                    hook.context_ = virtualNode;
                }
            }
        }

        linkMemoizedHooks(virtualNode.path_, virtualNode.hooks_);
    }

    // Namespace
    virtualNode.ns_ = _determineNS(virtualNode);

    if (virtualNode.children_ !== undefined) {
        // Recursion
        for (
            let i = 0, len = virtualNode.children_.length
            ; i < len
            ; ++i
        ) {
            _resolveVirtualNodeRecursive(virtualNode.children_[i], virtualNode.path_, i);
        }
    }
}

const _determineNS = (virtualNode) => {
    // Intrinsic namespace
    if (virtualNode.type_ === 'svg') {
        return NS_SVG;
    }
 
    // As we never hydrate the container node,
    // the parent_ never empty here
    if (virtualNode.parent_.ns_ === NS_SVG && virtualNode.parent_.type_ === 'foreignObject') {
        return NS_HTML;
    }
    
    // By default, pass namespace below.
    return virtualNode.parent_.ns_;
}
