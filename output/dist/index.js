'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function hasOwnProperty(obj, propName) {
    return Object.prototype.hasOwnProperty.call(obj, propName);
}

function isString(value) {
    return typeof value === 'string' || value instanceof String;
}

function isNumber(value) {
    return typeof value === 'number' || value instanceof Number;
}

function isFunction(value) {
    return value instanceof Function;
}

function isArray(value) {
    return value instanceof Array;
}

function isPlainObject(value) {
    return (!!value) && (value.constructor === Object);
}

function isEmpty(value) {
    return value === undefined || value === null;
}

let currentlyProcessingFunctionalVirtualNode = null;
let currentlyProcessingHookIndex = -1;

function prepareCurrentlyProcessing(functionalVirtualNode) {
    currentlyProcessingFunctionalVirtualNode = functionalVirtualNode;
    currentlyProcessingHookIndex = -1;
}

function flushCurrentlyProcessing() {
    currentlyProcessingFunctionalVirtualNode = null;
    currentlyProcessingHookIndex = -1;
}

function resolveCurrentlyProcessing() {
    if (currentlyProcessingFunctionalVirtualNode === null) {
        throw new Error('Cannot call hooks from outside of the component');
    }
    
    return [currentlyProcessingFunctionalVirtualNode, ++currentlyProcessingHookIndex];
}

/**
 *
 * @param {*} current
 * @constructor
 */
function RefHook(current) {
    this.current = current;
}

function useRef(initialValue) {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    if (functionalVirtualNode.hooks_.length > hookIndex) {
        return functionalVirtualNode.hooks_[hookIndex];
    }

    const hook = new RefHook(initialValue);

    functionalVirtualNode.hooks_.push(hook);

    return hook;
}

/**
 *
 * @param {string|function} type
 * @param {{}} props
 * @param {string|null} key
 * @param {RefHook|null} ref
 * @return {VirtualNode}
 * @constructor
 */
function VirtualNode(type, props, key, ref) {
    this.type_ = type;
    this.props_ = props;
    this.key_ = key;
    this.ref_ = ref;

    this.hooks_ = [];

    this.parent_ = null;
    this.children_ = [];
    this.path_ = [];
    this.posInRow_ = null;

    this.data_ = null;
    this.nativeNode_ = null;
    this.ns_ = null;
}

// Use special URI characters
const NODE_TEXT = '#';
const NODE_ARRAY = '[';
const NODE_FRAGMENT = '<';

const NS_HTML = 'html';
const NS_SVG = 'svg';

function linkNativeNode(virtualNode, nativeNode) {
    virtualNode.nativeNode_ = nativeNode;

    if (virtualNode.ref_ instanceof RefHook) {
        virtualNode.ref_.current = nativeNode;
    }
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

    if (isString(content) || isNumber(content)) {
        const node = new VirtualNode(NODE_TEXT, {}, null, null);

        node.data_ = content;
        
        return node;
    }

    if (isArray(content)) {
        const node = new VirtualNode(NODE_ARRAY, {}, null, null);

        let posInRow = -1;
        for (let i = 0; i < content.length; i++) {
            const child = createVirtualNodeFromContent(content[i]);
            if (child !== null) {
                appendChildVirtualNode(node, child, ++posInRow);
            }
        }

        return node;
    }

    return null;
}

/**
 * 
 * @param {VirtualNode} parent 
 * @param {VirtualNode} child
 * @param {number} posInRow
 */
function appendChildVirtualNode(parent, child, posInRow) {
    child.parent_ = parent;
    child.posInRow_ = posInRow;
    parent.children_[posInRow] = child;
}

/**
 *
 * @param {string|function} type
 * @param {{}?} attributes
 * @param {[]} content
 * @return {VirtualNode}
 */
function createElement(type, attributes, ...content) {
    attributes = attributes || {};

    if (type === null) {
        return _createStaticVirtualNode(NODE_FRAGMENT, attributes, ...content);
    }

    if (isFunction(type)) {
        return _createFunctionalVirtualNode(type, attributes, ...content);
    }

    return _createStaticVirtualNode(type, attributes, ...content);
}

function _createFunctionalVirtualNode(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes;

    // JSX children
    props.children = content;
    
    return new VirtualNode(type, props, key, ref);
}

