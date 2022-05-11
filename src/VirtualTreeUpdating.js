import {stringifyPath} from './Path';
import {hasOwnProperty, isFunction} from './Util';
import {unlinkFunctionalVirtualNode} from './FunctionalVirtualNodeMapping';
import {didResolveVirtualTree, hydrateVirtualTree, resolveVirtualTree} from './VirtualTreeResolving';
import {flushCurrentlyRendering, prepareCurrentlyRendering} from './CurrentlyProcessing';
import {NODE_TEXT} from './VirtualNode';
import {commitView} from './ViewCommitment';
import {destroyEffectsOnFunctionalVirtualNode, mountEffectsOnFunctionalVirtualNode} from './EffectHook';

/**
 *
 * @param {VirtualNode} rootVirtualNode
 * @param {boolean} isInit
 */
export function updateVirtualTree(rootVirtualNode, isInit = false) {
    const oldVirtualNodeMap = isInit ? {} : _getVirtualNodeMap(rootVirtualNode);
    _updateVirtualNode(rootVirtualNode);
    const newVirtualNodeMap = _getVirtualNodeMap(rootVirtualNode);

    _resolveUnmountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap);
    hydrateVirtualTree(rootVirtualNode);
    commitView(oldVirtualNodeMap, newVirtualNodeMap);
    _resolveMountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap);
}

/**
 *
 * @param {VirtualNode} virtualNode
 */
function _updateVirtualNode(virtualNode) {
    _updateVirtualNodeRecursive(virtualNode);
    didResolveVirtualTree();
}

/**
 *
 * @param {VirtualNode} virtualNode
 */
function _updateVirtualNodeRecursive(virtualNode) {
    if (virtualNode.type === NODE_TEXT) {
        return;
    }

    if (!isFunction(virtualNode.type)) {
        for (let i = 0; i < virtualNode.children.length; i++) {
            _updateVirtualNodeRecursive(virtualNode.children[i]);
        }
        return;
    }

    {
        prepareCurrentlyRendering(virtualNode);
        const newVirtualNode = virtualNode.type(virtualNode.props);
        flushCurrentlyRendering();

        // 0 is the position of the new one
        resolveVirtualTree(newVirtualNode, [...virtualNode.path, 0]);

        newVirtualNode.parent = virtualNode;
        virtualNode.children[0] = newVirtualNode;

        _updateVirtualNodeRecursive(newVirtualNode);
    }
}

function _resolveUnmountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key)) {
            const unmounted = !hasOwnProperty(newVirtualNodeMap, key);
            const virtualNode = oldVirtualNodeMap[key];

            if (isFunction(virtualNode.type)) {
                destroyEffectsOnFunctionalVirtualNode(virtualNode, unmounted);

                if (unmounted) {
                    unlinkFunctionalVirtualNode(virtualNode.path);
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

            if (isFunction(virtualNode.type)) {
                mountEffectsOnFunctionalVirtualNode(virtualNode, mounted);
            }
        }
    }
}

function _getVirtualNodeMap(rootVirtualNode) {
    const out = {};

    const walk = (virtualNode) => {
        out[stringifyPath(virtualNode.path)] = virtualNode;

        for (let i = 0; i < virtualNode.children.length; i++) {
            walk(virtualNode.children[i]);
        }
    };

    walk(rootVirtualNode);

    return out;
}
