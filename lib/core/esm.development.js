const hasOwnProperty = Object.prototype.hasOwnProperty;

const slice = Array.prototype.slice;

function isString(value) {
    return typeof value === 'string'/* || value instanceof String*/;
}

function isNumber(value) {
    return typeof value === 'number'/* || value instanceof Number*/;
}

function isFunction(value) {
    return typeof value === 'function';
}

function isArray(value) {
    return value instanceof Array;
}

function isNullish(value) {
    return value === null || value === undefined;
}

/**
 * 
 * @param {Array} a 
 * @param {Array} b 
 * @returns {boolean}
 */
function compareArrays(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = a.length - 1; i >= 0; --i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

/**
 *
 * @param {string|function} type
 * @param {{}|null} props
 * @param {any} content
 * @constructor
 */
function JSXElement(type, props, content) {
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
function createElement(type, props, content) {
    if (arguments.length > 3) {
        content = slice.call(arguments, 2);
    }
    
    return new JSXElement(type, props, content);
}

// Do not support namespace MathML as almost browsers do not support as well
const NAMESPACE_HTML = 0;
const NAMESPACE_SVG = 1;

// Special node types
const TextNode = '#';
const Fragment = '[';
function Portal(props) {
    return props.children;
}

/**
 * 
 * @param {function|string} type
 * @param {{}|string|null} props
 * @constructor
 */
function VNode(type, props) {
    // Identification
    // ==============

    /**
     * @type {string|function}
     */
    this.type_ = type;

    /**
     * @type {string|null}
     */
    this.key_ = null;

    /**
     * @type {number|null}
     */
    this.slot_ = null;

    // Props and hooks
    // ===============

    /**
     * @type {{}|string|null}
     */
    this.props_ = props;

    /**
     * @type {RefHook|null}
     */
    this.refHook_ = null;
    
    /**
     * @type {StateHook|null}
     */
    this.stateHook_ = null;

    /**
     * @type {EffectHook|null}
     */
    this.effectHook_ = null;
    
    // Output native node and relates
    // ==============================
    
    /**
     * @type {Node}
     */
    this.nativeNode_ = null;

    /**
     * @type {string|null}
     */
    this.namespace_ = null;

    /**
     * @type {Ref|null}
     */
    this.ref_ = null;

    // Linked-list pointers
    // ====================

    /**
     * @type {VNode|null}
     */
    this.parent_ = null;
    
    /**
     * @type {VNode|null}
     */
    this.child_ = null;

    /**
     * @type {VNode|null}
     */
    this.sibling_ = null;

    // Temporary properties
    // ====================
    
    // The previous version of this node
    /**
     * @type {VNode|null}
     */
    this.alternate_ = null;

    // The children (and their subtrees, of course) are marked to be deleted
    /**
     * @type {VNode[]}
     */
    this.deletions_ = null;

    // Insertion flag
    // To be used to optimize the painting process
    /**
     * @type {number|null}
     */
    this.insertion_ = null;
 
    // If this node is a mounting point, this property tracks the native child
    // that will be used as the reference node to insert the new child after it
    /**
     * @type {Node|null}
     */
    this.mountingRef_ = null;
}

const PROP_VNODE = '%vnode';

/**
 * 
 * @param {Node} nativeNode 
 * @param {VNode} vnode 
 */
function attachVNodeToNativeNode(nativeNode, vnode) {
    nativeNode[PROP_VNODE] = vnode;
}

/**
 * 
 * @param {Node} nativeNode 
 * @returns {VNode|undefined}
 */
function extractVNodeFromNativeNode(nativeNode) {
    return nativeNode[PROP_VNODE];
}

/**
 * 
 * @param {VNode} vnode 
 * @param {Node} nativeNode
 */
 function linkNativeNodeWithVNode(vnode, nativeNode) {
    vnode.nativeNode_ = nativeNode;

    if (vnode.ref_ !== null) {
        vnode.ref_.current = nativeNode;
    }
}

// The mounting point is a virtual node which has a native node (not null)
// It means that a mounting point can contains native children
/**
 * 
 * @param {VNode} current 
 * @returns {VNode}
 */
function resolveMountingPoint(current) {
    while (true) {
        if (current === null) {
            return null;
        }
        if (current.nativeNode_ !== null) {
            return current;
        }
        current = current.parent_;
    }
}

// Walk through native children of a parent
/**
 * 
 * @param {function} callback 
 * @param {VNode} parent 
 * @param {VNode?} stopBefore
 * @returns {void}
 */
function walkNativeChildren(callback, parent, stopBefore) {
    let current = parent.child_;
    if (current !== null) {
        while (true) {
            if (current === stopBefore) {
                return;
            }
            if (current.nativeNode_ !== null) {
                callback(current.nativeNode_);
            } else if (current.child_ !== null) {
                current = current.child_;
                continue;
            }
            if (current === parent) {
                return;
            }
            while (current.sibling_ === null) {
                if (current.parent_ === null || current.parent_ === parent) {
                    return;
                }
                current = current.parent_;
            }
            current = current.sibling_;
        }
    }
}

function updateNativeTextContent(node, text) {
    if (node.textContent !== text) {
        node.textContent = text;
    }
}

function updateNativeElementAttributes(element, newAttributes, oldAttributes) {
    _updateKeyValues(
        element, newAttributes, oldAttributes,
        _updateElementAttribute, _removeElementAttribute
    );
}

function _updateElementAttribute(element, attrName, newAttrValue, oldAttrValue) {
    attrName = _normalizeElementAttributeName(attrName);

    if (attrName === '') {
        return;
    }

    if (attrName === 'style') {
        _updateStyleProperties(element[attrName], newAttrValue, oldAttrValue);
        return;
    }

    if (_canBeAttribute(attrName, newAttrValue)) {
        element.setAttribute(attrName, newAttrValue);
        // Continue handle as properties
    }
    if (attrName in element) {
        try {
            element[attrName] = newAttrValue;
        } catch (x) {
            // Property may not writable
        }
    }
}

function _removeElementAttribute(element, attrName, oldAttrValue) {
    attrName = _normalizeElementAttributeName(attrName);
    
    if (attrName === '') {
        return;
    }

    if (attrName === 'style') {
        _updateStyleProperties(element[attrName], null, oldAttrValue);

        // Clean up HTML code
        element.removeAttribute(attrName);
        return;
    }

    if (_canBeAttribute(attrName, oldAttrValue)) {
        element.removeAttribute(attrName);
        // Continue handle as properties
    }
    if (attrName in element) {
        try {
            element[attrName] = null;
        } catch (x) {
            // Property may not writable
        }
    }
}

const onEventRegex = /^on[A-Z]/;

function _normalizeElementAttributeName(attrName) {
    // Support React className
    if (attrName === 'className') {
        return 'class';
    }

    // Support camelcase event listener bindings
    if (onEventRegex.test(attrName)) {
        return attrName.toLowerCase();
    }

    return attrName;
}

function _canBeAttribute(name, value) {
    if (name === 'innerHTML' || name === 'innerText' || name === 'textContent') {
        return false;
    }

    if (!(isString(value) || isNumber(value))) {
        return false;
    }

    return true;
}

function _updateStyleProperties(style, newProperties, oldProperties) {
    _updateKeyValues(
        style, newProperties, oldProperties,
        _updateStyleProperty, _removeStyleProperty
    );
}

function _updateStyleProperty(style, propName, newPropValue) {
    style[propName] = newPropValue;
}

function _removeStyleProperty(style, propName) {
    style[propName] = '';
}

function _updateKeyValues(target, newKeyValues, oldKeyValues, updateFn, removeFn) {
    const oldEmpty = isNullish(oldKeyValues);
    const newEmpty = isNullish(newKeyValues);

    let key;

    if (oldEmpty) {
        if (newEmpty) ; else {
            for (key in newKeyValues) {
                if (_hasOwnNonEmpty(newKeyValues, key)) {
                    updateFn(target, key, newKeyValues[key]);
                }
            }
        }
    } else if (newEmpty) {
        for (key in oldKeyValues) {
            if (_hasOwnNonEmpty(oldKeyValues, key)) {
                removeFn(target, key, oldKeyValues[key]);
            }
        }
    } else {
        for (key in oldKeyValues) {
            if (_hasOwnNonEmpty(oldKeyValues, key)) {
                if (_hasOwnNonEmpty(newKeyValues, key)) ; else {
                    removeFn(target, key, oldKeyValues[key]);
                }
            }
        }
        for (key in newKeyValues) {
            if (_hasOwnNonEmpty(newKeyValues, key)) {
                updateFn(target, key, newKeyValues[key], oldKeyValues[key]);
            }
        }
    }
}

function _hasOwnNonEmpty(target, prop) {
    return (
        hasOwnProperty.call(target, prop)
        && !isNullish(target[prop])
    );
}

function createNativeTextNode(text) {
    return document.createTextNode(text);
}

function createNativeElementWithNS(ns, type, attributes) {
    const element = (ns === NAMESPACE_SVG
        ? document.createElementNS('http://www.w3.org/2000/svg', type)
        : document.createElement(type)
    );

    updateNativeElementAttributes(element, attributes);
    
    return element;
}

function removeNativeNode(nativeNode) {
    if (nativeNode.parentNode !== null) {
        nativeNode.parentNode.removeChild(nativeNode);
    }
}

function insertNativeNodeAfter(parent, newChild, childBefore) {
    parent.insertBefore(newChild, (
        childBefore !== null ? childBefore.nextSibling : parent.firstChild
    ));
}

// Important!!!
// This module does not handle Portal nodes

function hydrateView(vnode) {
    vnode.namespace_ = _determineNS(vnode);

    // Do nothing more with fragments
    if (_isDry(vnode.type_)) {
        return;
    }

    let nativeNode;
    if (vnode.type_ === TextNode) {
        nativeNode = createNativeTextNode(vnode.props_);
        
        // In the production mode, remove text content from the virtual text node
        // to save memory. Later, we will compare the new text with the text content
        // of the native node, though it is not a perfect way to compare.
        if (!true) {
            vnode.props_ = null;
        }
    } else {
        nativeNode = createNativeElementWithNS(
            vnode.namespace_,
            vnode.type_,
            vnode.props_
        );
    }

    linkNativeNodeWithVNode(vnode, nativeNode);
    if (true) {
        attachVNodeToNativeNode(nativeNode, vnode);
    }
}

function rehydrateView(newVNode, oldVNode) {
    newVNode.namespace_ = _determineNS(newVNode);

    // Do nothing more with fragments
    if (_isDry(newVNode.type_)) {
        return;
    }

    // Reuse the existing native node
    linkNativeNodeWithVNode(newVNode, oldVNode.nativeNode_);
    if (true) {
        attachVNodeToNativeNode(oldVNode.nativeNode_, newVNode);
    }

    if (newVNode.type_ === TextNode) {
        updateNativeTextContent(
            newVNode.nativeNode_,
            newVNode.props_
        );
        
        // In the production mode, remove text content from the virtual text node
        // to save memory. Later, we will compare the new text with the text content
        // of the native node, though it is not a perfect way to compare.
        if (!true) {
            newVNode.props_ = null;
        }
    } else {
        updateNativeElementAttributes(
            newVNode.nativeNode_,
            newVNode.props_,
            oldVNode.props_
        );
    }
}

// We only support HTML and SVG namespaces
// as the most of browsers support
function _determineNS(vnode) {
    // Intrinsic namespace
    if (vnode.type_ === 'svg') {
        return NAMESPACE_SVG;
    }

    // As we never hydrate the container node,
    // the parent_ never empty here
    if (vnode.parent_.namespace_ === NAMESPACE_SVG &&
        vnode.parent_.type_ === 'foreignObject'
    ) {
        return NAMESPACE_HTML;
    }

    // By default, pass namespace below.
    return vnode.parent_.namespace_;
}

// Check if a node type cannot be hydrated
function _isDry(type) {
    return type === Fragment || isFunction(type);
}

// Important!!!
// This module does not handle Portal nodes

function updateView(newVNode, oldVNode) {
    rehydrateView(newVNode, oldVNode);

    if (newVNode.nativeNode_ !== null) {
        const mpt = resolveMountingPoint(newVNode.parent_);
        if (mpt !== null) {
            mpt.mountingRef_ = newVNode.nativeNode_;
        }
    }
}

function insertView(vnode) {
    if (vnode.nativeNode_ !== null) {
        const mpt = resolveMountingPoint(vnode.parent_);
        if (mpt !== null) {
            insertNativeNodeAfter(mpt.nativeNode_, vnode.nativeNode_, mpt.mountingRef_);
            mpt.mountingRef_ = vnode.nativeNode_;
        }
    }
}

function deleteView(vnode) {
    if (vnode.nativeNode_ !== null) {
        removeNativeNode(vnode.nativeNode_);
    } else {
        walkNativeChildren(removeNativeNode, vnode);
    }
}

let currentVNode = null;
let currentRefHook = null;
let currentStateHook = null;
let currentEffectHook = null;

function prepareCurrentlyProcessing(functionalVNode) {
    currentVNode = functionalVNode;
}

function flushCurrentlyProcessing() {
    currentVNode = null;
    currentRefHook = null;
    currentStateHook = null;
    currentEffectHook = null;
}

function resolveCurrentRefHook(createHookFn, processFn) {
    _throwIfCallInvalid();
    currentRefHook = _resolveCurrentHookImpl(createHookFn, currentRefHook, currentVNode.refHook_);
    if (currentVNode.refHook_ === null) {
        currentVNode.refHook_ = currentRefHook;
    }
    return processFn(currentRefHook);
}

function resolveCurrentStateHook(createHookFn, processFn) {
    _throwIfCallInvalid();
    currentStateHook = _resolveCurrentHookImpl(createHookFn, currentStateHook, currentVNode.stateHook_);
    if (currentVNode.stateHook_ === null) {
        currentVNode.stateHook_ = currentStateHook;
    }
    return processFn(currentStateHook);
}

function resolveCurrentEffectHook(createHookFn, processFn) {
    _throwIfCallInvalid();
    currentEffectHook = _resolveCurrentHookImpl(createHookFn, currentEffectHook, currentVNode.effectHook_);
    if (currentVNode.effectHook_ === null) {
        currentVNode.effectHook_ = currentEffectHook;
    }
    return processFn(currentEffectHook);
}

function _resolveCurrentHookImpl(createHookFn, currentHook, firstHookOfNode) {
    if (currentHook === null) {
        if (firstHookOfNode === null) {
            return createHookFn(currentVNode);
        } else {
            return firstHookOfNode;
        }
    } else {
        if (currentHook.next_ === null) {
            const nextHook = createHookFn(currentVNode);
            currentHook.next_ = nextHook;
            return nextHook;
        } else {
            return currentHook.next_;
        }
    }
}

function _throwIfCallInvalid() {
    if (currentVNode === null) {
        throw new Error('Cannot use hooks from outside of components');
    }
}

const STATE_NORMAL = 0;
const STATE_ERROR = 1;

/**
 *
 * @param {number} tag
 * @param {any} initialValue
 * @param {VNode} context
 * @constructor
 */
function StateHook(tag, initialValue, context) {
    this.tag_ = tag;
    this.value_ = initialValue;
    this.setValue_ = _setState.bind(this);
    this.context_ = context;
    this.next_ = null;
}

function useState(initialValue) {
    return resolveCurrentStateHook(
        function (currentNode) {
            return new StateHook(STATE_NORMAL, initialValue, currentNode);
        },
        function (currentHook) {
            return [currentHook.value_, currentHook.setValue_];
        }
    );
}

function useError() {
    return resolveCurrentStateHook(
        function (currentNode) {
            // Make sure we have only one error hook in a component
            if (true) {
                let hook = currentNode.stateHook_;
                while (hook !== null) {
                    if (hook.tag_ === STATE_ERROR) {
                        console.error('A component accepts only one useError hook');
                    }
                    hook = hook.next_;
                }
            }
            return new StateHook(STATE_ERROR, null, currentNode);
        },
        function (currentHook) {
            return [currentHook.value_, function () {
                currentHook.setValue_(null);
            }];
        }
    );
}

const pendingUpdates = new Map();
let currentTimeoutId = null;

function _setState(value) {
    let newValue;

    if (isFunction(value)) {
        try {
            newValue = value(this.value_);
        } catch (error) {
            catchError(error, this.context_);
            return;
        }
    } else {
        newValue = value;
    }

    if (this.value_ !== newValue) {
        // Set value synchronously
        this.value_ = newValue;

        // Enqueue update
        // We store the hook itself with the purpose of referring to
        // the up-to-date context when flushing updates.
        // So, we don't need to store all pending hooks inside a context.
        pendingUpdates.set(this.context_, this);

        // Reset timer
        if (currentTimeoutId !== null) {
            clearTimeout(currentTimeoutId);
        }
        currentTimeoutId = setTimeout(_flushUpdates);
    }
}

function _flushUpdates() {
    // Clear timeout ID to prepare for new state settings
    // happened in the renderTree (inside setLayoutEffect)
    currentTimeoutId = null;

    // Copy the hooks and clear pending updates
    // to prepare for new state settings
    const hooksAsRefs = [];

    // Important!!!
    // Do NOT copy hook.context_ here as they
    // can be outdated during the reconciliation process
    pendingUpdates.forEach(function (hook, mayBeOutdatedContext) {
        hooksAsRefs.push(hook);
    });
    pendingUpdates.clear();
    
    // Re-render trees
    for (let i = 0; i < hooksAsRefs.length; ++i) {
        renderTree(hooksAsRefs[i].context_);
    }
}

function catchError(error, vnode) {
    let parent = vnode.parent_;
    let hook;

    while (parent !== null) {
        hook = parent.stateHook_;
        while (hook !== null) {
            if (hook.tag_ === STATE_ERROR) {
                hook.setValue_(function (prevError) {
                    return prevError || error;
                });
                return;
            }
            hook = hook.next_;
        }
        parent = parent.parent_;
    }

    if (true) {
        console.info('You can catch the following error by implementing an error boundary with the useError hook');
    }

    throw error;
}

const EFFECT_NORMAL = 0;
const EFFECT_LAYOUT = 1;

/**
 *
 * @param {number} tag
 * @param {function} callback
 * @param {[]|null} deps
 * @constructor
 */
function EffectHook(tag, callback, deps) {
    this.tag_ = tag;
    this.callback_ = callback;
    this.deps_ = deps;
    this.destroy_ = null;
    this.lastDeps_ = null;
    this.lastDestroy_ = null;
    this.next_ = null;
}

function useEffect(callback, deps) {
    return _useEffectImpl(EFFECT_NORMAL, callback, deps);
}

function useLayoutEffect(callback, deps) {
    return _useEffectImpl(EFFECT_LAYOUT, callback, deps);
}

function _useEffectImpl(tag, callback, deps) {
    if (deps === undefined) {
        deps = null;
    }

    return resolveCurrentEffectHook(
        function (currentNode) {
            return new EffectHook(tag, callback, deps);
        },
        function (currentHook) {
            if (true) {
                if (!(
                    deps === null && currentHook.deps_ === null ||
                    deps.length === currentHook.deps_.length
                )) {
                    throw new Error('Deps must be size-fixed');
                }
                // On the production, we accept the deps change its length
                // and consider it is changed
            }

            currentHook.callback_ = callback;
            currentHook.deps_ = deps;
        }
    );
}

/**
 *
 * @param {number} effectTag
 * @param {VNode} vnode
 * @param {boolean} isNewlyMounted
 */
function mountEffects(effectTag, vnode, isNewlyMounted) {
    let hook = vnode.effectHook_;
    while (hook !== null) {
        if (hook.tag_ === effectTag) {
            if (isNewlyMounted || _mismatchDeps(hook.deps_, hook.lastDeps_)) {
                try {
                    _mountEffect(hook);
                } catch (error) {
                    catchError(error, vnode);
                }
            }
        }
        hook = hook.next_;
    }
}

/**
 * @param {number} effectTag
 * @param {VNode} vnode
 * @param {boolean} isUnmounted
 */
function destroyEffects(effectTag, vnode, isUnmounted) {
    let hook = vnode.effectHook_;
    while (hook !== null) {
        if (hook.tag_ === effectTag) {
            if (hook.lastDestroy_ !== null || hook.destroy_ !== null) {
                if (isUnmounted || _mismatchDeps(hook.deps_, hook.lastDeps_)) {
                    try {
                        _destroyEffect(hook, isUnmounted);
                    } catch (error) {
                        catchError(error, vnode);
                    }
                }
            }
        }
        hook = hook.next_;
    }
}

/**
 *
 * @param {EffectHook} hook
 */
function _mountEffect(hook) {
    // Save the last ones for the next time
    hook.lastDeps_ = hook.deps_;
    hook.lastDestroy_ = hook.destroy_;
    
    // Run effect callback
    hook.destroy_ = hook.callback_();
    if (hook.destroy_ === undefined) {
        hook.destroy_ = null;
    }
}

/**
 *
 * @param {EffectHook} hook
 * @param {boolean} isUnmounted
 */
function _destroyEffect(hook, isUnmounted) {
    if (hook.lastDestroy_ !== null && !isUnmounted) {
        hook.lastDestroy_();
        return;
    }

    if (hook.destroy_ !== null) {
        hook.destroy_();
    }
}

/**
 * 
 * @param {[]|null} deps 
 * @param {[]|null} lastDeps 
 * @returns {boolean}
 */
function _mismatchDeps(deps, lastDeps) {
    // Always
    if (deps === null) {
        return true;
    }

    // Lazy
    if (deps.length === 0) {
        return false;
    }

    // Deps
    // 1. When init effect
    if (lastDeps === null) {
        return false;
    }
    // 2. Two arrays are equal
    if (compareArrays(deps, lastDeps)) {
        return false;
    }

    // DepsChanged
    {
        return true;
    }
}

/**
 *
 * @param {any} current
 * @constructor
 */
 function Ref(current) {
    this.current = current;
}

/**
 *
 * @param {any} current
 * @constructor
 */
function RefHook(current) {
    this.ref_ = new Ref(current);
    this.next_ = null;
}

/**
 *
 * @param {any} initialValue
 */
function useRef(initialValue) {
    return resolveCurrentRefHook(
        function (currentNode) {
            return new RefHook(initialValue);
        },
        function (currentHook) {
            return currentHook.ref_;
        }
    );
}

/**
 *
 * @param {any} initialValue
 */
function createRef(initialValue) {
    return new Ref(initialValue);
}

// Use the same empty object to save memory
// Do NOT mutate it
const emptyProps = {};

/**
 *
 * @param {any} content
 * @return {null|VNode}
 */
 function createVNodeFromContent(content) {
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
                if (isFunction(type)) ; else {
                    ref = props.ref;
                    delete props.ref;
                }
            } else {
                if (true) {
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

function reconcileChildren(current, isRenderRoot) {
    if (isFunction(current.type_)) {
        _reconcileChildOfDynamicNode(current, current.alternate_, isRenderRoot);
    } else if (current.alternate_ !== null) {
        _reconcileChildrenOfStaticNode(current, current.alternate_);
    }
}

function _reconcileChildOfDynamicNode(current, alternate, isRenderRoot) {
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
    }

    let newContent;
    prepareCurrentlyProcessing(current);
    try {
        newContent = current.type_(current.props_);
    } catch (error) {
        catchError(error, current);
        newContent = null;
    }
    flushCurrentlyProcessing();

    const newChild = createVNodeFromContent(newContent);
    
    if (newChild !== null) {
        newChild.parent_ = current;
        
        // Don't need to set the slot property
        // as a dynamic node can have only one child
    }

    const oldChild = isRenderRoot ? current.child_ : (
        alternate !== null ? alternate.child_ : null
    );
    
    if (oldChild !== null) {
        if (newChild !== null && newChild.type_ === oldChild.type_ && newChild.key_ === oldChild.key_) {
            _markAlternate(newChild, oldChild);
        } else {
            _addDeletion(current, oldChild);
        }
    }
    
    current.child_ = newChild;
}

function _reconcileChildrenOfStaticNode(current, alternate) {
    const oldChildren = _mapChildren(alternate);
    const newChildren = _mapChildren(current);

    let newChild;
    oldChildren.forEach(function (oldChild, mapKey) {
        newChild = newChildren.get(mapKey);
        if (newChild !== undefined && newChild.type_ === oldChild.type_) {
            _markAlternate(newChild, oldChild);
        } else {
            _addDeletion(current, oldChild);
        }
    });
}

function _markAlternate(newChild, oldChild) {
    newChild.alternate_ = oldChild;
}

function _addDeletion(current, childToDelete) {
    if (current.deletions_ === null) {
        current.deletions_ = [childToDelete];
    } else {
        current.deletions_.push(childToDelete);
    }
}

function _mapChildren(node) {
    const map = new Map();
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
}

function renderTree(current) {
    const effectMountNodes = new Map();
    const effectDestroyNodes = new Map();
    
    // The mounting point of the current
    const mpt = resolveMountingPoint(current);

    // In the tree, the mounting point lies at a higher level
    // than the current, so we need to initialize/cleanup
    // its temporary properties from outside of the work loop
    walkNativeChildren(function (nativeChild) {
        mpt.mountingRef_ = nativeChild;
    }, mpt, current);

    // Main work
    _workLoop(
        _performUnitOfWork, _onReturn, current,
        effectMountNodes, effectDestroyNodes
    );
    
    // Cleanup
    mpt.mountingRef_ = null;

    // Layout effects
    effectDestroyNodes.forEach(function (isUnmounted, vnode) {
        destroyEffects(EFFECT_LAYOUT, vnode, isUnmounted);
    });
    effectMountNodes.forEach(function (isNewlyMounted, vnode) {
        mountEffects(EFFECT_LAYOUT, vnode, isNewlyMounted);
    });

    // Effects
    setTimeout(function () {
        effectDestroyNodes.forEach(function (isUnmounted, vnode) {
            destroyEffects(EFFECT_NORMAL, vnode, isUnmounted);
        });
        effectMountNodes.forEach(function (isNewlyMounted, vnode) {
            mountEffects(EFFECT_NORMAL, vnode, isNewlyMounted);
        });
    });
}

// Optimize insertion to reduce reflow number
const INSERT_ON_RETURN = 0;
const INSERT_OFFSCREEN = 1;

function _performUnitOfWork(current, root, effectMountNodes, effectDestroyNodes) {
    const isRenderRoot = current === root;
    
    // Reconcile current's children
    reconcileChildren(current, isRenderRoot);

    // Portal nodes never change the view itself
    if (current.type_ !== Portal) {
        if (isRenderRoot) {
            if (current.effectHook_ !== null) {
                effectDestroyNodes.set(current, false);
                effectMountNodes.set(current, false);
            }
        } else {
            if (current.alternate_ !== null) {
                updateView(current, current.alternate_);
                if (current.effectHook_ !== null) {
                    effectDestroyNodes.set(current.alternate_, false);
                    effectMountNodes.set(current, false);
                }
                current.alternate_ = null;
            } else {
                hydrateView(current);
                if (current.child_ !== null) {
                    // We always have parent here, because
                    // this area is under the render root
                    if (current.parent_.insertion_ !== null) {
                        current.insertion_ = INSERT_OFFSCREEN;
                        insertView(current);
                    } else {
                        // Insert-on-return nodes must have a native node!
                        if (current.nativeNode_ !== null) {
                            current.insertion_ = INSERT_ON_RETURN;
                        }
                    }
                } else {
                    insertView(current);
                }
                if (current.effectHook_ !== null) {
                    effectMountNodes.set(current, true);
                }
            }
        }
    }
    
    // Delete subtrees that no longer exist
    if (current.deletions_ !== null) {
        for (let i = 0; i < current.deletions_.length; ++i) {
            deleteView(current.deletions_[i]);
            _workLoop(function (node) {
                if (node.effectHook_ !== null) {
                    effectDestroyNodes.set(node, true);
                }
            }, null, current.deletions_[i]);
        }
        current.deletions_ = null;
    }
}

// Callback called after walking through a node and all of its ascendants
function _onReturn(current) {
    // Process the insert-on-return node before walk out of its subtree
    if (current.insertion_ === INSERT_ON_RETURN) {
        insertView(current);
    }

    // This is when we cleanup the remaining temporary properties
    current.mountingRef_ = null;
    current.insertion_ = null;
}

// Reference: https://github.com/facebook/react/issues/7942
function _workLoop(performUnit, onReturn, root, D0, D1) {
    let current = root;
    while (true) {
        performUnit(current, root, D0, D1);
        if (current.child_ !== null) {
            current = current.child_;
            continue;
        }
        if (current === root) {
            return;
        }
        while (current.sibling_ === null) {
            if (current.parent_ === null || current.parent_ === root) {
                return;
            }
            current = current.parent_;
            if (onReturn !== null) {
                onReturn(current);
            }
        }
        current = current.sibling_;
    }
}

/**
 * 
 * @param {any} children 
 * @param {Element} targetNativeNode
 */
 function render(children, targetNativeNode) {
    const portal = createPortal(children, targetNativeNode);

    renderTree(portal);
}

/**
 * 
 * @param {any} children 
 * @param {Element} targetNativeNode
 * @returns {VNode}
 */
function createPortal(children, targetNativeNode) {
    /**
     * @type {VNode}
     */
    let portal;

    if (!(portal = extractVNodeFromNativeNode(targetNativeNode))) {
        if (true) {
            if (targetNativeNode.firstChild) {
                console.error('Target node must be empty');
            }
        }
        
        portal = new VNode(Portal, {});

        // Determine the namespace (we only support SVG and HTML namespaces)
        portal.namespace_ = ('ownerSVGElement' in targetNativeNode) ? NAMESPACE_SVG : NAMESPACE_HTML;
        
        linkNativeNodeWithVNode(portal, targetNativeNode);
        attachVNodeToNativeNode(targetNativeNode, portal);
    }

    portal.props_.children = children;

    return portal;
}

export { Fragment, TextNode, createElement, createPortal, createRef, createElement as jsx, render, useEffect, useError, useLayoutEffect, useRef, useState };
