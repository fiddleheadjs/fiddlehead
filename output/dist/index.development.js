'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

let currentNode = null;
let currentRefHook = null;
let currentStateHook = null;
let currentEffectHook = null;

function prepareCurrentlyProcessing(functionalVirtualNode) {
    currentNode = functionalVirtualNode;
}

function flushCurrentlyProcessing() {
    currentNode = null;
    currentRefHook = null;
    currentStateHook = null;
    currentEffectHook = null;
}

function resolveCurrentRefHook(createHookFn, processFn) {
    _throwIfCallInvalid();
    currentRefHook = _resolveCurrentHookImpl(createHookFn, currentRefHook, currentNode.refHook_);
    if (currentNode.refHook_ === null) {
        currentNode.refHook_ = currentRefHook;
    }
    return processFn(currentRefHook);
}

function resolveCurrentStateHook(createHookFn, processFn) {
    _throwIfCallInvalid();
    currentStateHook = _resolveCurrentHookImpl(createHookFn, currentStateHook, currentNode.stateHook_);
    if (currentNode.stateHook_ === null) {
        currentNode.stateHook_ = currentStateHook;
    }
    return processFn(currentStateHook);
}

function resolveCurrentEffectHook(createHookFn, processFn) {
    _throwIfCallInvalid();
    currentEffectHook = _resolveCurrentHookImpl(createHookFn, currentEffectHook, currentNode.effectHook_);
    if (currentNode.effectHook_ === null) {
        currentNode.effectHook_ = currentEffectHook;
    }
    return processFn(currentEffectHook);
}

function _resolveCurrentHookImpl(createHookFn, currentHook, firstHookOfNode) {
    if (currentHook === null) {
        if (firstHookOfNode === null) {
            return createHookFn(currentNode);
        } else {
            return firstHookOfNode;
        }
    } else {
        if (currentHook.next_ === null) {
            const nextHook = createHookFn(currentNode);
            currentHook.next_ = nextHook;
            return nextHook;
        } else {
            return currentHook.next_;
        }
    }
}

function _throwIfCallInvalid() {
    if (currentNode === null) {
        throw new Error('Cannot use hooks from outside of components');
    }
}

/**
 *
 * @param {*} current
 * @constructor
 */
 function Ref(current) {
    this.current = current;
}

/**
 *
 * @param {*} current
 * @constructor
 */
function RefHook(current) {
    this.ref_ = new Ref(current);
    this.next_ = null;
}

/**
 *
 * @param {*} initialValue
 * @constructor
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

function isObject(value) {
    return value !== null && typeof value === 'object';
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
 * @param {function|string} type
 * @param {{}} props
 * @param {string|null} key
 */
function VirtualNode(type, props, key) {
    // Identification
    // ==============

    this.type_ = type;

    // Convert to string to avoid conflict with slot
    this.key_ = key;

    this.slot_ = null;

    // Props and hooks
    // ===============

    this.props_ = props;

    this.refHook_ = null;
    
    this.stateHook_ = null;

    this.effectHook_ = null;
    
    // Output native node and relates
    // ==============================
    
    this.nativeNode_ = null;

    this.ns_ = null;

    // Linked-list pointers
    // ====================

    this.parent_ = null;
    
    this.child_ = null;

    this.sibling_ = null;

    // Temp props
    // ==========
    
    // The previous version of this node
    this.alternative_ = null;

    // The children (and their subtrees, of course) are marked to be deleted
    this.deletions_ = null;
 
    // In the commit phase, the new child will be inserted
    // after the last inserted/updated child
    this.lastManipulatedClient_ = null;
}

// Do not support namespace MathML as almost browsers do not support as well
const NS_HTML = 0;
const NS_SVG = 1;

// Special node types
const TextNode = '#';
const Fragment = '[';
function Portal(props) {
    return props.children;
}

/**
 * 
 * @param {VirtualNode} virtualNode 
 * @param {Node} nativeNode
 */