function _createStaticVirtualNode(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes;

    const newNode = new VirtualNode(type, props, key, ref);

    let posInRow = -1;
    for (let i = 0; i < content.length; i++) {
        const childNode = createVirtualNodeFromContent(content[i]);
        if (childNode !== null) {
            appendChildVirtualNode(newNode, childNode, ++posInRow);
        }
    }

    return newNode;
}

/**
 * 
 * @param {Array<string|number} path 
 * @returns {string}
 */
function pathToString(path) {
    return path.join('/');
}

// Note:
// Use special URI characters as prefixes

/**
 * 
 * @param {*} key 
 * @returns {string}
 */
function escapeVirtualNodeKey(key) {
    return '@' + encodeURIComponent(key);
}

let functionalTypeInc = 0;

/**
 * 
 * @param {Function} type 
 * @returns {string}
 */
function createFunctionalTypeAlias(type) {
    return /*type.name +*/ '{' + (++functionalTypeInc).toString(36);
}

let containerIdInc = 0;

/**
 * 
 * @returns {string}
 */
function createContainerId() {
    return '~' + (++containerIdInc).toString(36);
}

const PROP_TYPE_ALIAS = 'hook_alias';
const PROP_CONTAINER_ID = 'hook_cid';
const PROP_VIRTUAL_NODE = 'hook_vnode';

/**
 * 
 * @param {Element} container 
 * @returns {string}
 */
function getContainerId(container) {
    if (!hasOwnProperty(container, PROP_CONTAINER_ID)) {
        container[PROP_CONTAINER_ID] = createContainerId();
    }
    return container[PROP_CONTAINER_ID];
}

/**
 *
 * @param {Function} type
 * @returns {string}
 */
function getFunctionalTypeAlias(type) {
    if (!hasOwnProperty(type, PROP_TYPE_ALIAS)) {
        type[PROP_TYPE_ALIAS] = createFunctionalTypeAlias();
    }
    return type[PROP_TYPE_ALIAS];
}

/**
 * 
 * @param {Node} nativeNode 
 * @param {VirtualNode} virtualNode 
 */
function attachVirtualNode(nativeNode, virtualNode) {
    nativeNode[PROP_VIRTUAL_NODE] = virtualNode;
}

/**
 *
 * @type {Object<VirtualNode>}
 */
const memoizedHooksMap = Object.create(null);

function findMemoizedHooks(path) {
    const pathString = pathToString(path);

    if (hasOwnProperty(memoizedHooksMap, pathString)) {
        return memoizedHooksMap[pathString];
    }

    return null;
}

function linkMemoizedHooks(path, functionalVirtualNode) {
    memoizedHooksMap[pathToString(path)] = functionalVirtualNode;
}

function unlinkMemoizedHooks(path) {
    delete memoizedHooksMap[pathToString(path)];
}

function createNativeTextNode(text) {
    return document.createTextNode(text);
}

function updateNativeTextNode(node, text) {
    node.textContent = text;
}

function createNativeElementWithNS(ns, type, attributes) {
    const node = (ns !== null
            ? document.createElementNS(ns, type)
            : document.createElement(type)
    );

    updateNativeElementAttributes(node, attributes, {});

    return node;
}

function updateNativeElementAttributes(element, newAttributes, oldAttributes) {
    for (let attrName in oldAttributes) {
        if (hasOwnProperty(oldAttributes, attrName)) {
            if (isEmpty(newAttributes[attrName])) {
                _removeNativeElementAttribute(element, attrName, oldAttributes[attrName]);
            }
        }
    }

    for (let attrName in newAttributes) {
        if (hasOwnProperty(newAttributes, attrName)) {
            _setNativeElementAttribute(element, attrName, newAttributes[attrName], oldAttributes[attrName]);
        }
    }
}

function _removeNativeElementAttribute(element, attrName, attrValue) {
    const [name, value] = _transformNativeElementAttribute(attrName, attrValue);

    if (isEmpty(value)) {
        return;
    }

    element.removeAttribute(name);
}

