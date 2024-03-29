import {objectsShallowEqual, isFunction} from './Util';
import {createVNodeFromContent} from './CreateVNode';
import {prepareCurrentlyProcessing, flushCurrentlyProcessing} from './CurrentlyProcessing';
import {catchError} from './CatchError';

export let reconcileChildren = (current, isRenderRoot) => {
    if (isFunction(current.type_)) {
        _reconcileOnlyChildOfDynamicNode(current, current.alternate_, isRenderRoot);
    } else if (current.alternate_ !== null) {
        _reconcileChildrenOfStaticNode(current, current.alternate_);
    }
};

let _reconcileOnlyChildOfDynamicNode = (current, alternate, isRenderRoot) => {
    // If the current has an alternate
    // Important note: The alternate of the render root always is null
    if (alternate !== null) {
        // Copy hooks
        current.refHook_ = alternate.refHook_;
        current.stateHook_ = alternate.stateHook_;
        current.effectHook_ = alternate.effectHook_;

        // Update contexts of state hooks
        let stateHook = current.stateHook_;
        while (stateHook !== null) {
            stateHook.context_ = current;
            stateHook = stateHook.next_;
        }

        // Transfer the update ID
        current.updateId_ = alternate.updateId_;
        // We must reset alternate's update ID to null.
        // There is a case, a node in the deleted subtree later updates its state
        // then the update batching logic looks at higher-order nodes, if there is any
        // one of them also wants to update, by checking if its update ID is not null.
        // The update will be triggered from the highest one found
        alternate.updateId_ = null;

        // Pure components:
        // If props did not change, and this reconciliation is caused by
        // the current itself updating or being marked to be updated (with updateId_),
        // but by an updating from a higher-level node, so it should NOT re-render
        if (
            // A render root never appears here because its alternate always is null
            // so don't need to check if the current is not a render root

            // Do not skip re-render if there is an update scheduled
            current.updateId_ === null &&

            // Compare current props vs previous props
            // Here, props always is an object with a functional component
            objectsShallowEqual(current.props_, alternate.props_)
        ) {
            // Reuse the child if needed
            if (current.child_ === null) {
                if (alternate.child_ === null) {
                    // Do nothing here
                    // The alternate does not have the child to reuse
                } else {
                    // Reuse the previous child
                    current.child_ = alternate.child_;
                    current.child_.parent_ = current;

                    // This is unnecessary but added to keep
                    // the data structure always being correct
                    alternate.child_ = null;
                }
            } else {
                // Do nothing here
                // The current already has its child
            }

            // Make itself the alternate to denote that it did not change,
            // so the next process will skip walking deeper in its children
            current.alternate_ = current;

            // Finish this reconciliation
            return;
        }
    }

    let newContent;
    prepareCurrentlyProcessing(current);
    try {
        newContent = current.type_(current.props_);
        flushCurrentlyProcessing();
    } catch (error) {
        newContent = null;
        // Must flush currently processing info before catchError(),
        // because catchError() may cause re-render at a higher level component
        flushCurrentlyProcessing();
        catchError(error, current);
    }

    let newChild = createVNodeFromContent(newContent);
    
    if (newChild !== null) {
        newChild.parent_ = current;
        
        // Don't need to set the slot property
        // as a dynamic node can have only one child
    }

    let oldChild = isRenderRoot ? current.child_ : (
        alternate !== null ? alternate.child_ : null
    );
    
    if (oldChild !== null) {
        if (newChild !== null &&
            newChild.type_ === oldChild.type_ &&
            newChild.key_ === oldChild.key_
        ) {
            newChild.alternate_ = oldChild;
        } else {
            _addDeletion(current, oldChild);
        }
    }
    
    current.child_ = newChild;
};

let _reconcileChildrenOfStaticNode = (current, alternate) => {
    let oldChildren = _mapChildren(alternate);
    let newChildren = _mapChildren(current);

    let newChild;
    oldChildren.forEach((oldChild, mapKey) => {
        newChild = newChildren.get(mapKey);
        if (newChild !== undefined &&
            newChild.type_ === oldChild.type_
        ) {
            newChild.alternate_ = oldChild;
        } else {
            _addDeletion(current, oldChild);
        }
    });
};

let _addDeletion = (current, childToDelete) => {
    if (current.deletions_ === null) {
        current.deletions_ = [childToDelete];
    } else {
        current.deletions_.push(childToDelete);
    }
};

let _mapChildren = (node) => {
    let map = new Map();
    let child = node.child_;
    while (child !== null) {
        if (child.key_ !== null) {
            map.set(child.key_, child);
        } else {
            map.set(child.slot_, child);
        }
        child = child.sibling_;
    }
    return map;
};
