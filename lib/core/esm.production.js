let scheduleTimeout = setTimeout;

let cancelTimeout = clearTimeout;

let hasOwnProperty = Object.prototype.hasOwnProperty;

let slice = Array.prototype.slice;

let isString = (value) => {
    return typeof value === 'string';
};

let isNumber = (value) => {
    return typeof value === 'number';
};

let isFunction = (value) => {
    return typeof value === 'function';
};

let isArray = (value) => {
    return value instanceof Array;
};

/**
 * Object.is equivalence.
 * https://github.com/facebook/fbjs/blob/main/packages/fbjs/src/core/shallowEqual.js#L22
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 * 
 * @param {any} x 
 * @param {any} y 
 * @returns {boolean}
 */
 let theSame = (x, y) => {
    // SameValue algorithm
    if (x === y) {
        // +0 != -0
        return x !== 0 || 1 / x === 1 / y;
    } else {
        // NaN == NaN
        return x !== x && y !== y;
    }
};

/**
 * 
 * @param {{}} A 
 * @param {{}} B 
 * @returns {boolean}
 */
let objectsShallowEqual = (A, B) => {
    if (A === B) {
        return true;
    }
    let kA = Object.keys(A);
    let kB = Object.keys(B);
    if (kA.length !== kB.length) {
        return false;
    }
    for (let k, i = kA.length - 1; i >= 0; --i) {
        k = kA[i];
        if (!(
            hasOwnProperty.call(B, k) &&
            theSame(A[k], B[k])
        )) {
            return false;
        }
    }
    return true;
};

/**
 * 
 * @param {[]} A
 * @param {[]} B 
 * @returns {boolean}
 */
 let arraysShallowEqual = (A, B) => {
    if (A === B) {
        return true;
    }
    if (A.length !== B.length) {
        return false;
    }
    for (let i = A.length - 1; i >= 0; --i) {
        if (!theSame(A[i], B[i])) {
            return false;
        }
    }
    return true;
};

// Do not support namespace MathML as almost browsers do not support as well
const NAMESPACE_HTML = 0;
const NAMESPACE_SVG = 1;

// Special node types
const Fragment = '[';
const Text = '#';
const Portal = (props) => {
    return props.children;
};

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
    
    /**
     * The previous version of this node
     * 
     * @type {VNode|null}
     */
    this.alternate_ = null;

    /**
     * The children (and their subtrees, of course) are marked to be deleted
     * 
     * @type {VNode[]|null}
     */
    this.deletions_ = null;

    /**
     * Insertion flag.
     * To be used to optimize the painting process
     * 
     * @type {number|null}
     */
    this.insertion_ = null;
 
    /**
     * If this node is a mounting point, this property tracks the native child
     * that will be used as the reference node to insert the new child after it
     *
     * @type {Node|null}
     */
    this.mountingRef_ = null;

    /**
     * Timeout ID.
     * After updating states, we need to re-render the subtree to display the up-to-date UI.
     * But when we batching updates, we use this property to re-render only highest node
     * which also needs re-rendering
     * 
     * @type {number|null}
     */
    this.updateId_ = null;
}

const PROP_VNODE = '%vnode';

/**
 * 
 * @param {Node} nativeNode 
 * @param {VNode} vnode 
 */
let attachVNodeToNativeNode = (nativeNode, vnode) => {
    nativeNode[PROP_VNODE] = vnode;
};

/**
 * 
 * @param {Node} nativeNode 
 * @returns {VNode|undefined}
 */
let extractVNodeFromNativeNode = (nativeNode) => {
    return nativeNode[PROP_VNODE];
};

/**
 * 
 * @param {VNode} vnode 
 * @param {Node} nativeNode
 */
let linkNativeNodeWithVNode = (vnode, nativeNode) => {
    vnode.nativeNode_ = nativeNode;

    if (vnode.ref_ !== null) {
        vnode.ref_.current = nativeNode;
    }
};

/**
 * 
 * @param {any} content 
 * @param {Element} nativeNode
 * @constructor
 */
function PortalElement(content, nativeNode) {
    this.content_ = content;
    this.nativeNode_ = nativeNode;
}

/**
 * 
 * @param {any} content 
 * @param {Element} nativeNode 
 * @returns {PortalElement}
 */
let createPortal = (content, nativeNode) => {
    return new PortalElement(content, nativeNode);
};

/**
 * 
 * @param {PortalElement} element
 * @returns {VNode}
 */
let createVNodeFromPortalElement = (element) => {
    let vnode = new VNode(Portal, {children: element.content_});

    // Determine the namespace (we only support SVG and HTML namespaces)
    vnode.namespace_ = ('ownerSVGElement' in element.nativeNode_) ? NAMESPACE_SVG : NAMESPACE_HTML;
    
    linkNativeNodeWithVNode(vnode, element.nativeNode_);
    
    // Do not attach the vnode to the native node,
    // Because many portals can share the same native node.

    return vnode;
};

