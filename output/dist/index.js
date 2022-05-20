'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

function isObject(value) {
    return value !== null && typeof value === 'object';
}

function isEmpty(value) {
    return value === undefined || value === null;
}

/**
 * 
 * @param {Array|string} full 
 * @param {Array|string} sub 
 * @returns {boolean}
 */
function startsWith(full, sub) {
    if (full.length < sub.length) {
        return false;
    }

    for (let i = sub.length - 1; i >= 0; --i) {
        if (sub[i] !== full[i]) {
            return false;
        }
    }

    return true;
}

/**
 * 
 * @param {Array} a 
 * @param {Array} b 
 * @returns {boolean}
 */
function compareSameLengthArrays(a, b) {
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
 * @constructor
 */
function VirtualNode(type) {
    this.type_ = type;
    this.props_ = {};
    this.key_ = null;
    this.ref_ = null;

    this.hooks_ = [];

    /**
     * @type {VirtualNode|null}
     */
    this.parent_ = null;

    /**
     * @type {VirtualNode[]}
     */
    this.children_ = [];

    this.path_ = '';
    this.posInRow_ = null;

    this.nativeNode_ = null;
    this.ns_ = null;

    this.class_ = (type === NODE_FRAGMENT || type === NODE_ARRAY
        ? CLASS_COLLECTIVE
        : (isFunction(type)
            ? CLASS_FUNCTIONAL
            : CLASS_VIEWABLE));
}

// Do not support namespace MathML as almost browsers do not support as well
const NS_HTML = 0;
const NS_SVG = 1;

// Note:
// Use special URI characters

const NODE_TEXT = '#';
const NODE_ARRAY = '[';
const NODE_FRAGMENT = '=';

const CLASS_VIEWABLE = 0;
const CLASS_FUNCTIONAL = 1;
const CLASS_COLLECTIVE = 2;

const PATH_SEP = '/';

const RootType = props => props.children;

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
    return (
        (true ? type.name : '') +
        '{' + (++functionalTypeInc).toString(36)
    );
}

let rootIdInc = 0;

/**
 * 
 * @returns {string}
 */
function createRootId() {
    return '~' + (++rootIdInc).toString(36);
}

/**
 * 
 * @param {VirtualNode} virtualNode 
 * @param {Node} nativeNode 
 */
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
    let node = null;

    if (content instanceof VirtualNode) {
        node = content;
    }
    else if (isString(content) || isNumber(content)) {
        node = new VirtualNode(NODE_TEXT);
        node.props_.children = content;
    }
    else if (isArray(content)) {
        node = new VirtualNode(NODE_ARRAY);
        appendChildrenFromContent(node, content);
    }

    return node;
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
 * @param {VirtualNode} virtualNode 
 * @param {Array} content
 */
function appendChildrenFromContent(virtualNode, content) {
    for (
        let childNode, posInRow = -1, i = 0, len = content.length
        ; i < len
        ; ++i
    ) {
        childNode = createVirtualNodeFromContent(content[i]);
        if (childNode !== null) {
            appendChildVirtualNode(virtualNode, childNode, ++posInRow);
        }
    }
}

/**
 *
 * @param {string|function} type
 * @param {{}?} attributes
 * @param {[]} content
 * @return {VirtualNode}
 */
function createElement(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes || {};

    const virtualNode = new VirtualNode(type);
    
    virtualNode.props_ = props;
    virtualNode.key_ = key;
    virtualNode.ref_ = ref;

    if (virtualNode.class_ === CLASS_FUNCTIONAL) {
        // JSX children
        virtualNode.props_.children = content.length > 1 ? content : content[0];
    } else {
        // Append children directly
        appendChildrenFromContent(virtualNode, content);
    }

    return virtualNode;
}

const PROP_TYPE_ALIAS = 'hook_alias';
const PROP_VIRTUAL_NODE = 'hook_vnode';
const PROP_ROOT_ID = 'hook_rootid';

/**
 *
 * @param {Function} type
 * @returns {string}
 */