function _setNativeElementAttribute(element, attrName, attrValue, oldAttrValue) {
    const [name, value] = _transformNativeElementAttribute(attrName, attrValue);

    if (isEmpty(value)) {
        return;
    }

    if (name === 'style') {
        if (!isEmpty(oldAttrValue)) {
            const [, oldValue] = _transformNativeElementAttribute(attrName, oldAttrValue);
            if (!isEmpty(oldValue)) {
                for (let prop in oldValue) {
                    if (hasOwnProperty(oldValue, prop) && !hasOwnProperty(value, prop)) {
                        // Delete this style property
                        element.style[prop] = '';
                    }
                }
            }
        }

        for (let prop in value) {
            if (hasOwnProperty(value, prop)) {
                if (!isEmpty(value[prop])) {
                    element.style[prop] = value[prop];
                }
            }
        }

        return;
    }

    if (isString(value) || isNumber(value)) {
        element.setAttribute(name, value);
    }

    // For properties, event listeners
    if (name in element) {
        try {
            element[name] = value;
        } catch (e) {
            // The property is not writable
        }
    }
}

function _transformNativeElementAttribute(name, value) {
    if (isFunction(value)) {
        return [name.toLowerCase(), value];
    }

    if (name === 'className') {
        if (isArray(value)) {
            return ['class', value.filter(t => isString(t)).join(' ')];
        } else {
            return ['class', value];
        }
    }

    if (name === 'class') {
        console.error('className instead of class');
        return [name,];
    }

    if (name === 'style') {
        if (!isEmpty(value) && !isPlainObject(value)) {
            console.error('Style must be a plain object', value);
            return [name,];
        }
    }

    return [name, value];
}

function hydrateVirtualTree(virtualNode) {
    // Determine the namespace
    if (virtualNode.type_ === 'svg') {
        virtualNode.ns_ = NS_SVG;
    } else {
        if (virtualNode.parent_ !== null) {
            virtualNode.ns_ = virtualNode.parent_.ns_;
        } else {
            virtualNode.ns_ = NS_HTML;
        }
    }

    // Create the native node
    let nativeNode = null;

    if (virtualNode.type_ === NODE_TEXT) {
        nativeNode = createNativeTextNode(virtualNode.data_);
    } else if (virtualNode.type_ === NODE_FRAGMENT || virtualNode.type_ === NODE_ARRAY) ; else if (isString(virtualNode.type_)) {
        let nativeNS = null;
        if (virtualNode.ns_ === NS_SVG) {
            nativeNS = 'http://www.w3.org/2000/svg';
        }
        nativeNode = createNativeElementWithNS(nativeNS, virtualNode.type_, virtualNode.props_);

        // For debug
        attachVirtualNode(nativeNode, virtualNode);
    }

    linkNativeNode(virtualNode, nativeNode);

    // Continue with the children
    for (let i = 0; i < virtualNode.children_.length; i++) {
        hydrateVirtualTree(virtualNode.children_[i]);
    }
}

function commitView(oldVirtualNodeMap, newVirtualNodeMap) {
    _removeOldNativeNodes(oldVirtualNodeMap, newVirtualNodeMap);
    _updateExistingNativeNodes(oldVirtualNodeMap, newVirtualNodeMap);
    _insertNewNativeNodes(oldVirtualNodeMap, newVirtualNodeMap);
}

function _removeOldNativeNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    // If the current node is under the last removed node
    // So dont need to remove current node anymore
    // Use lastRemovedKey to track
    let lastRemovedKey = '';
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key) && !hasOwnProperty(newVirtualNodeMap, key)) {
            if (!key.startsWith(lastRemovedKey + '/')) {
                const oldVirtualNode = oldVirtualNodeMap[key];
                if (oldVirtualNode.nativeNode_ !== null) {
                    _removeNativeNodesOfVirtualNode(oldVirtualNode);
                    lastRemovedKey = key;
                }
            }
        }
    }
}

