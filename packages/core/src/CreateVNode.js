import {Ref} from './RefHook';
import {JSXElement} from './JSXElement';
import {isArray, isFunction, isNumber, isString} from './Util';
import {Fragment, TextNode, VNode} from './VNode';

// Use the same empty object to save memory
// Do NOT mutate it
const emptyProps = {};

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
        _initializeChildrenFromContent(fragment, content);
        return fragment;
    }

    return null;
}

/**
 * 
 * @param {JSXElement} element 
 * @returns {VNode}
 */
function _createVNodeFromElement(element) {
    let type = element.type_;
    let props = element.props_;
    let content = element.content_;
    
    // Resolve props, key and ref
    let key = null;
    let ref = null;
    
    if (props === null) {
        // Functional type always need the props is an object
        if (isFunction(type)) {
            props = emptyProps;
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
                if (isFunction(type)) {
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
    }
    
    // Create the node
    const vnode = new VNode(type, props);

    // Set key and ref
    vnode.key_ = key;
    vnode.ref_ = ref;

    // Initialize children
    if (content !== undefined) {
        if (isFunction(type)) {
            // JSX children
            if (vnode.props_ === emptyProps) {
                vnode.props_ = {};
            }
            vnode.props_.children = content;
        } else if (type === TextNode) {
            // Accept only one child
            // Or convert the children to the text content directly
            vnode.props_ = content;
        } else {
            // Fragments or DOM nodes
            if (isArray(content)) {
                _initializeChildrenFromContent(vnode, content);
            } else {
                if (type !== Fragment && (isString(content) || isNumber(content))) {
                    if (vnode.props_ === null) {
                        vnode.props_ = {};
                    }
                    vnode.props_.textContent = content;
                } else {
                    _initializeChildFromContent(vnode, content);
                }
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
function _initializeChildrenFromContent(current, content) {
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
function _initializeChildFromContent(current, content) {
    const child = createVNodeFromContent(content);
    if (child !== null) {
        current.child_ = child;
        child.parent_ = current;

        // Don't need to set the slot property
        // as this node have only one child
    }
}