function getFunctionalTypeAlias(type) {
    if (hasOwnProperty(type, PROP_TYPE_ALIAS)) {
        return type[PROP_TYPE_ALIAS];
    }

    return (
        type[PROP_TYPE_ALIAS] = createFunctionalTypeAlias(type)
    );
}

/**
 * 
 * @param {Element} root 
 * @returns {string}
 */
function getRootId(root) {
    if (hasOwnProperty(root, PROP_ROOT_ID)) {
        return root[PROP_ROOT_ID];
    }

    return (
        root[PROP_ROOT_ID] = createRootId()
    );
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
 * @param {Node} nativeNode 
 * @returns {VirtualNode|undefined}
 */
function extractVirtualNode(nativeNode) {
    return nativeNode[PROP_VIRTUAL_NODE];
}

/**
 *
 * @type {Map<string, Array>}
 */
const memoizedHooksMap = new Map();

/**
 * 
 * @param {string} path 
 * @returns {Array|null}
 */
function findMemoizedHooks(path) {
    return memoizedHooksMap.get(path) || null;
}

/**
 * 
 * @param {string} path 
 * @param {Array} hooks 
 */
function linkMemoizedHooks(path, hooks) {
    memoizedHooksMap.set(path, hooks);
}

/**
 * 
 * @param {string} path 
 */
function unlinkMemoizedHooks(path) {
    memoizedHooksMap.delete(path);
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
        if (true) {
            console.error('className instead of class');
        }
        return [name,];
    }

    if (name === 'style') {
        if (!isEmpty(value) && !isObject(value)) {
            if (true) {
                console.error('Style must be an object', value);
            }
            return [name,];
        }
    }

    return [name, value];
}

// !!!IMPORTANT
// Only use this module for viewable nodes
// Passing Functional, Array, Fragment nodes will lead to crash

function hydrateViewableVirtualNode(viewableVirtualNode) {
    // Create the native node
    const nativeNode = _createNativeNode(viewableVirtualNode);

    linkNativeNode(viewableVirtualNode, nativeNode);
    
    if (true) {
        if (nativeNode !== null) {
            attachVirtualNode(nativeNode, viewableVirtualNode);
        }
    }
}

function _createNativeNode(viewableVirtualNode) {
    if (viewableVirtualNode.type_ === NODE_TEXT) {
        return createNativeTextNode(viewableVirtualNode.props_.children);
    }

    return createNativeElementWithNS(
        viewableVirtualNode.ns_,
        viewableVirtualNode.type_,
        viewableVirtualNode.props_
    );
}

// !!!IMPORTANT
// Only use this module for viewable nodes
// Passing Functional, Array, Fragment nodes will lead to crash

function commitView(oldViewableVirtualNodeMap, newViewableVirtualNodeMap) {
    if (oldViewableVirtualNodeMap.size === 0) {
        _append(newViewableVirtualNodeMap);
    } else {
        /*
         | for key in oldMap
         |     if newMap.has(key)
         |         updateNativeNodes
         |     else
         |         removeNativeNodes
         |
         | for key in newMap
         |     if !oldMap.has(key)
         |         insertNativeNodes
         */
        _removeAndUpdate(oldViewableVirtualNodeMap, newViewableVirtualNodeMap);
        _insert(oldViewableVirtualNodeMap, newViewableVirtualNodeMap);
    }
}

function _removeAndUpdate(oldViewableVirtualNodeMap, newViewableVirtualNodeMap) {
    // New node to be inserted
    let newViewableVirtualNode;

    // If the current node is under the last removed node
    // So dont need to remove current node anymore
    // Use lastRemovedKey to track
    let lastRemovedKey = '';

    oldViewableVirtualNodeMap.forEach((oldViewableVirtualNode, key) => {
        if (newViewableVirtualNodeMap.has(key)) {
            newViewableVirtualNode = newViewableVirtualNodeMap.get(key);

            // Reuse the existing native node
            linkNativeNode(newViewableVirtualNode, oldViewableVirtualNode.nativeNode_);

            if (true) {
                attachVirtualNode(oldViewableVirtualNode.nativeNode_, newViewableVirtualNode);
            }

            if (newViewableVirtualNode.type_ === NODE_TEXT) {
                if (newViewableVirtualNode.props_.children !== oldViewableVirtualNode.props_.children) {
                    updateNativeTextNode(
                        newViewableVirtualNode.nativeNode_,
                        newViewableVirtualNode.props_.children
                    );
                }
            } else {
                updateNativeElementAttributes(
                    newViewableVirtualNode.nativeNode_,
                    newViewableVirtualNode.props_,
                    oldViewableVirtualNode.props_
                );
            }
        } else {
            if (!startsWith(key, lastRemovedKey + PATH_SEP)) {
                _removeNativeNodesOfVirtualNode(oldViewableVirtualNode);
                lastRemovedKey = key;
            }
        }
    });
}

