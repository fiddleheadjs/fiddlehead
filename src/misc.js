import {PROP_CONTAINER_ID, PROP_COMPONENT_TYPE} from './AttachmentProps.js';
import {hasOwnProperty} from "./utils";

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

