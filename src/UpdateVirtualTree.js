import {pathToString} from './Path';
import {hasOwnProperty, isFunction} from './Util';
import {unlinkMemoizedHooks} from './MemoizedHooks';
import {resolveVirtualTree} from './ResolveVirtualTree';
import {flushCurrentlyProcessing, prepareCurrentlyProcessing} from './CurrentlyProcessing';
import {appendChildVirtualNode, createVirtualNodeFromContent, NODE_TEXT} from './VirtualNode';
import {hydrateVirtualTree} from './HydrateVirtualTree';
import {commitView} from './CommitView';
import {destroyEffectsOnFunctionalVirtualNode, mountEffectsOnFunctionalVirtualNode} from './EffectHook';

/**
 *
 * @param {VirtualNode} rootVirtualNode
 * @param {boolean} initial
 */
export function updateVirtualTree(rootVirtualNode, initial) {
    const [oldStaticVirtualNodeMap, oldFunctionalVirtualNodeMap] = initial ? [{}, {}] : _getVirtualNodeMap(rootVirtualNode);
    _updateVirtualNodeRecursive(rootVirtualNode);
    const [newStaticVirtualNodeMap, newFunctionalVirtualNodeMap] = _getVirtualNodeMap(rootVirtualNode);

    _resolveUnmountedVirtualNodes(oldFunctionalVirtualNodeMap, newFunctionalVirtualNodeMap);
    hydrateVirtualTree(rootVirtualNode);
    commitView(oldStaticVirtualNodeMap, newStaticVirtualNodeMap);
    _resolveMountedVirtualNodes(oldFunctionalVirtualNodeMap, newFunctionalVirtualNodeMap);
}

/**
 *
 * @param {VirtualNode} virtualNode
 */
function _updateVirtualNodeRecursive(virtualNode) {
    if (virtualNode.type_ === NODE_TEXT) {
        return;
    }

    if (!isFunction(virtualNode.type_)) {
        for (let i = 0; i < virtualNode.children_.length; i++) {
            _updateVirtualNodeRecursive(virtualNode.children_[i]);
        }
        return;
    }

    prepareCurrentlyProcessing(virtualNode);
    const newVirtualNode = createVirtualNodeFromContent(
        virtualNode.type_(virtualNode.props_)
    );
    flushCurrentlyProcessing();

    if (newVirtualNode !== null) {
        appendChildVirtualNode(virtualNode, newVirtualNode, 0);

        // This step aimed to read memoized hooks and restore them
        resolveVirtualTree(virtualNode);

        // Recursion
        _updateVirtualNodeRecursive(newVirtualNode);
    }
}

function _resolveUnmountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key)) {
            const unmounted = !hasOwnProperty(newVirtualNodeMap, key);
            const virtualNode = oldVirtualNodeMap[key];

            if (isFunction(virtualNode.type_)) {
                destroyEffectsOnFunctionalVirtualNode(virtualNode, unmounted);

                if (unmounted) {
                    unlinkMemoizedHooks(virtualNode.path_);
                }
            }
        }
    }
}

function _resolveMountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    for (let key in newVirtualNodeMap) {
        if (hasOwnProperty(newVirtualNodeMap, key)) {
            const mounted = !hasOwnProperty(oldVirtualNodeMap, key);
            const virtualNode = newVirtualNodeMap[key];

            if (isFunction(virtualNode.type_)) {
                mountEffectsOnFunctionalVirtualNode(virtualNode, mounted);
            }
        }
    }
}

function _getVirtualNodeMap(rootVirtualNode) {
    const [outputStaticVirtualMap, outputFunctionalVirtualMap] = [Object.create(null), Object.create(null)];
    _walkVirtualNode(rootVirtualNode, outputFunctionalVirtualMap, outputStaticVirtualMap);
    
    return [outputStaticVirtualMap, outputFunctionalVirtualMap];
}

function _walkVirtualNode(virtualNode, outputFunctionalVirtualMap, outputStaticVirtualMap) {
    if(isFunction(virtualNode.type_)) {
        outputFunctionalVirtualMap[pathToString(virtualNode.path_)] = virtualNode;
    } else {
        outputStaticVirtualMap[pathToString(virtualNode.path_)] = virtualNode;
    }

    for (let i = 0; i < virtualNode.children_.length; i++) {
        _walkVirtualNode(virtualNode.children_[i], outputFunctionalVirtualMap, outputStaticVirtualMap);
    }
}
