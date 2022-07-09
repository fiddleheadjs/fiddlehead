import {VNode} from './VNode';
import {createVNodeFromContent} from './CreateVNode';

/**
 * 
 * @param {VNode} current
 * @param {any[]} content
 */
 export const setChildrenFromContent = (current, content) => {
    let child, prevChild = null, i = 0;
    for (; i < content.length; ++i) {
        child = createVNodeFromContent(content[i]);
        if (child !== null) {
            child.parent_ = current;
            child.slot_ = i;

            if (prevChild !== null) {
                prevChild.sibling_ = child;
            } else {
                current.child_ = child;
            }

            prevChild = child;
        }
    }
}

/**
 * 
 * @param {VNode} current 
 * @param {any} content
 */
export const setOnlyChildFromContent = (current, content) => {
    const child = createVNodeFromContent(content);
    if (child !== null) {
        current.child_ = child;
        child.parent_ = current;

        // Don't need to set the slot property
        // as this node have only one child
    }
}