/**
 * The mounting point is a virtual node which has a native node (not null)
 * It means that a mounting point can contains native children
 * 
 * @param {VNode} current 
 * @returns {VNode}
 */
let resolveMountingPoint = (current) => {
    while (true) {
        if (current === null) {
            return null;
        }
        if (current.nativeNode_ !== null) {
            return current;
        }
        current = current.parent_;
    }
};

/**
 * Walk through native children of a parent
 * 
 * @param {function} callback 
 * @param {VNode} parent 
 * @param {VNode?} stopBefore
 * @returns {void}
 */
let walkNativeChildren = (callback, parent, stopBefore) => {
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
};

/**
 * 
 * @param {Text} node 
 * @param {string} newText 
 * @param {string} oldText 
 */
let updateNativeTextContent = (node, newText, oldText) => {
    if (newText !== oldText) {
        node.textContent = newText;
    }
};

/**
 * 
 * @param {number} namespace 
 * @param {Element} element 
 * @param {{}} newAttributes 
 * @param {{}} oldAttributes 
 */
let updateNativeElementAttributes = (namespace, element, newAttributes, oldAttributes) => {
    _updateObjectByKVs(
        namespace, element, newAttributes, oldAttributes,
        _updateElementAttribute, _removeElementAttribute
    );
};

// #StartBlock ElementAttributes

const MANIPULATE_AS_STYLE = 1;
const MANIPULATE_AS_PROPERTY = 2;
const MANIPULATE_AS_ATTRIBUTE = 3;
const MANIPULATE_AS_PROPERTY_AND_ATTRIBUTE = 4;

/**
 * 
 * @param {number} namespace 
 * @param {Element} element 
 * @param {string} attrName 
 * @param {any} newAttrValue 
 * @param {any} oldAttrValue 
 */
let _updateElementAttribute = (namespace, element, attrName, newAttrValue, oldAttrValue) => {
    attrName = _normalizeElementAttributeName(namespace, attrName);

    if (theSame(newAttrValue, oldAttrValue)) {
        return;
    }

    let manipulation = _selectElementAttributeManipulation(
        namespace, element, attrName, newAttrValue
    );

    if (manipulation === MANIPULATE_AS_STYLE) {
        _updateStyleProperties(element[attrName], newAttrValue, oldAttrValue);
        return;
    }

    if (
        manipulation === MANIPULATE_AS_PROPERTY ||
        manipulation === MANIPULATE_AS_PROPERTY_AND_ATTRIBUTE
    ) {
        try {
            element[attrName] = newAttrValue;
        } catch (x) {
            // Property may not writable
        }
    }

    if (
        manipulation === MANIPULATE_AS_ATTRIBUTE ||
        manipulation === MANIPULATE_AS_PROPERTY_AND_ATTRIBUTE
    ) {
        if (newAttrValue === false) {
            // To represent a boolean property as false, we need to remove the attribute
            // instead of setting it as "false" (string)
            element.removeAttribute(attrName);
        } else {
            element.setAttribute(attrName, newAttrValue);
        }
    }
};

/**
 * 
 * @param {number} namespace 
 * @param {Element} element 
 * @param {string} attrName 
 * @param {any} oldAttrValue 
 */
let _removeElementAttribute = (namespace, element, attrName, oldAttrValue) => {
    attrName = _normalizeElementAttributeName(namespace, attrName);

    let manipulation = _selectElementAttributeManipulation(
        namespace, element, attrName, oldAttrValue
    );

    if (manipulation === MANIPULATE_AS_STYLE) {
        _updateStyleProperties(element[attrName], null, oldAttrValue);
        // Clean up HTML code
        element.removeAttribute(attrName);
        return;
    }

    if (
        manipulation === MANIPULATE_AS_PROPERTY ||
        manipulation === MANIPULATE_AS_PROPERTY_AND_ATTRIBUTE
    ) {
        try {
            element[attrName] = null;
        } catch (x) {
            // Property may not writable
        }
    }

    if (
        manipulation === MANIPULATE_AS_ATTRIBUTE ||
        manipulation === MANIPULATE_AS_PROPERTY_AND_ATTRIBUTE
    ) {
        element.removeAttribute(attrName);
    }
};

/**
 * This should not depend on attribute values as it may lead to different names
 * for the same attribute with the old and new values. It causes bugs when
 * updating or removing an attribute.
 * 
 * @param {number} namespace 
 * @param {string} attrName 
 * @returns {string}
 */
let _normalizeElementAttributeName = (namespace, attrName) => {
    // Normalize className to class
    if (attrName === 'className') {
        return 'class';
    }

    // Support camelcase event listener bindings
    // This way runs faster than using RegExp
    if (attrName.length >= 4 &&                                      // at least 4 chars
        attrName.charCodeAt(0) === 111 &&                            // 1st char is o
        attrName.charCodeAt(1) === 110 &&                            // 2nd char is n
        attrName.charCodeAt(2) <= 90 && attrName.charCodeAt(2) >= 65 // 3rd char is [A-Z]
    ) {
        return attrName.toLowerCase();
    }

    if (false) {
        if (namespace === NAMESPACE_SVG) {
            if (attrName === 'xlink:href' || attrName === 'xlinkHref') {
                console.error('SVG 2 removed the need for the xlink namespace, '
                    + 'so instead of xlink:href you should use href.');
            }
        }
    }

    return attrName;
};