function _updateExistingNativeNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    const mergedKeys = Object.keys({
        ...oldVirtualNodeMap,
        ...newVirtualNodeMap,
    });

    for (let i = 0; i < mergedKeys.length; i++) {
        const key = mergedKeys[i];

        if (hasOwnProperty(oldVirtualNodeMap, key) && hasOwnProperty(newVirtualNodeMap, key)) {
            const newVirtualNode = newVirtualNodeMap[key];
            if (newVirtualNode.nativeNode_ !== null) {
                const oldVirtualNode = oldVirtualNodeMap[key];

                // Reuse the existing native node
                linkNativeNode(newVirtualNode, oldVirtualNode.nativeNode_);

                if (newVirtualNode.type_ === NODE_TEXT) {
                    if (newVirtualNode.data_ !== oldVirtualNode.data_) {
                        updateNativeTextNode(
                            newVirtualNode.nativeNode_,
                            newVirtualNode.data_
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
        }
    }
}

function _insertNewNativeNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    let pendingVirtualNodes = [];

    for (let key in newVirtualNodeMap) {
        if (hasOwnProperty(newVirtualNodeMap, key)) {
            if (!hasOwnProperty(oldVirtualNodeMap, key)) {
                const newVirtualNode = newVirtualNodeMap[key];
                if (newVirtualNode.nativeNode_ !== null) {
                    pendingVirtualNodes.push(newVirtualNode);
                }
            } else {
                _insertClosestNativeNodesOfVirtualNodes(pendingVirtualNodes, oldVirtualNodeMap[key]);
                pendingVirtualNodes.length = 0;
            }
        }
    }

    if (pendingVirtualNodes.length > 0) {
        _insertClosestNativeNodesOfVirtualNodes(pendingVirtualNodes, null);
    }
}

function _insertClosestNativeNodesOfVirtualNodes(virtualNodes, virtualNodeAfter) {
    const nativeNodeAfter = virtualNodeAfter && _findClosestNativeNodes(virtualNodeAfter)[0] || null;
    
    for (let i = 0; i < virtualNodes.length; i++) {
        const virtualNode = virtualNodes[i];
        
        if (virtualNode.nativeNode_ !== null) {
            const nativeHost = _findNativeHost(virtualNode);

            if (nativeHost !== null) {
                if (nativeNodeAfter !== null && nativeHost === nativeNodeAfter.parentNode) {
                    nativeHost.insertBefore(virtualNode.nativeNode_, nativeNodeAfter);
                } else {
                    nativeHost.appendChild(virtualNode.nativeNode_);
                }
            }
        }
    }
}

function _removeNativeNodesOfVirtualNode(virtualNode) {
    const nativeNodes = _findClosestNativeNodes(virtualNode);

    for (let i = 0; i < nativeNodes.length; i++) {
        const nativeNode = nativeNodes[i];

        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    }
}

function _findNativeHost(virtualNode) {
    if (virtualNode.parent_ === null) {
        return null;
    }

    if (virtualNode.parent_.nativeNode_ === null) {
        return _findNativeHost(virtualNode.parent_);
    }

    return virtualNode.parent_.nativeNode_;
}

function _findClosestNativeNodes(virtualNode) {
    if (virtualNode.nativeNode_ !== null) {
        return [virtualNode.nativeNode_];
    } else {
        return virtualNode.children_.reduce((arr, childVirtualNode) => {
            return arr.concat(_findClosestNativeNodes(childVirtualNode));
        }, []);
    }
}

/**
 *
 * @param {function} callback
 * @param {[]|null} deps
 * @param {function} lastDestroy
 * @return {EffectHook}
 * @constructor
 */
function EffectHook(callback, deps, lastDestroy) {
    this.tag_ = EFFECT_NONE;
    this.callback_ = callback;
    this.deps_ = deps;
    this.destroy_ = null;
    this.lastDestroy_ = lastDestroy;
}

const EFFECT_NONE = 0;
const EFFECT_ALWAYS = 1;
const EFFECT_LAZY = 2;
const EFFECT_DEPS = 3;
const EFFECT_DEPS_CHANGED = 4;

function useEffect(callback, deps = null) {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    if (functionalVirtualNode.hooks_.length > hookIndex) {
        /**
         * @type {EffectHook}
         */
        const currentHook = functionalVirtualNode.hooks_[hookIndex];

        if (!(
            deps === null && currentHook.deps_ === null ||
            deps.length === currentHook.deps_.length
        )) {
            throw new Error('Deps must be size-fixed');
        }

        const effectTag = _getEffectTag(deps, currentHook.deps_);

        if (effectTag === EFFECT_LAZY) {
            return;
        }

        if (effectTag === EFFECT_DEPS) {
            currentHook.tag_ = effectTag;
            return;
        }

        if (effectTag === EFFECT_ALWAYS || effectTag === EFFECT_DEPS_CHANGED) {
            const newHook = new EffectHook(callback, deps, currentHook.destroy_);
            newHook.tag_ = effectTag;
            functionalVirtualNode.hooks_[hookIndex] = newHook;
            return;
        }

        return;
    }

    const hook = new EffectHook(callback, deps, null);
    hook.tag_ = _getEffectTag(deps);

    functionalVirtualNode.hooks_.push(hook);
}

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNewNodeMounted
 */
function mountEffectsOnFunctionalVirtualNode(functionalVirtualNode, isNewNodeMounted) {
    for (let i = 0; i < functionalVirtualNode.hooks_.length; i++) {
        const hook = functionalVirtualNode.hooks_[i];

        if (!(hook instanceof EffectHook)) {
            continue;
        }

        if (isNewNodeMounted || hook.tag_ === EFFECT_ALWAYS || hook.tag_ === EFFECT_DEPS_CHANGED) {
            _mountEffectHook(hook);
        }
    }
}

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNodeUnmounted
 */
function destroyEffectsOnFunctionalVirtualNode(functionalVirtualNode, isNodeUnmounted) {
    for (let i = 0; i < functionalVirtualNode.hooks_.length; i++) {
        const hook = functionalVirtualNode.hooks_[i];

        if (!(
            hook instanceof EffectHook &&
            (hook.lastDestroy_ !== null || hook.destroy_ !== null)
        )) {
            continue;
        }

        if (isNodeUnmounted || hook.tag_ === EFFECT_ALWAYS || hook.tag_ === EFFECT_DEPS_CHANGED) {
            _destroyEffectHook(hook, isNodeUnmounted);
        }
    }
}

/**
 *
 * @param {EffectHook} effectHook
 */
function _mountEffectHook(effectHook) {
    effectHook.destroy_ = effectHook.callback_();
}

/**
 *
 * @param {EffectHook} hook
 * @param {boolean} isNodeUnmounted
 */
function _destroyEffectHook(hook, isNodeUnmounted = false) {
    if (hook.lastDestroy_ !== null && !isNodeUnmounted) {
        hook.lastDestroy_();
        return;
    }

    if (hook.destroy_ !== null) {
        hook.destroy_();
    }
}

function _getEffectTag(deps, lastDeps = false) {
    // Always
    if (deps === null) {
        return EFFECT_ALWAYS;
    }

    // Lazy
    if (deps.length === 0) {
        return EFFECT_LAZY;
    }

    // Deps
    if (lastDeps === false || _compareSameLengthArrays(deps, lastDeps)) {
        return EFFECT_DEPS;
    }

    // DepsChanged
    {
        return EFFECT_DEPS_CHANGED;
    }
}

function _compareSameLengthArrays(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

/**
 *
 * @param {VirtualNode} rootVirtualNode
 * @param {boolean} initial
 */
function updateVirtualTree(rootVirtualNode, initial) {
    const oldVirtualNodeMap = initial ? {} : _getVirtualNodeMap(rootVirtualNode);
    _updateVirtualNodeRecursive(rootVirtualNode);
    const newVirtualNodeMap = _getVirtualNodeMap(rootVirtualNode);

    _resolveUnmountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap);
    hydrateVirtualTree(rootVirtualNode);
    commitView(oldVirtualNodeMap, newVirtualNodeMap);
    _resolveMountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap);
}

/**
 *
 * @param {VirtualNode} virtualNode
 */
function _updateVirtualNodeRecursive(virtualNode) {
    if (virtualNode.type_ === NODE_TEXT) {
        return;
    }

    if (!isFunction(virtualNode.type_)) {
        for (let i = 0; i < virtualNode.children_.length; i++) {
            _updateVirtualNodeRecursive(virtualNode.children_[i]);
        }
        return;
    }

    prepareCurrentlyProcessing(virtualNode);
    const newVirtualNode = createVirtualNodeFromContent(
        virtualNode.type_(virtualNode.props_)
    );
    flushCurrentlyProcessing();

    if (newVirtualNode !== null) {
        appendChildVirtualNode(virtualNode, newVirtualNode, 0);

        // This step aimed to read memoized hooks and restore them
        resolveVirtualTree(virtualNode);

        // Recursion
        _updateVirtualNodeRecursive(newVirtualNode);
    }
}

function _resolveUnmountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key)) {
            const unmounted = !hasOwnProperty(newVirtualNodeMap, key);
            const virtualNode = oldVirtualNodeMap[key];

            if (isFunction(virtualNode.type_)) {
                destroyEffectsOnFunctionalVirtualNode(virtualNode, unmounted);

                if (unmounted) {
                    unlinkMemoizedHooks(virtualNode.path_);
                }
            }
        }
    }
}

