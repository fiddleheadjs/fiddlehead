import {unlinkMemoizedHooks} from './MemoizedHooks';
import {resolveVirtualTree} from './ResolveVirtualTree';
import {flushCurrentlyProcessing, prepareCurrentlyProcessing} from './CurrentlyProcessing';
import {createVirtualNodeFromContent} from './VirtualNode';
import {commitView} from './CommitView';
import {destroyEffectsOnFunctionalVirtualNode, mountEffectsOnFunctionalVirtualNode} from './EffectHook';
import {isFunction} from './Util';

/**
 *
 * @param {VirtualNode} rootVirtualNode
 */
export const updateVirtualTree = (rootVirtualNode) => {
    _walk(rootVirtualNode);
}

const _walk = (currentNode, oldNode, parentNode) => {
    if (parentNode.flag_ === 'UPDATE') {
        if (isFunction(currentNode.type_)) {
            // Find corresponding old node
            let oldNode = parentNode.old_.child_;
            while (oldNode !== null) {
                if (currentNode.key_ !== null && currentNode.key_ === oldNode.key_) {
                    break;
                }
                if (currentNode.posInRow_ === oldNode.posInRow_) {
                    break;
                }
                oldNode = oldNode.sibling_;
            }

            // Transfer memoized hooks
            if (oldNode !== null) {
                currentNode.hooks_ = oldNode.hooks_;
                for (
                    let hook, i = 0, len = currentNode.hooks_.length
                    ; i < len
                    ; ++i
                ) {
                    hook = currentNode.hooks_[i];
    
                    if (hook instanceof StateHook) {
                        hook.context_ = currentNode;
                    }
                }
            }

            // Render
            prepareCurrentlyProcessing(currentNode);
            const newChildNode = currentNode.type_(currentNode.props_);
            flushCurrentlyProcessing();
    
            if (newChildNode !== null) {
                newChildNode.parent_ = currentNode;
                newChildNode.old_ = currentNode.child_;
                newChildNode.flag_ = 'UPDATE';
                newChildNode.posInRow_ = 0;
                currentNode.child_ = newChildNode;
            } else {
                if (currentNode.child_ !== null) {
                    currentNode.child_.flag_ = 'DELETE';
                }
            }
        } else {
            
        }
    }
}