/**
 * 
 * @param {number} namespace 
 * @param {Element} element 
 * @param {string} attrName 
 * @param {any} attrValue 
 * @returns {number}
 */
let _selectElementAttributeManipulation = (namespace, element, attrName, attrValue) => {
    if (attrName === 'style') {
        return MANIPULATE_AS_STYLE;
    }

    if (isFunction(attrValue)) {
        return MANIPULATE_AS_PROPERTY;
    }

    if (
        attrName === 'innerHTML' ||
        attrName === 'innerText' ||
        attrName === 'textContent'
    ) {
        return MANIPULATE_AS_PROPERTY;
    }

    if (namespace === NAMESPACE_HTML) {
        // Reference: https://github.com/preactjs/preact/blob/master/src/diff/props.js#L111
        if (
            attrName === 'href' ||
            attrName === 'tabIndex' ||
            attrName === 'download' ||
            attrName === 'list' ||
            attrName === 'form'
        ) {
            return MANIPULATE_AS_ATTRIBUTE;
        }

        if (attrName in element) {
            return MANIPULATE_AS_PROPERTY_AND_ATTRIBUTE;
        }
    }
    
    return MANIPULATE_AS_ATTRIBUTE;
};

// #EndBlock ElementAttributes

// #StartBlock StyleProperties

/**
 * 
 * @param {CSSStyleDeclaration} style 
 * @param {{}} newProperties 
 * @param {{}} oldProperties 
 */
let _updateStyleProperties = (style, newProperties, oldProperties) => {
    _updateObjectByKVs(
        null, style, newProperties, oldProperties,
        _updateStyleProperty, _removeStyleProperty
    );
};

let _updateStyleProperty = (_, style, propName, newPropValue) => {
    style[propName] = newPropValue;
};

let _removeStyleProperty = (_, style, propName) => {
    style[propName] = '';
};

// #EndBlock StyleProperties

/**
 * 
 * @param {number} namespace 
 * @param {object} target 
 * @param {{}} newKVs 
 * @param {{}} oldKVs 
 * @param {(namespace: number, target: object, key: string, newValue: any, oldValue?: any) => void} updateFn 
 * @param {(namespace: number, target: object, key: string, oldValue: any) => void} removeFn 
 */
let _updateObjectByKVs = (namespace, target, newKVs, oldKVs, updateFn, removeFn) => {
    let oldEmpty = oldKVs == null; // is nullish
    let newEmpty = newKVs == null; // is nullish

    let key;

    if (oldEmpty) {
        if (newEmpty) ; else {
            for (key in newKVs) {
                if (_hasOwnNonEmpty(newKVs, key)) {
                    updateFn(namespace, target, key, newKVs[key]);
                }
            }
        }
    } else if (newEmpty) {
        for (key in oldKVs) {
            if (_hasOwnNonEmpty(oldKVs, key)) {
                removeFn(namespace, target, key, oldKVs[key]);
            }
        }
    } else {
        for (key in oldKVs) {
            if (_hasOwnNonEmpty(oldKVs, key)) {
                if (_hasOwnNonEmpty(newKVs, key)) ; else {
                    removeFn(namespace, target, key, oldKVs[key]);
                }
            }
        }
        for (key in newKVs) {
            if (_hasOwnNonEmpty(newKVs, key)) {
                updateFn(namespace, target, key, newKVs[key], oldKVs[key]);
            }
        }
    }
};

/**
 * 
 * @param {object} target 
 * @param {string} prop 
 * @returns {boolean}
 */
let _hasOwnNonEmpty = (target, prop) => {
    return (
        hasOwnProperty.call(target, prop)
        && target[prop] != null // is not nulllish
    );
};

let createNativeTextNode = (text) => {
    return document.createTextNode(text);
};

let createNativeElement = (namespace, type, attributes) => {
    let element = (namespace === NAMESPACE_SVG
        ? document.createElementNS('http://www.w3.org/2000/svg', type)
        : document.createElement(type)
    );

    updateNativeElementAttributes(namespace, element, attributes);
    
    return element;
};

let removeNativeNode = (nativeNode) => {
    if (nativeNode.parentNode !== null) {
        nativeNode.parentNode.removeChild(nativeNode);
    }
};

let insertNativeNodeAfter = (parent, newChild, childBefore) => {
    parent.insertBefore(newChild, (
        childBefore !== null ? childBefore.nextSibling : parent.firstChild
    ));
};

// Important!!!
// This module does not handle Portal nodes

