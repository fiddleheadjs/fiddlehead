import {Ref} from './RefHook';
import {isArray, isFunction, isNumber, isString, slice} from './Util';
import {Fragment, TextNode, VirtualNode} from './VirtualNode';

// Use the same empty object to save memory
// Do not mutate it
const emptyProps = {};

/**
 *
 * @param {string|function} type
 * @param {{}|null} props
 * @param {any} content
 * @return {VirtualNode}
 */
export function createElement(type, props, content) {
    let key = null;
    let ref = null;

    const isTypeFunctional = isFunction(type);

    if (props === null) {
        // Functional type always need the props is an object
        if (isTypeFunctional) {
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
        if (props.ref instanceof Ref) {
            if (isTypeFunctional) {
                // We allow functional components to access ref prop like normal props
            } else {
                ref = props.ref;
                delete props.ref;
            }
        } else if (props.ref !== undefined) {
            if (__DEV__) {
                console.error('The ref value must be created by the useRef hook');
            }
            delete props.ref;
        }
    }
    
    // Create the node
    const virtualNode = new VirtualNode(type, props);

    // Set key and ref
    virtualNode.key_ = key;
    virtualNode.ref_ = ref;

    // Initialize children
    if (arguments.length > 2) {
        const isContentMultiple = arguments.length > 3;

        if (isContentMultiple) {
            content = slice.call(arguments, 2);
        }

        if (isTypeFunctional) {
            // JSX children
            if (virtualNode.props_ === emptyProps) {
                virtualNode.props_ = {children: content};
            } else {
                virtualNode.props_.children = content;
            }
        } else if (type === TextNode) {
            // Accept only one child
            // Or convert the children to the text content directly
            virtualNode.props_ = '' + content;
        } else {
            // Static node
            // Set children directly with static nodes
            if (isContentMultiple) {
                _initializeChildrenFromContent(virtualNode, content);
            } else {
                _initializeChildFromContent(virtualNode, content);
            }
        }
    }

    return virtualNode;
}

/**
 *
 * @param {any} content
 * @return {null|VirtualNode}
 */
export function createVirtualNodeFromContent(content) {
    if (content instanceof VirtualNode) {
        return content;
    }
        
    if (isString(content)) {
        return new VirtualNode(TextNode, content);
    }

    if (isNumber(content)) {
        return new VirtualNode(TextNode, '' + content);
    }

    if (isArray(content)) {
        const fragment = new VirtualNode(Fragment, null);
        _initializeChildrenFromContent(fragment, content);
        return fragment;
    }

    return null;
}

/**
 * 
 * @param {VirtualNode} current 
 * @param {any[]} content
 */
function _initializeChildrenFromContent(current, content) {
    let child, prevChild = null, i = 0;
    for (; i < content.length; ++i) {
        child = createVirtualNodeFromContent(content[i]);
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
 * @param {VirtualNode} current 
 * @param {any} content
 */
function _initializeChildFromContent(current, content) {
    const child = createVirtualNodeFromContent(content);
    if (child !== null) {
        current.child_ = child;
        child.parent_ = current;

        // Don't need to set the slot property
        // as this node have only one child
    }
}
