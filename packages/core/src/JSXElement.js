import {Ref} from './RefHook';
import {TextNode, VNode} from './VNode';
import {setOnlyChildFromContent, setChildrenFromContent} from './SetChildren';
import {isArray, isFunction, isNumber, isString, slice} from './Util';

// Use the same empty object to save memory.
// Do NOT mutate it
const emptyProps = {};
Object.freeze(emptyProps);

/**
 *
 * @param {string|function} type
 * @param {{}|null} props
 * @param {any} content
 * @constructor
 */
export function JSXElement(type, props, content) {
    this.type_ = type;
    this.props_ = props;
    this.content_ = content;
}

/**
 * 
 * @param {string|function} type
 * @param {{}|null} props
 * @param {any} content
 * @returns {JSXElement}
 */
export let createElement = function (type, props, content) {
    if (arguments.length > 3) {
        content = slice.call(arguments, 2);
    }
    
    return new JSXElement(type, props, content);
};

/**
 * 
 * @param {JSXElement} element 
 * @returns {VNode}
 */
export let createVNodeFromJSXElement = (element) => {
    // Type and content
    let type = element.type_;
    let content = element.content_;
    let isFunctionalType = isFunction(type);
    let hasContent = content !== undefined;

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
        // Accept any data type, except number (convert to string) and undefined
        if (props.key !== undefined) {
            if (isNumber(props.key)) {
                key = '' + props.key;
            } else {
                key = props.key;
            }
            delete props.key;
        }

        // Set children for functional types
        // and set ref for static types.
        // Allow functional types to access ref normally
        if (isFunctionalType) {
            if (hasContent) {
                props.children = content;
            }
            Object.freeze(props);
        } else {
            if (props.ref !== undefined) {
                if (props.ref instanceof Ref) {
                    ref = props.ref;
                } else {
                    if (__DEV__) {
                        console.error('The ref property is invalid');
                    }
                }
                delete props.ref;
            }
        }
    }

    // Initialize the node
    let vnode = new VNode(type, props);

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
                setChildrenFromContent(vnode, content);
            } else {
                setOnlyChildFromContent(vnode, content);
            }
        }
    }

    return vnode;
};