let hydrateView = (vnode) => {
    vnode.namespace_ = _determineNS(vnode);

    // Do nothing more with fragments
    if (_isDry(vnode.type_)) {
        return;
    }

    let nativeNode;
    if (vnode.type_ === Text) {
        nativeNode = createNativeTextNode(vnode.props_);
    } else {
        nativeNode = createNativeElement(
            vnode.namespace_,
            vnode.type_,
            vnode.props_
        );
    }

    linkNativeNodeWithVNode(vnode, nativeNode);
    if (false) {
        attachVNodeToNativeNode(nativeNode, vnode);
    }
};

let rehydrateView = (newVNode, oldVNode) => {
    newVNode.namespace_ = _determineNS(newVNode);

    // Do nothing more with fragments
    if (_isDry(newVNode.type_)) {
        return;
    }

    // Reuse the existing native node
    linkNativeNodeWithVNode(newVNode, oldVNode.nativeNode_);
    if (false) {
        attachVNodeToNativeNode(oldVNode.nativeNode_, newVNode);
    }

    if (newVNode.type_ === Text) {
        updateNativeTextContent(
            newVNode.nativeNode_,
            newVNode.props_,
            oldVNode.props_
        );
    } else {
        updateNativeElementAttributes(
            newVNode.namespace_,
            newVNode.nativeNode_,
            newVNode.props_,
            oldVNode.props_
        );
    }
};

// We only support HTML and SVG namespaces
// as the most of browsers support
let _determineNS = (vnode) => {
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
};

// Check if a node type cannot be hydrated
let _isDry = (type) => {
    return type === Fragment || isFunction(type);
};

// Important!!!
// This module does not handle Portal nodes

let insertView = (vnode) => {
    if (vnode.nativeNode_ !== null) {
        let mpt = resolveMountingPoint(vnode.parent_);
        if (mpt !== null) {
            insertNativeNodeAfter(mpt.nativeNode_, vnode.nativeNode_, mpt.mountingRef_);
            mpt.mountingRef_ = vnode.nativeNode_;
        }
    }
};

let updateView = (newVNode, oldVNode) => {
    rehydrateView(newVNode, oldVNode);
    touchView(newVNode);
};

let touchView = (vnode) => {
    if (vnode.nativeNode_ !== null) {
        let mpt = resolveMountingPoint(vnode.parent_);
        if (mpt !== null) {
            mpt.mountingRef_ = vnode.nativeNode_;
        }
    }
};

let deleteView = (vnode) => {
    if (vnode.nativeNode_ !== null) {
        removeNativeNode(vnode.nativeNode_);
    } else {
        walkNativeChildren(removeNativeNode, vnode);
    }
};

let currentVNode = null;
let currentRefHook = null;
let currentStateHook = null;
let currentEffectHook = null;

let prepareCurrentlyProcessing = (functionalVNode) => {
    currentVNode = functionalVNode;
};

let flushCurrentlyProcessing = () => {
    currentVNode = null;
    currentRefHook = null;
    currentStateHook = null;
    currentEffectHook = null;
};

let resolveRootVNode = () => {
    _throwIfCallInvalid();
    let vnode = currentVNode;
    while (vnode.parent_ !== null) {
        vnode = vnode.parent_;
    }
    return vnode;
};

let resolveCurrentRefHook = (createHookFn, processFn) => {
    _throwIfCallInvalid();
    currentRefHook = _resolveCurrentHookImpl(createHookFn, currentRefHook, currentVNode.refHook_);
    if (currentVNode.refHook_ === null) {
        currentVNode.refHook_ = currentRefHook;
    }
    return processFn(currentRefHook);
};

let resolveCurrentStateHook = (createHookFn, processFn) => {
    _throwIfCallInvalid();
    currentStateHook = _resolveCurrentHookImpl(createHookFn, currentStateHook, currentVNode.stateHook_);
    if (currentVNode.stateHook_ === null) {
        currentVNode.stateHook_ = currentStateHook;
    }
    return processFn(currentStateHook);
};

let resolveCurrentEffectHook = (createHookFn, processFn) => {
    _throwIfCallInvalid();
    currentEffectHook = _resolveCurrentHookImpl(createHookFn, currentEffectHook, currentVNode.effectHook_);
    if (currentVNode.effectHook_ === null) {
        currentVNode.effectHook_ = currentEffectHook;
    }
    return processFn(currentEffectHook);
};

let _resolveCurrentHookImpl = (createHookFn, currentHook, firstHookOfNode) => {
    if (currentHook === null) {
        if (firstHookOfNode === null) {
            return createHookFn(currentVNode);
        } else {
            return firstHookOfNode;
        }
    } else {
        if (currentHook.next_ === null) {
            let nextHook = createHookFn(currentVNode);
            currentHook.next_ = nextHook;
            return nextHook;
        } else {
            return currentHook.next_;
        }
    }
};

let _throwIfCallInvalid = () => {
    if (currentVNode === null) {
        throw new ReferenceError('Hooks can only be called inside a component.');
    }
};