function _append(newViewableVirtualNodeMap) {
    let nativeHost;

    newViewableVirtualNodeMap.forEach((virtualNode) => {
        nativeHost = _findNativeHost(virtualNode);

        if (nativeHost !== null) {
            hydrateViewableVirtualNode(virtualNode);
            nativeHost.appendChild(virtualNode.nativeNode_);
        }
    });
}

function _insert(oldViewableVirtualNodeMap, newViewableVirtualNodeMap) {
    let pendingViewableVirtualNodes = [];

    newViewableVirtualNodeMap.forEach((newViewableVirtualNode, key) => {
        if (!oldViewableVirtualNodeMap.has(key)) {
            pendingViewableVirtualNodes.push(newViewableVirtualNode);
        } else {
            _insertClosestNativeNodesOfVirtualNodes(pendingViewableVirtualNodes, oldViewableVirtualNodeMap.get(key));
            pendingViewableVirtualNodes.length = 0;
        }
    });

    if (pendingViewableVirtualNodes.length > 0) {
        _insertClosestNativeNodesOfVirtualNodes(pendingViewableVirtualNodes, null);
    }
}

function _insertClosestNativeNodesOfVirtualNodes(virtualNodes, virtualNodeAfter) {
    const nativeNodeAfter = virtualNodeAfter && _findFirstNativeNode(virtualNodeAfter) || null;
    
    for (
        let virtualNode, nativeHost, i = 0, len = virtualNodes.length
        ; i < len
        ; ++i
    ) {
        virtualNode = virtualNodes[i];

        nativeHost = _findNativeHost(virtualNode);
        
        if (nativeHost !== null) {
            hydrateViewableVirtualNode(virtualNode);

            if (nativeNodeAfter !== null && nativeHost === nativeNodeAfter.parentNode) {
                nativeHost.insertBefore(virtualNode.nativeNode_, nativeNodeAfter);
            } else {
                nativeHost.appendChild(virtualNode.nativeNode_);
            }
        }
    }
}

function _removeNativeNodesOfVirtualNode(virtualNode) {
    const nativeNodes = _findClosestNativeNodes(virtualNode);

    for (
        let nativeNode, i = 0, len = nativeNodes.length
        ; i < len
        ; ++i
    ) {
        nativeNode = nativeNodes[i];

        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    }
}

function _findNativeHost(virtualNode) {
    if (virtualNode.type_ === RootType) {
        return virtualNode.nativeNode_;
    }
    
    if (virtualNode.parent_ === null) {
        return null;
    }

    if (virtualNode.parent_.nativeNode_ === null) {
        return _findNativeHost(virtualNode.parent_);
    }

    return virtualNode.parent_.nativeNode_;
}

function _findFirstNativeNode(virtualNode) {
    if (virtualNode.nativeNode_ !== null) {
        return virtualNode.nativeNode_;
    }
    
    let firstNativeNode = null;
    
    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len && firstNativeNode === null
        ; ++i
    ) {
        firstNativeNode = _findFirstNativeNode(virtualNode.children_[i]);
    }

    return firstNativeNode;
}