function _resolveMountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    for (let key in newVirtualNodeMap) {
        if (hasOwnProperty(newVirtualNodeMap, key)) {
            const mounted = !hasOwnProperty(oldVirtualNodeMap, key);
            const virtualNode = newVirtualNodeMap[key];

            if (isFunction(virtualNode.type_)) {
                mountEffectsOnFunctionalVirtualNode(virtualNode, mounted);
            }
        }
    }
}

function _getVirtualNodeMap(rootVirtualNode) {
    const outputMap = Object.create(null);

    _walkVirtualNode(rootVirtualNode, outputMap);

    return outputMap;
}

function _walkVirtualNode(virtualNode, outputMap) {
    outputMap[pathToString(virtualNode.path_)] = virtualNode;

    for (let i = 0; i < virtualNode.children_.length; i++) {
        _walkVirtualNode(virtualNode.children_[i], outputMap);
    }
}

/**
 *
 * @param {VirtualNode} context
 * @param {*} initialValue
 * @constructor
 */
function StateHook(context, initialValue) {
    this.context_ = context;
    
    this.value_ = initialValue;

    this.setValue_ = (value) => {
        let newValue;
        
        if (isFunction(value)) {
            newValue = value(this.value_);
        } else {
            newValue = value;
        }
        
        if (newValue !== this.value_) {
            this.value_ = newValue;
            updateVirtualTree(this.context_, false);
        }
    };
}