const STATE_NORMAL = 0;
const STATE_ERROR = 1;

/**
 *
 * @param {number} tag
 * @param {VNode} context
 * @param {any} initialValue
 * @constructor
 */
function StateHook(tag, context, initialValue) {
    this.tag_ = tag;
    this.context_ = context;
    this.value_ = isFunction(initialValue) ? initialValue() : initialValue;
    this.setValue_ = _setState.bind(this);
    if (tag === STATE_ERROR) {
        this.resetValue_ = () => _setState.call(this, initialValue);
    }
    this.next_ = null;
}

let useState = (initialValue) => {
    return resolveCurrentStateHook(
        (currentVNode) => {
            return new StateHook(STATE_NORMAL, currentVNode, initialValue);
        },
        (currentHook) => {
            return [currentHook.value_, currentHook.setValue_];
        }
    );
};

let useCatch = () => {
    return resolveCurrentStateHook(
        (currentVNode) => {
            // Make sure we have only one error hook in a component
            if (false) {
                let hook = currentVNode.stateHook_;
                while (hook !== null) {
                    if (hook.tag_ === STATE_ERROR) {
                        console.error('A component accepts only one useCatch hook.');
                    }
                    hook = hook.next_;
                }
            }
            return new StateHook(STATE_ERROR, currentVNode, null);
        },
        (currentHook) => {
            return [currentHook.value_, currentHook.resetValue_];
        }
    );
};

let _setState = function (value) {
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

    if (!theSame(this.value_, newValue)) {
        // Set value synchronously
        this.value_ = newValue;

        // Schedule a work to update the UI
        this.context_.updateId_ = scheduleTimeout(_flushUpdates, 0, this);
    }
};

let _flushUpdates = (hook) => {
    // Find the highest node also has pending updates
    let highestContext = null;
    let current = hook.context_;
    while (current !== null) {
        if (current.updateId_ !== null) {
            highestContext = current;
        }
        current = current.parent_;
    }

    // Re-render tree from the highest node
    if (highestContext !== null) {
        renderTree(highestContext);
    }
};

let catchError = (error, vnode) => {
    let parent = vnode.parent_;
    let hook;

    while (parent !== null) {
        hook = parent.stateHook_;
        while (hook !== null) {
            if (hook.tag_ === STATE_ERROR) {
                // Throw the error asynchorously
                // to avoid blocking effect callbacks
                scheduleTimeout(() => {
                    hook.setValue_((prevError) => {
                        if (prevError != null) {
                            return prevError;
                        }
                        if (error != null) {
                            return error;
                        }
                        // If a nullish (null or undefined) is catched,
                        // null will be returned
                        return null;
                    });
                });

                // It is done here
                return;
            }
            hook = hook.next_;
        }
        parent = parent.parent_;
    }

    if (false) {
        console.info('Let\'s try to implement an error boundary with useCatch hook to provide a better user experience.');
    }

    throw error;
};

/**
 * 
 * @param {[]|undefined} deps 
 * @param {[]|undefined} prevDeps 
 * @returns {boolean}
 */
 let depsMismatch = (deps, prevDeps) => {
    // Always
    if (deps === undefined) {
        return true;
    }
    
    // First time
    if (prevDeps === undefined) {
        return true;
    }

    // Lazy
    if (deps.length === 0) {
        return false;
    }

    // Two arrays are equal
    if (arraysShallowEqual(deps, prevDeps)) {
        return false;
    }

    // Deps changed
    {
        return true;
    }
};

/**
 * 
 * @param {[]|undefined} deps 
 * @param {[]|undefined} prevDeps 
 * @returns {boolean}
 */
let warnIfDepsSizeChangedOnDEV = (deps, prevDeps) => {
    if (false) {
        if (!(
            deps === undefined && prevDeps === undefined ||
            deps !== undefined && prevDeps === undefined ||
            deps !== undefined && prevDeps !== undefined && deps.length === prevDeps.length
        )) {
            console.error('The number of dependencies must be the same between renders.');
        }
        // On the production, we accept the deps change its length
        // and consider it is changed
    }
};

const EFFECT_NORMAL = 0;
const EFFECT_LAYOUT = 1;

/**
 *
 * @param {number} tag
 * @constructor
 */
function EffectHook(tag) {
    this.tag_ = tag;
    this.mount_ = undefined;
    this.deps_ = undefined;
    this.destroy_ = undefined;
    this.prevDeps_ = undefined;
    this.next_ = null;
}

let useEffect = (mount, deps) => {
    return _useEffectImpl(EFFECT_NORMAL, mount, deps);
};

let useLayoutEffect = (mount, deps) => {
    return _useEffectImpl(EFFECT_LAYOUT, mount, deps);
};

