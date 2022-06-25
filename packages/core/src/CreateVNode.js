import {Ref} from './RefHook';
import {JSXElement} from './JSXElement';
import {isArray, isFunction, isNumber, isString} from './Util';
import {Fragment, TextNode, VNode} from './VNode';

// Use the same empty object to save memory.
// Do NOT mutate it
const emptyProps = {};
Object.freeze(emptyProps);

/**
 * 
 * @param {any} content 
 * @returns {boolean}
 */
export function isValidElement(content) {
    if (content instanceof JSXElement) {
        return true;
    }

    if (isString(content)) {
        return true;
    }

    if (isNumber(content)) {
        return true;
    }

    if (isArray(content)) {
        return true;
    }

    if (content instanceof VNode) {
        // Support rendering portal nodes
        return true;
    }

    return false;
}

/**
 *
 * @param {any} content
 * @return {null|VNode}
 */
export function createVNodeFromContent(content) {
    if (content instanceof JSXElement) {
        return _createVNodeFromElement(content);
    }

    if (isString(content)) {
        return new VNode(TextNode, content);
    }

    if (isNumber(content)) {
        return new VNode(TextNode, '' + content);
    }

    if (isArray(content)) {
        const fragment = new VNode(Fragment, null);
        _setChildrenFromContent(fragment, content);
        return fragment;
    }

    if (content instanceof VNode) {
        // Support rendering portal nodes
        return content;
    }

    return null;
}

/**
 * 
 * @param {JSXElement} element 
 * @returns {VNode}
 */
function _createVNodeFromElement(element) {
    // Type and content
    const type = element.type_;
    const content = element.content_;
    const isFunctionalType = isFunction(type);
    const hasContent = content !== undefined;

    // Resolve props
    let props = element.props_;
    let key = null;
    let ref = null;

    if (props === null) {
        // Functional types always need the props to be an object
        if (isFunctionalType) {
            if (hasContent) {
                props = {children: content};
                Object.freeze(props);
            } else {
                props = emptyProps;
            }
        }
    } else {
        // Normalize key
        // Accept any data type, except number and undefined
        if (props.key !== undefined) {
            if (isNumber(props.key)) {
                key = '' + props.key;
            } else {
                key = props.key;
            }

            // Delete key from props, but for performance,
            // we don't try to delete undefined property
            delete props.key;
        }

        // Normalize ref
        if (props.ref !== undefined) {
            if (props.ref instanceof Ref) {
                if (isFunctionalType) {
                    // We allow functional components to access ref prop like normal props
                } else {
                    ref = props.ref;
                    delete props.ref;
                }
            } else {
                if (__DEV__) {
                    console.error('The ref value must be created by the useRef hook');
                }
                delete props.ref;
            }
        }

        // Set children for functional types
        if (isFunctionalType) {
            if (hasContent) {
                props.children = content;
            }
            Object.freeze(props);
        }
    }

    // Initialize the node
    const vnode = new VNode(type, props);

    // Set key and ref
    vnode.key_ = key;
    vnode.ref_ = ref;

    // Set children
    if (hasContent) {
        if (isFunctionalType) {
            // Do nothing here 
        } else if (type === TextNode) {
            // Text nodes accept only one string as the child.
            // Everything else will be converted to string
            if (isString(content)) {
                vnode.props_ = content;
            } else {
                vnode.props_ = '' + content;
            }
        } else {
            // For fragments and HTML elements
            if (isArray(content)) {
                // Multiple children.
                // If the only child is an array, treat its elements as the children of the node
                _setChildrenFromContent(vnode, content);
            } else {
                _setChildFromContent(vnode, content);
            }
        }
    }

    return vnode;
}

/**
 * 
 * @param {VNode} current
 * @param {any[]} content
 */
function _setChildrenFromContent(current, content) {
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
function _setChildFromContent(current, content) {
    const child = createVNodeFromContent(content);
    if (child !== null) {
        current.child_ = child;
        child.parent_ = current;

        // Don't need to set the slot property
        // as this node have only one child
    }
}