function _findClosestNativeNodes(virtualNode) {
    if (virtualNode.nativeNode_ !== null) {
        return [virtualNode.nativeNode_];
    }
    
    const closestNativeNodes = [];

    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        closestNativeNodes.push(..._findClosestNativeNodes(virtualNode.children_[i]));
    }

    return closestNativeNodes;
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
    for (
        let hook, i = 0, len = functionalVirtualNode.hooks_.length
        ; i < len
        ; ++i
    ) {
        hook = functionalVirtualNode.hooks_[i];

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
    for (
        let hook, i = 0, len = functionalVirtualNode.hooks_.length
        ; i < len
        ; ++i
    ) {
        hook = functionalVirtualNode.hooks_[i];

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

    if (effectHook.destroy_ === undefined) {
        effectHook.destroy_ = null;
    }
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
    if (lastDeps === false || compareSameLengthArrays(deps, lastDeps)) {
        return EFFECT_DEPS;
    }

    // DepsChanged
    {
        return EFFECT_DEPS_CHANGED;
    }
}

/**
 *
 * @param {VirtualNode} rootVirtualNode
 */
function updateVirtualTree(rootVirtualNode) {
    // Update virtual tree and create node maps
    const oldTypedVirtualNodeMaps = _getVirtualNodeMaps(rootVirtualNode);
    const newTypedVirtualNodeMaps = _updateVirtualTreeImpl(rootVirtualNode);

    // Resolve effects and commit view
    _resolveUnmountedVirtualNodes(oldTypedVirtualNodeMaps.functional_, newTypedVirtualNodeMaps.functional_);
    commitView(oldTypedVirtualNodeMaps.viewable_, newTypedVirtualNodeMaps.viewable_);
    _resolveMountedVirtualNodes(oldTypedVirtualNodeMaps.functional_, newTypedVirtualNodeMaps.functional_);
}

function _updateVirtualTreeImpl(rootVirtualNode) {
    const typedVirtualNodeMaps = _createEmptyTypedVirtualNodeMaps();
    _updateVirtualNodeRecursive(rootVirtualNode, typedVirtualNodeMaps);
    return typedVirtualNodeMaps;
}

function _updateVirtualNodeRecursive(virtualNode, typedVirtualNodeMaps) {
    if (virtualNode.class_ === CLASS_FUNCTIONAL) {
        typedVirtualNodeMaps.functional_.set(virtualNode.path_, virtualNode);
    
        prepareCurrentlyProcessing(virtualNode);
        const newVirtualNode = createVirtualNodeFromContent(
            virtualNode.type_(virtualNode.props_)
        );
        flushCurrentlyProcessing();
    
        if (newVirtualNode !== null) {
            appendChildVirtualNode(virtualNode, newVirtualNode, 0);
    
            // This step aimed to read memoized hooks and restore them
            // Memoized data affects the underneath tree,
            // so don't wait until the recursion finished to do this
            resolveVirtualTree(virtualNode);
        }
    } else if (virtualNode.class_ === CLASS_VIEWABLE) {
        typedVirtualNodeMaps.viewable_.set(virtualNode.path_, virtualNode);
    }

    // Recursion
    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _updateVirtualNodeRecursive(virtualNode.children_[i], typedVirtualNodeMaps);
    }
}

function _createEmptyTypedVirtualNodeMaps() {
    return {
        functional_: new Map(),
        viewable_: new Map(),
    };
}

function _getVirtualNodeMaps(rootVirtualNode) {
    const typedVirtualNodeMaps = _createEmptyTypedVirtualNodeMaps();
    _walkVirtualNode(rootVirtualNode, typedVirtualNodeMaps);
    return typedVirtualNodeMaps;
}

function _walkVirtualNode(virtualNode, typedVirtualNodeMaps) {
    if (virtualNode.class_ === CLASS_FUNCTIONAL) {
        typedVirtualNodeMaps.functional_.set(virtualNode.path_, virtualNode);
    } else if (virtualNode.class_ === CLASS_VIEWABLE) {
        typedVirtualNodeMaps.viewable_.set(virtualNode.path_, virtualNode);
    }

    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _walkVirtualNode(virtualNode.children_[i], typedVirtualNodeMaps);
    }
}

function _resolveUnmountedVirtualNodes(oldFunctionalVirtualNodeMap, newFunctionalVirtualNodeMap) {
    oldFunctionalVirtualNodeMap.forEach((virtualNode, key) => {
        const unmounted = !newFunctionalVirtualNodeMap.has(key);

        destroyEffectsOnFunctionalVirtualNode(virtualNode, unmounted);

        if (unmounted) {
            unlinkMemoizedHooks(virtualNode.path_);
        }
    });
}