let _useEffectImpl = (tag, mount, deps) => {
    return resolveCurrentEffectHook(
        (currentVNode) => {
            return new EffectHook(tag);
        },
        (currentHook) => {
            warnIfDepsSizeChangedOnDEV(deps, currentHook.deps_);
            
            currentHook.mount_ = mount;
            currentHook.deps_ = deps;
        }
    );
};

/**
 *
 * @param {number} effectTag
 * @param {VNode} vnode
 * @param {boolean} isNewlyMounted
 */
let mountEffects = (effectTag, vnode, isNewlyMounted) => {
    let hook = vnode.effectHook_;
    while (hook !== null) {
        if (
            hook.tag_ === effectTag &&
        
            // The mount callback can be undefined here if there is an action
            // in the rendering stack leads to an synchronous update request.
            // That update will be performed before the callback of the useEffect,
            // then schedule another call for the same callback
            hook.mount_ !== undefined &&

            // Should it mounts at this render?
            (isNewlyMounted || depsMismatch(hook.deps_, hook.prevDeps_))
        ) {
            // Update the previous deps
            hook.prevDeps_ = hook.deps_;
            
            // Run the effect mount callback
            try {
                hook.destroy_ = hook.mount_();
            } catch (error) {
                catchError(error, vnode);
            }

            // Do NOT clear hook.mount_ and hook.deps_ (to avoid duplicated calls, for instance).
            // There is a case, the effect mount/destroy can be called without
            // a component re-rendering which re-initializes the hooks.
            // TODO: Add tests for this case
        }
        hook = hook.next_;
    }
};

/**
 * @param {number} effectTag
 * @param {VNode} vnode
 * @param {boolean} isUnmounted
 */
let destroyEffects = (effectTag, vnode, isUnmounted) => {
    let hook = vnode.effectHook_;
    while (hook !== null) {
        if (
            hook.tag_ === effectTag &&
        
            // Check if the effect has a destroy callback
            hook.destroy_ !== undefined &&

            // Should it destroys at this render?
            (isUnmounted || depsMismatch(hook.deps_, hook.prevDeps_))
        ) {
            // Run the effect destroy callback
            try {
                hook.destroy_();
            } catch (error) {
                catchError(error, vnode);
            }

            // Clear the destroy callback to avoid duplicated calls,
            // even if the call throws an error.
            // Whenever the mount is called, the destroy will be re-initialized.
            // TODO: Add tests for this case
            hook.destroy_ = undefined;
        }
        hook = hook.next_;
    }
};

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
let createRef = (initialValue) => {
    return new Ref(initialValue);
};

/**
 *
 * @param {any} initialValue
 */
let useRef = (initialValue) => {
    return resolveCurrentRefHook(
        (currentVNode) => {
            return new RefHook(initialValue);
        },
        (currentHook) => {
            return currentHook.ref_;
        }
    );
};

/**
 * 
 * @param {VNode} current
 * @param {any[]} content
 */
let setChildrenFromContent = (current, content) => {
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
};

/**
 * 
 * @param {VNode} current 
 * @param {any} content
 */