function useState(initialValue) {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    if (functionalVirtualNode.hooks_.length > hookIndex) {
        const hook = functionalVirtualNode.hooks_[hookIndex];
        return [hook.value_, hook.setValue_];
    }

    const hook = new StateHook(
        functionalVirtualNode,
        initialValue,
    );

    functionalVirtualNode.hooks_.push(hook);

    return [hook.value_, hook.setValue_];
}

function resolveVirtualTree(rootVirtualNode) {
    for (let i = 0; i < rootVirtualNode.children_.length; i++) {
        _resolveVirtualNodeRecursive(rootVirtualNode.children_[i], rootVirtualNode.path_);
    }
}

function _resolveVirtualNodeRecursive(virtualNode, parentPath) {
    // Don't change the passed path
    const currentPath = [...parentPath];

    // If a node has key, replace the index of this node
    // in the children node list of the parent
    // by the key
    if (virtualNode.key_ !== null) {
        currentPath.push(escapeVirtualNodeKey(virtualNode.key_));
    } else {
        currentPath.push(virtualNode.posInRow_);
    }

    // Add the component type to the current path
    if (isFunction(virtualNode.type_)) {
        currentPath.push(getFunctionalTypeAlias(virtualNode.type_));
    } else {
        currentPath.push(virtualNode.type_);
    }

    // Set path
    virtualNode.path_ = currentPath;

    // Restore memoized states
    if (isFunction(virtualNode.type_)) {
        const memoizedHooks = findMemoizedHooks(virtualNode.path_);
        if (memoizedHooks !== null) {
            // Here, new node does not have any hooks
            // because it is in the pending state
            // After when the tree is established
            // and then updating, the hooks will be called (or created if it is the first time)
            virtualNode.hooks_ = memoizedHooks;

            for (let i = 0; i < virtualNode.hooks_.length; i++) {
                const hook = virtualNode.hooks_[i];
                if (hook instanceof StateHook) {
                    hook.context_ = virtualNode;
                }
            }
        }

        linkMemoizedHooks(virtualNode.path_, virtualNode.hooks_);
    }
    
    // Recursion
    for (let i = 0; i < virtualNode.children_.length; i++) {
        _resolveVirtualNodeRecursive(virtualNode.children_[i], currentPath);
    }
}

/**
 *
 * @param {*} root
 * @param {Element} container
 */
function mount(root, container) {
    if (container.firstChild) {
        throw new Error('Container must be empty');
    }

    const rootVirtualNode = createVirtualNodeFromContent(root);

    const containerVirtualNode = new VirtualNode(container.nodeName.toLowerCase(), {}, null, null);
    containerVirtualNode.path_ = [getContainerId(container)];
    containerVirtualNode.ns_ = container.ownerSVGElement ? NS_SVG : NS_HTML;
    linkNativeNode(containerVirtualNode, container);
    attachVirtualNode(container, containerVirtualNode);

    appendChildVirtualNode(containerVirtualNode, rootVirtualNode, 0);

    resolveVirtualTree(containerVirtualNode);
    updateVirtualTree(rootVirtualNode, true);
}

exports.h = createElement;
exports.mount = mount;
exports.useEffect = useEffect;
exports.useRef = useRef;
exports.useState = useState;