function linkNativeNode(virtualNode, nativeNode) {
    virtualNode.nativeNode_ = nativeNode;

    if (virtualNode.props_.ref !== undefined) {
        virtualNode.props_.ref.current = nativeNode;
    }
}

/**
 *
 * @param {string|function} type
 * @param {{}|null} props
 * @param {*} content
 * @return {VirtualNode}
 */
function createElement(type, props, content) {
    if (props === null) {
        props = {};
    }
    
    // Normalize key
    let key = null;
    if (!(props.key === undefined || props.key === null)) {
        key = '' + key;
    }
    delete props.key;

    // Normalize ref
    if (!(props.ref === undefined || props.ref instanceof Ref)) {
        if (true) {
            console.error('The ref value must be created by the useRef hook');
        }
        delete props.ref;
    }
    
    // Create the node
    const virtualNode = new VirtualNode(type, props, key);

    // Append children
    if (arguments.length > 2) {
        const multiple = arguments.length > 3;

        if (multiple) {
            content = slice.call(arguments, 2);
        }
    
        if (isFunction(type)) {
            // JSX children
            virtualNode.props_.children = content;
        } else if (type === TextNode) {
            // Place TextNode after Function
            // because this way is much less frequently used
            if (multiple) {
                let text = '', i = 0;
                for (; i < content.length; ++i) {
                    text += _normalizeText(content[i]);
                }
                virtualNode.props_.children = text;
            } else {
                virtualNode.props_.children = _normalizeText(content);
            }
        } else {
            // Append children directly with static nodes
            _appendChildrenFromContent(virtualNode, multiple ? content : [content]);
        }
    }

    return virtualNode;
}

/**
 *
 * @param {*} content
 * @return {null|VirtualNode}
 */
 function createVirtualNodeFromContent(content) {
    if (content instanceof VirtualNode) {
        return content;
    }
        
    if (isString(content)) {
        return new VirtualNode(TextNode, {children: content}, null);
    }

    if (isNumber(content)) {
        return new VirtualNode(TextNode, {children: '' + content}, null);
    }

    if (isArray(content)) {
        const fragment = new VirtualNode(Fragment, {}, null);
        _appendChildrenFromContent(fragment, content);
        return fragment;
    }

    return null;
}

/**
 * 
 * @param {*} text 
 * @returns {string}
 */
function _normalizeText(text) {
    if (isString(text)) {
        return text;
    }

    if (isNumber(text)) {
        return '' + text;
    }
    
    return '';
}

/**
 * 
 * @param {VirtualNode} parentNode 
 * @param {Array} content
 */
function _appendChildrenFromContent(parentNode, content) {
    for (
        let childNode, prevChildNode = null, i = 0;
        i < content.length; ++i
    ) {
        childNode = createVirtualNodeFromContent(content[i]);
        
        if (childNode !== null) {
            childNode.parent_ = parentNode;
            childNode.slot_ = i;

            if (prevChildNode !== null) {
                prevChildNode.sibling_ = childNode;
            } else {
                parentNode.child_ = childNode;
            }

            prevChildNode = childNode;
        }
    }
}

const PROP_VNODE = '%vnode';

/**
 * 
 * @param {Node} nativeNode 
 * @param {VirtualNode} virtualNode 
 */
function attachVirtualNode(nativeNode, virtualNode) {
    nativeNode[PROP_VNODE] = virtualNode;
}

/**
 * 
 * @param {Node} nativeNode 
 * @returns {VirtualNode|undefined}
 */
function extractVirtualNode(nativeNode) {
    return nativeNode[PROP_VNODE];
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
        if (!isObject(newAttrValue)) {
            newAttrValue = {};
        }
        if (!isObject(oldAttrValue)) {
            oldAttrValue = {};
        }
        _updateStyleProperties(element[attrName], newAttrValue, oldAttrValue);
        return;
    }

    if (isString(newAttrValue) || isNumber(newAttrValue)) {
        element.setAttribute(attrName, newAttrValue);
        return;
    }

    // Cases: properties, event listeners
    if (attrName in element) {
        try {
            element[attrName] = newAttrValue;
        } catch (x) {
            if (true) {
                console.error(`Property \`${attrName}\` is not writable`);
            }
        }
    }
}