let setOnlyChildFromContent = (current, content) => {
    let child = createVNodeFromContent(content);
    if (child !== null) {
        current.child_ = child;
        child.parent_ = current;

        // Don't need to set the slot property
        // as this node have only one child
    }
};

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
let createElement = function (type, props, content) {
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
let createVNodeFromJSXElement = (element) => {
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
                props = Object.assign({}, props);
                props.children = content;
            }
            Object.freeze(props);
        } else {
            if (props.ref !== undefined) {
                if (props.ref instanceof Ref) {
                    ref = props.ref;
                } else {
                    if (false) {
                        console.error('The value of the ref property is invalid:', props.ref);
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
        if (isFunctionalType) ; else if (type === Text) {
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

/**
 *
 * @param {any} content
 * @return {VNode|null}
 */
let createVNodeFromContent = (content) => {
    if (content instanceof JSXElement) {
        return createVNodeFromJSXElement(content);
    }

    if (isString(content)) {
        return new VNode(Text, content);
    }

    if (isNumber(content)) {
        return new VNode(Text, '' + content);
    }

    if (isArray(content)) {
        let fragment = new VNode(Fragment, null);
        setChildrenFromContent(fragment, content);
        return fragment;
    }

    if (content instanceof PortalElement) {
        return createVNodeFromPortalElement(content);
    }

    return null;
};

let reconcileChildren = (current, isRenderRoot) => {
    if (isFunction(current.type_)) {
        _reconcileOnlyChildOfDynamicNode(current, current.alternate_, isRenderRoot);
    } else if (current.alternate_ !== null) {
        _reconcileChildrenOfStaticNode(current, current.alternate_);
    }
};

let _reconcileOnlyChildOfDynamicNode = (current, alternate, isRenderRoot) => {
    // If the current has an alternate
    // Important note: The alternate of the render root always is null
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

        // Transfer the update ID
        current.updateId_ = alternate.updateId_;
        // We must reset alternate's update ID to null.
        // There is a case, a node in the deleted subtree later updates its state
        // then the update batching logic looks at higher-order nodes, if there is any
        // one of them also wants to update, by checking if its update ID is not null.
        // The update will be triggered from the highest one found
        alternate.updateId_ = null;

        // Pure components:
        // If props did not change, and this reconciliation is caused by
        // the current itself updating or being marked to be updated (with updateId_),
        // but by an updating from a higher-level node, so it should NOT re-render
        if (
            // A render root never appears here because its alternate always is null
            // so don't need to check if the current is not a render root

            // Do not skip re-render if there is an update scheduled
            current.updateId_ === null &&

            // Compare current props vs previous props
            // Here, props always is an object with a functional component
            objectsShallowEqual(current.props_, alternate.props_)
        ) {
            // Reuse the child if needed
            if (current.child_ === null) {
                if (alternate.child_ === null) ; else {
                    // Reuse the previous child
                    current.child_ = alternate.child_;
                    current.child_.parent_ = current;

                    // This is unnecessary but added to keep
                    // the data structure always being correct
                    alternate.child_ = null;
                }
            }

            // Make itself the alternate to denote that it did not change,
            // so the next process will skip walking deeper in its children
            current.alternate_ = current;

            // Finish this reconciliation
            return;
        }
    }

    let newContent;
    prepareCurrentlyProcessing(current);
    try {
        newContent = current.type_(current.props_);
        flushCurrentlyProcessing();
    } catch (error) {
        newContent = null;
        // Must flush currently processing info before catchError(),
        // because catchError() may cause re-render at a higher level component
        flushCurrentlyProcessing();
        catchError(error, current);
    }

    let newChild = createVNodeFromContent(newContent);
    
    if (newChild !== null) {
        newChild.parent_ = current;
        
        // Don't need to set the slot property
        // as a dynamic node can have only one child
    }

    let oldChild = isRenderRoot ? current.child_ : (
        alternate !== null ? alternate.child_ : null
    );
    
    if (oldChild !== null) {
        if (newChild !== null &&
            newChild.type_ === oldChild.type_ &&
            newChild.key_ === oldChild.key_
        ) {
            newChild.alternate_ = oldChild;
        } else {
            _addDeletion(current, oldChild);
        }
    }
    
    current.child_ = newChild;
};

let _reconcileChildrenOfStaticNode = (current, alternate) => {
    let oldChildren = _mapChildren(alternate);
    let newChildren = _mapChildren(current);

    let newChild;
    oldChildren.forEach((oldChild, mapKey) => {
        newChild = newChildren.get(mapKey);
        if (newChild !== undefined &&
            newChild.type_ === oldChild.type_
        ) {
            newChild.alternate_ = oldChild;
        } else {
            _addDeletion(current, oldChild);
        }
    });
};

let _addDeletion = (current, childToDelete) => {
    if (current.deletions_ === null) {
        current.deletions_ = [childToDelete];
    } else {
        current.deletions_.push(childToDelete);
    }
};

let _mapChildren = (node) => {
    let map = new Map();
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
};

/**
 * 
 * @param {VNode} current
 */
let renderTree = (current) => {
    // Initialize an effect queue
    let effectQueue = [];

    // The mounting point of the current
    let mpt = resolveMountingPoint(current);

    // In the tree, the mounting point lies at a higher level
    // than the current, so we need to initialize/cleanup
    // its temporary properties from outside of the work loop
    walkNativeChildren((nativeChild) => {
        mpt.mountingRef_ = nativeChild;
    }, mpt, current);

    // Main work
    _workLoop(
        current, _performUnitOfWork,
        _onSkip, _onReturn, effectQueue
    );

    // Cleanup
    mpt.mountingRef_ = null;

    // Run useLayoutEffect callbacks
    runEffectQueue(EFFECT_LAYOUT, effectQueue);

    // Schedule to run useEffect callbacks
    scheduleTimeout(runEffectQueue, 0, EFFECT_NORMAL, effectQueue);
};

// Effect flags
const MOUNT_PLACEMENT = 0;
const MOUNT_UPDATE = 1;
const DESTROY_PLACEMENT = 2;
const DESTROY_UPDATE = 3;

let runEffectQueue = (effectType, effectQueue) => {
    for (let i = 0, flag; i < effectQueue.length; i += 2) {
        flag = effectQueue[i + 1];

        if (flag === MOUNT_PLACEMENT || flag === MOUNT_UPDATE) {
            mountEffects(effectType, effectQueue[i], flag === MOUNT_PLACEMENT);
        } else {
            destroyEffects(effectType, effectQueue[i], flag === DESTROY_PLACEMENT);
        }
    }
};

// Optimize the insertion to reduce the number of reflows
const INSERT_ON_RETURN = 0;
const INSERT_OFFSCREEN = 1;

/**
 * 
 * @param {VNode} current 
 * @param {VNode} root 
 * @param {Array<VNode|number>} effectQueue 
 * @returns {VNode|null} skipFrom
 */
let _performUnitOfWork = (current, root, effectQueue) => {
    let isRenderRoot = current === root;
    let isPortal = current.type_ === Portal;

    // Cleanup the update scheduled on the current node.
    // Do this before reconciliation because the current node can
    // be scheduled for another update while the reconciliation
    if (current.updateId_ !== null) {
        cancelTimeout(current.updateId_);
        current.updateId_ = null;
    }

    // Reconcile current's direct children
    reconcileChildren(current, isRenderRoot);

    // Indicate whether the work loop should skip the subtree under the current
    let skipFrom = null;

    // Portal nodes never change the view itself
    if (!isPortal) {
        if (isRenderRoot) {
            if (current.effectHook_ !== null) {
                effectQueue.push(
                    current, DESTROY_UPDATE,
                    current, MOUNT_UPDATE
                );
            }
        } else {
            if (current.alternate_ !== null) {
                if (current.alternate_ === current) {
                    // This node does not changed,
                    // so skip reconciliation for its subtree
                    skipFrom = current;
                } else {
                    updateView(current, current.alternate_);
                    if (current.effectHook_ !== null) {
                        effectQueue.push(current.alternate_, DESTROY_UPDATE);
                        effectQueue.push(current, MOUNT_UPDATE);
                    }
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
                    effectQueue.push(current, MOUNT_PLACEMENT);
                }
            }
        }
    }

    // Delete subtrees that no longer exist
    if (current.deletions_ !== null) {
        for (let i = 0; i < current.deletions_.length; ++i) {
            deleteView(current.deletions_[i]);
            _workLoop(current.deletions_[i], (deleted) => {
                if (deleted.effectHook_ !== null) {
                    effectQueue.push(deleted, DESTROY_PLACEMENT);
                }
                // Important!!!
                // Cancel the update schedule on the deleted nodes
                if (deleted.updateId_ !== null) {
                    cancelTimeout(deleted.updateId_);
                    deleted.updateId_ = null;
                }
                // Never skip any node when handling deletions
                return null;
            });
        }
        current.deletions_ = null;
    }

    return skipFrom;
};

let _onSkip = (current, root) => {
    let isRenderRoot = current === root;
    let isPortal = current.type_ === Portal;

    if (isRenderRoot || isPortal); else {
        // Though the current is skipped for reconciliation
        // but we need to update the mounting ref
        // so insertions after can work correctly
        touchView(current);
    }
};

// Callback called after walking through a node and all of its ascendants
let _onReturn = (current) => {
    // Process the insert-on-return node before walk out of its subtree
    if (current.insertion_ === INSERT_ON_RETURN) {
        insertView(current);
    }

    // This is when we cleanup the remaining temporary properties
    current.mountingRef_ = null;
    current.insertion_ = null;
};

// Reference: https://github.com/facebook/react/issues/7942
let _workLoop = (root, performUnit, onSkip, onReturn, reference) => {
    let current = root;
    let skipFrom = null;
    while (true) {
        if (skipFrom === null) {
            skipFrom = performUnit(current, root, reference);
        } else {
            if (onSkip != null) {
                onSkip(current, root);
            }
        }
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
            if (skipFrom === current) {
                skipFrom = null;
            }
            if (onReturn != null) {
                onReturn(current);
            }
        }
        current = current.sibling_;
    }
};

/**
 * 
 * @param {any} children 
 * @param {Element} targetNativeNode
 */
let render = (children, targetNativeNode) => {
    let root = extractVNodeFromNativeNode(targetNativeNode);

    if (root) {
        // Update the children
        root.props_.children = children;
    } else {
        // Create a new root
        if (false) {
            if (targetNativeNode.firstChild) {
                console.error('The target node is not empty:', targetNativeNode);
            }
        }
        let portalElement = createPortal(children, targetNativeNode);
        root = createVNodeFromPortalElement(portalElement);
        attachVNodeToNativeNode(targetNativeNode, root);
    }

    renderTree(root);
};

function Memo() {
    this.value_ = undefined;
    this.prevDeps_ = undefined;
}

let useMemo = (create, deps) => {
    let memo = useRef(new Memo()).current;
    
    warnIfDepsSizeChangedOnDEV(deps, memo.prevDeps_);

    if (depsMismatch(deps, memo.prevDeps_)) {
        memo.value_ = create();
        memo.prevDeps_ = deps;
    }

    return memo.value_;
};

let useCallback = (callback, deps) => {
    let memo = useRef(new Memo()).current;

    warnIfDepsSizeChangedOnDEV(deps, memo.prevDeps_);

    if (depsMismatch(deps, memo.prevDeps_)) {
        memo.value_ = callback;
        memo.prevDeps_ = deps;
    }

    return memo.value_;
};

export { Fragment, Text, cancelTimeout, createElement, createPortal, createRef, createElement as jsx, render, scheduleTimeout, useCallback, useCatch, useEffect, useLayoutEffect, useMemo, useRef, useState, resolveRootVNode as useTreeId };
