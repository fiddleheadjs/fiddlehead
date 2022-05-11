import {hasOwnProperty} from "./Util";

const PROP_COMPONENT_TYPE = 'Hook$ComponentType';
const PROP_CONTAINER_ID = 'Hook$ContainerId';
const PROP_VIRTUAL_NODE = 'Hook$VirtualNode';

let containerIdInc = 0;
export function getContainerId(root) {
    if (!hasOwnProperty(root, PROP_CONTAINER_ID)) {
        root[PROP_CONTAINER_ID] = '~' + (++containerIdInc);
    }
    return root[PROP_CONTAINER_ID];
}

let componentTypeInc = 0;
/**
 *
 * @param {Function} Component
 * @returns {string}
 */
export function getComponentType(Component) {
    if (!hasOwnProperty(Component, PROP_COMPONENT_TYPE)) {
        Component[PROP_COMPONENT_TYPE] = Component.name + '$' + (++componentTypeInc);
    }
    return Component[PROP_COMPONENT_TYPE];
}

export function attachVirtualNode(viewNode, virtualNode) {
    viewNode[PROP_VIRTUAL_NODE] = virtualNode;
}