function _removeElementAttribute(element, attrName, oldAttrValue) {
    attrName = _normalizeElementAttributeName(attrName);
    
    if (attrName === '') {
        return;
    }

    if (attrName === 'style') {
        if (!isObject(oldAttrValue)) {
            oldAttrValue = {};
        }
        _updateStyleProperties(element[attrName], {}, oldAttrValue);

        // Clean up HTML code
        element.removeAttribute(attrName);
        return;
    }
    
    if (isString(oldAttrValue) || isNumber(oldAttrValue)) {
        element.removeAttribute(attrName);
        return;
    }
    
    // Remove properties, event listeners
    if (attrName in element) {
        try {
            element[attrName] = null;
        } catch (x) {
            if (true) {
                console.error(`Property \`${attrName}\` is not writable`);
            }
        }
    }
}

function _normalizeElementAttributeName(attrName) {
    if (attrName === 'class') {
        if (true) {
            console.error('Use `className` instead of `class`');
        }
        return '';
    }

    if (attrName === 'className') {
        return 'class';
    }

    if (/^on[A-Z]/.test(attrName)) {
        return attrName.toLowerCase();
    }

    return attrName;
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
    let key;
    
    for (key in oldKeyValues) {
        if (_hasOwnNonEmpty(oldKeyValues, key)) {
            if (!_hasOwnNonEmpty(newKeyValues, key)) {
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

function _hasOwnNonEmpty(target, prop) {
    return (
        hasOwnProperty.call(target, prop) &&
        target[prop] !== undefined &&
        target[prop] !== null
    );
}

function createNativeTextNode(text) {
    return document.createTextNode(text);
}

function updateNativeTextNode(node, text) {
    node.textContent = text;
}

function createNativeElementWithNS(ns, type, attributes) {
    const element = (ns === NS_SVG
        ? document.createElementNS('http://www.w3.org/2000/svg', type)
        : document.createElement(type)
    );

    updateNativeElementAttributes(element, attributes, {});
    
    return element;
}

// Important!!!
// This module does not handle Portal nodes

function hydrateView(virtualNode) {
    virtualNode.ns_ = _determineNS(virtualNode);

    // Do nothing more with fragments
    if (_isDry(virtualNode.type_)) {
        return;
    }

    const nativeNode = _createNativeNode(virtualNode);

    linkNativeNode(virtualNode, nativeNode);
    if (true) {
        attachVirtualNode(nativeNode, virtualNode);
    }
}

function rehydrateView(newVirtualNode, oldVirtualNode) {
    newVirtualNode.ns_ = _determineNS(newVirtualNode);

    // Do nothing more with fragments
    if (_isDry(newVirtualNode.type_)) {
        return;
    }

    // Reuse the existing native node
    linkNativeNode(newVirtualNode, oldVirtualNode.nativeNode_);
    if (true) {
        attachVirtualNode(oldVirtualNode.nativeNode_, newVirtualNode);
    }

    if (newVirtualNode.type_ === TextNode) {
        if (newVirtualNode.props_.children !== oldVirtualNode.props_.children) {
            updateNativeTextNode(
                newVirtualNode.nativeNode_,
                newVirtualNode.props_.children
            );
        }
    } else {
        updateNativeElementAttributes(
            newVirtualNode.nativeNode_,
            newVirtualNode.props_,
            oldVirtualNode.props_
        );
    }
}

function _createNativeNode(virtualNode) {
    if (virtualNode.type_ === TextNode) {
        return createNativeTextNode(virtualNode.props_.children);
    }

    return createNativeElementWithNS(
        virtualNode.ns_,
        virtualNode.type_,
        virtualNode.props_
    );
}

function _determineNS(virtualNode) {
    // Intrinsic namespace
    if (virtualNode.type_ === 'svg') {
        return NS_SVG;
    }

    // As we never hydrate the container node,
    // the parent_ never empty here
    if (virtualNode.parent_.ns_ === NS_SVG && virtualNode.parent_.type_ === 'foreignObject') {
        return NS_HTML;
    }

    // By default, pass namespace below.
    return virtualNode.parent_.ns_;
}

function _isDry(type) {
    return type === Fragment || isFunction(type);
}

// Important!!!
// This module does not handle Portal nodes

function updateView(newVirtualNode, oldVirtualNode) {
    rehydrateView(newVirtualNode, oldVirtualNode);

    if (newVirtualNode.nativeNode_ !== null) {
        const host = _findHostVirtualNode(newVirtualNode);
        if (host !== null) {
            host.lastManipulatedClient_ = newVirtualNode.nativeNode_;
        }
    }
}

function insertView(virtualNode) {
    hydrateView(virtualNode);

    if (virtualNode.nativeNode_ !== null) {
        const host = _findHostVirtualNode(virtualNode);
        if (host !== null) {
            const nativeNodeAfter = (
                host.lastManipulatedClient_ !== null
                    ? host.lastManipulatedClient_.nextSibling
                    : host.nativeNode_.firstChild
            );
            host.nativeNode_.insertBefore(virtualNode.nativeNode_, nativeNodeAfter);
            host.lastManipulatedClient_ = virtualNode.nativeNode_;
        }
    }
}

function deleteView(subtree) {
    _loopClientNativeNodes(subtree, function (nativeNode) {
        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    });
}

// Find the virtual node in the parent chain which its native node is not null
function _findHostVirtualNode(virtualNode) {
    let current = virtualNode.parent_;

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

function _loopClientNativeNodes(virtualNode, callback) {
    let root = virtualNode;
    let current = virtualNode;

    while (true) {
        if (current.nativeNode_ !== null) {
            callback(current.nativeNode_);
        } else if (current.child_ !== null) {
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
        }
        current = current.sibling_;
        continue;
    }
}

const STATE_NORMAL = 0;
const STATE_ERROR = 1;

/**
 *
 * @param {VirtualNode} context
 * @param {*} initialValue
 * @param {number} tag
 * @constructor
 */
function StateHook(context, initialValue, tag) {
    this.context_ = context;
    this.value_ = initialValue;
    this.setValue_ = _setState.bind(this);
    this.tag_ = tag;
    this.next_ = null;
}

function useState(initialValue) {
    return resolveCurrentStateHook(
        function (currentNode) {
            return new StateHook(currentNode, initialValue, STATE_NORMAL);
        },
        function (currentHook) {
            return [currentHook.value_, currentHook.setValue_];
        }
    );
}

function useError(initialError) {
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

            // Make sure the initial error is valid
            if (!_validateError(initialError)) {
                // If the initial error is invalid,
                // use null instead
                initialError = null;
            }
            
            return new StateHook(currentNode, initialError, STATE_ERROR);
        },
        function (currentHook) {
            return [currentHook.value_, currentHook.setValue_];
        }
    );
}

const queueMap = new Map();
let timeoutId = null;

function _setState(value) {
    let queue = queueMap.get(this.context_);

    if (queue === undefined) {
        queue = [[value, this]];
        queueMap.set(this.context_, queue);
    } else {
        queue.unshift([value, this]);
    }

    if (timeoutId !== null) {
        clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(_flushQueues);
}

function _flushQueues() {
    queueMap.forEach(function (queue, contextAsKey) {
        // Important!!!
        // Use hook.context_ instead of contextAsKey
        // as it may be outdated due to the reconciliation process

        let unit, value, hook, newValue, hasChanges = false;
        
        while (queue.length > 0) {
            unit = queue.pop();
            
            value = unit[0];
            hook = unit[1];
            
            if (isFunction(value)) {
                try {
                    newValue = value(hook.value_);
                } catch (error) {
                    catchError(error, hook.context_);
                    continue;
                }
            } else {
                newValue = value;
            }

            if (hook.tag_ === STATE_ERROR && !_validateError(newValue)) {
                // If the new error is invalid,
                // keep the current error unchanged
                continue;
            }
            
            if (newValue !== hook.value_) {
                hook.value_ = newValue;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            resolveTree(hook.context_);
        }
    });

    queueMap.clear();
    timeoutId = null;
}

function _validateError(error) {
    if (!(error === null || error instanceof Error)) {
        if (true) {
            console.error('Error hooks only accept the value is an instance of Error or null');
        }
        return false;
    }

    return true;
}

function catchError(error, virtualNode) {
    let parent = virtualNode.parent_;
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
        setTimeout(function () {
            console.info('You can catch this error by implementing an error boundary with the useError hook');
        });
    }

    throw error;
}

const EFFECT_NORMAL = 0;
const EFFECT_LAYOUT = 1;

const FLAG_ALWAYS = 0;
const FLAG_LAZY = 1;
const FLAG_DEPS = 2;
const FLAG_DEPS_CHANGED = 3;

/**
 *
 * @param {function} callback
 * @param {[]|null} deps
 * @param {number} tag
 * @param {number} flag
 * @return {EffectHook}
 * @constructor
 */
function EffectHook(callback, deps, tag, flag) {
    this.callback_ = callback;
    this.deps_ = deps;
    this.tag_ = tag;
    this.flag_ = flag;
    this.destroy_ = null;
    this.lastDestroy_ = null;
    this.next_ = null;
}

function useEffect(callback, deps) {
    return _useEffectImpl(callback, deps, EFFECT_NORMAL);
}

function useLayoutEffect(callback, deps) {
    return _useEffectImpl(callback, deps, EFFECT_LAYOUT);
}

function _useEffectImpl(callback, deps, tag) {
    if (deps === undefined) {
        deps = null;
    }

    return resolveCurrentEffectHook(
        function (currentNode) {
            const flag = _determineFlag(deps, null);
            return new EffectHook(callback, deps, tag, flag);
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
    
            const flag = _determineFlag(deps, currentHook.deps_);

            if (flag === FLAG_LAZY) {
                return;
            }
    
            if (flag === FLAG_DEPS) {
                currentHook.flag_ = flag;
                return;
            }
    
            if (flag === FLAG_ALWAYS || flag === FLAG_DEPS_CHANGED) {
                currentHook.callback_ = callback;
                currentHook.deps_ = deps;
                currentHook.flag_ = flag;

                currentHook.lastDestroy_ = currentHook.destroy_;
                currentHook.destroy_ = null;
                return;
            }
        }
    );
}

/**
 *
 * @param {number} effectTag
 * @param {VirtualNode} virtualNode
 * @param {boolean} isNewlyMounted
 */
function mountEffects(effectTag, virtualNode, isNewlyMounted) {
    let hook = virtualNode.effectHook_;
    while (hook !== null) {
        if (hook.tag_ === effectTag) {
            if (isNewlyMounted || hook.flag_ === FLAG_ALWAYS || hook.flag_ === FLAG_DEPS_CHANGED) {
                try {
                    _mountEffect(hook);
                } catch (error) {
                    catchError(error, virtualNode);
                }
            }
        }
        hook = hook.next_;
    }
}

/**
 * @param {number} effectTag
 * @param {VirtualNode} virtualNode
 * @param {boolean} isUnmounted
 */
function destroyEffects(effectTag, virtualNode, isUnmounted) {
    let hook = virtualNode.effectHook_;
    while (hook !== null) {
        if (hook.tag_ === effectTag) {
            if (hook.lastDestroy_ !== null || hook.destroy_ !== null) {
                if (isUnmounted || hook.flag_ === FLAG_ALWAYS || hook.flag_ === FLAG_DEPS_CHANGED) {
                    try {
                        _destroyEffect(hook, isUnmounted);
                    } catch (error) {
                        catchError(error, virtualNode);
                    }
                }
            }
        }
        hook = hook.next_;
    }
}

/**
 *
 * @param {EffectHook} effectHook
 */
function _mountEffect(effectHook) {
    effectHook.destroy_ = effectHook.callback_();

    if (effectHook.destroy_ === undefined) {
        effectHook.destroy_ = null;
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
 * @returns 
 */
function _determineFlag(deps, lastDeps) {
    // Always
    if (deps === null) {
        return FLAG_ALWAYS;
    }

    // Lazy
    if (deps.length === 0) {
        return FLAG_LAZY;
    }

    // Deps
    // 1. When init effect
    if (lastDeps === null) {
        return FLAG_DEPS;
    }
    // 2. Two arrays are equal
    if (compareArrays(deps, lastDeps)) {
        return FLAG_DEPS;
    }

    // DepsChanged
    {
        return FLAG_DEPS_CHANGED;
    }
}

function reconcileChildren(current, isSubtreeRoot) {
    if (isFunction(current.type_)) {
        _reconcileChildOfDynamicNode(current, isSubtreeRoot);
    } else if (current.alternative_ !== null) {
        _reconcileChildrenOfStaticNode(current, current.alternative_);
    }
}

function _reconcileChildOfDynamicNode(current, isSubtreeRoot) {
    const oldChild = isSubtreeRoot ? current.child_ : (
        current.alternative_ !== null ? current.alternative_.child_ : null
    );

    let newContent;

    prepareCurrentlyProcessing(current);
    try {
        newContent = current.type_(current.props_);
    } catch (error) {
        catchError(error, current);
        newContent = null;
    }
    flushCurrentlyProcessing();

    const newChild = createVirtualNodeFromContent(newContent);

    if (newChild !== null) {
        newChild.parent_ = current;
        newChild.slot_ = 0;
    }

    if (oldChild !== null) {
        if (newChild !== null && newChild.type_ === oldChild.type_ && newChild.key_ === oldChild.key_) {
            _makeAlternative(newChild, oldChild);
        } else {
            _addDeletion(current, oldChild);
        }
    }

    current.child_ = newChild;
}

function _reconcileChildrenOfStaticNode(current, alternative) {
    const oldChildren = _mapChildren(alternative);
    const newChildren = _mapChildren(current);

    let newChild;
    oldChildren.forEach(function (oldChild, mapKey) {
        newChild = newChildren.get(mapKey);
        if (newChild !== undefined && newChild.type_ === oldChild.type_) {
            _makeAlternative(newChild, oldChild);
        } else {
            _addDeletion(current, oldChild);
        }
    });
}

function _makeAlternative(newChild, oldChild) {
    newChild.alternative_ = oldChild;

    if (isFunction(newChild.type_)) {
        // Copy hooks
        newChild.refHook_ = oldChild.refHook_;
        newChild.stateHook_ = oldChild.stateHook_;
        newChild.effectHook_ = oldChild.effectHook_;

        // Update contexts of state hooks
        let hook = newChild.stateHook_;
        while (hook !== null) {
            hook.context_ = newChild;
            hook = hook.next_;
        }
    }
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

// Algorithm: https://github.com/facebook/react/issues/7942

function workLoop(performUnit, onReturn, root, ref_0, ref_1) {
    let current = root;
    while (true) {
        performUnit(current, root, ref_0, ref_1);
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

function queueWork(work) {
    if (typeof Promise !== 'undefined') {
        Promise.resolve().then(work);
    } else {
        setTimeout(work);
    }
}

function resolveTree(current) {
    const mountNodesMap = new Map();
    const unmountNodesMap = new Map();
    
    workLoop(_performUnitOfWork, _onReturn, current, mountNodesMap, unmountNodesMap);

    unmountNodesMap.forEach(function (isUnmounted, vnode) {
        destroyEffects(EFFECT_LAYOUT, vnode, isUnmounted);
    });
    mountNodesMap.forEach(function (isNewlyMounted, vnode) {
        mountEffects(EFFECT_LAYOUT, vnode, isNewlyMounted);
    });

    queueWork(function () {
        unmountNodesMap.forEach(function (isUnmounted, vnode) {
            destroyEffects(EFFECT_NORMAL, vnode, isUnmounted);
        });
        mountNodesMap.forEach(function (isNewlyMounted, vnode) {
            mountEffects(EFFECT_NORMAL, vnode, isNewlyMounted);
        });
    });
}

function _performUnitOfWork(current, root, mountNodesMap, unmountNodesMap) {
    const isSubtreeRoot = current === root;
    
    reconcileChildren(current, isSubtreeRoot);

    // Portal nodes never change their child
    // Do nothing anymore
    if (current.type_ === Portal) {
        return;
    }

    if (isSubtreeRoot) {
        if (current.effectHook_ !== null) {
            unmountNodesMap.set(current, false);
            mountNodesMap.set(current, false);
        }
    } else {
        if (current.alternative_ !== null) {
            updateView(current, current.alternative_);
            if (current.effectHook_ !== null) {
                unmountNodesMap.set(current.alternative_, false);
                mountNodesMap.set(current, false);
            }
            current.alternative_ = null;
        } else {
            insertView(current);
            if (current.effectHook_ !== null) {
                mountNodesMap.set(current, true);
            }
        }
    }
    
    if (current.deletions_ !== null) {
        const deletions = current.deletions_;
        current.deletions_ = null;

        for (let i = 0; i < deletions.length; ++i) {
            deleteView(deletions[i]);
        }

        queueWork(function () {
            for (let i = 0; i < deletions.length; ++i) {
                workLoop(function (vnode) {
                    if (vnode.effectHook_ !== null) {
                        unmountNodesMap.set(vnode, true);
                    }
                }, null, deletions[i]);
            }
        });
    }
}

// Callback called after walking through a node and all of its ascendants
function _onReturn(current) {
    // This is when we cleanup the remaining temp props
    if (current.lastManipulatedClient_ !== null) {
        current.lastManipulatedClient_ = null;
    }
}

/**
 * 
 * @param {*} children 
 * @param {Element} targetNativeNode
 */
 function mount(children, targetNativeNode) {
    const portal = createPortal(children, targetNativeNode);

    // Render view
    resolveTree(portal);
}

/**
 * 
 * @param {*} children 
 * @param {Element} targetNativeNode
 * @returns {VirtualNode}
 */
function createPortal(children, targetNativeNode) {
    /**
     * @type {VirtualNode}
     */
    let portal;

    if (!(portal = extractVirtualNode(targetNativeNode))) {
        if (true) {
            if (targetNativeNode.firstChild) {
                console.error('Target node must be empty');
            }
        }
        
        portal = new VirtualNode(Portal, {}, null);

        // Determine the namespace (we only support SVG and HTML namespaces)
        portal.ns_ = ('ownerSVGElement' in targetNativeNode) ? NS_SVG : NS_HTML;
        
        linkNativeNode(portal, targetNativeNode);
        attachVirtualNode(targetNativeNode, portal);
    }

    portal.props_.children = children;

    return portal;
}

exports.Fragment = Fragment;
exports.Ref = Ref;
exports.TextNode = TextNode;
exports.createElement = createElement;
exports.createPortal = createPortal;
exports.jsx = createElement;
exports.mount = mount;
exports.useEffect = useEffect;
exports.useError = useError;
exports.useLayoutEffect = useLayoutEffect;
exports.useRef = useRef;
exports.useState = useState;