function _resolveMountedVirtualNodes(oldFunctionalVirtualNodeMap, newFunctionalVirtualNodeMap) {
    newFunctionalVirtualNodeMap.forEach((virtualNode, key) => {
        const mounted = !oldFunctionalVirtualNodeMap.has(key);
        mountEffectsOnFunctionalVirtualNode(virtualNode, mounted);
    });
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
            updateVirtualTree(this.context_);
        }
    };
}

function useState(initialValue) {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    /**
     * @type {StateHook}
     */
    let hook;

    if (functionalVirtualNode.hooks_.length > hookIndex) {
        hook = functionalVirtualNode.hooks_[hookIndex];
    } else {
        hook = new StateHook(functionalVirtualNode, initialValue);
        functionalVirtualNode.hooks_.push(hook);
    }

    return [hook.value_, hook.setValue_];
}

function resolveVirtualTree(rootVirtualNode) {
    for (
        let i = 0, len = rootVirtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _resolveVirtualNodeRecursive(rootVirtualNode.children_[i], rootVirtualNode.path_);
    }
}

/**
 *
 * @param {VirtualNode} virtualNode
 * @param {string} parentPath
 * @private
 */
function _resolveVirtualNodeRecursive(virtualNode, parentPath) {
    // Set path
    virtualNode.path_ = (
        parentPath
        + PATH_SEP
        + (virtualNode.key_ !== null
            ? escapeVirtualNodeKey(virtualNode.key_)
            : virtualNode.posInRow_)
        + PATH_SEP
        + (virtualNode.class_ === CLASS_FUNCTIONAL
            ? getFunctionalTypeAlias(virtualNode.type_)
            : virtualNode.type_)
    );

    // Restore memoized states
    if (virtualNode.class_ === CLASS_FUNCTIONAL) {
        const memoizedHooks = findMemoizedHooks(virtualNode.path_);
        if (memoizedHooks !== null) {
            // Here, new node does not have any hooks
            // because it is in the pending state
            // After when the tree is established
            // and then updating, the hooks will be called (or created if it is the first time)
            virtualNode.hooks_ = memoizedHooks;

            for (
                let hook, i = 0, len = virtualNode.hooks_.length
                ; i < len
                ; ++i
            ) {
                hook = virtualNode.hooks_[i];

                if (hook instanceof StateHook) {
                    hook.context_ = virtualNode;
                }
            }
        }

        linkMemoizedHooks(virtualNode.path_, virtualNode.hooks_);
    }

    // Namespace
    virtualNode.ns_ = _determineNS(virtualNode);

    // Recursion
    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _resolveVirtualNodeRecursive(virtualNode.children_[i], virtualNode.path_);
    }
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

/**
 * 
 * @param {*} children 
 * @param {Element} targetNativeNode
 */
 function mount(children, targetNativeNode) {
    const rootVirtualNode = createPortal(children, targetNativeNode);

    // Set an unique path to split tree states between roots
    rootVirtualNode.path_ = getRootId(targetNativeNode);
    
    resolveVirtualTree(rootVirtualNode);

    updateVirtualTree(rootVirtualNode);
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
    let rootVirtualNode;

    if (!(rootVirtualNode = extractVirtualNode(targetNativeNode))) {
        if (true) {
            if (targetNativeNode.firstChild) {
                console.error('Target node must be empty');
            }
        }
        
        rootVirtualNode = new VirtualNode(RootType);

        // Determine the namespace (we only support SVG and HTML namespaces)
        rootVirtualNode.ns_ = ('ownerSVGElement' in targetNativeNode) ? NS_SVG : NS_HTML;
        
        linkNativeNode(rootVirtualNode, targetNativeNode);
        attachVirtualNode(targetNativeNode, rootVirtualNode);
    }

    rootVirtualNode.props_.children = children;

    return rootVirtualNode;
}

exports.createPortal = createPortal;
exports.h = createElement;
exports.mount = mount;
exports.useEffect = useEffect;
exports.useRef = useRef;
exports.useState = useState;
