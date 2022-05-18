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

    let i = 0;
    for (i = sub.length - 1; i >= 0; i--) {
        if (sub[i] !== full[i]) {
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

const RootType = props => props.children;

const NODE_TEXT = '#';
const NODE_ARRAY = '[';
const NODE_FRAGMENT = '=';

const CLASS_VIEWABLE = 0;
const CLASS_FUNCTIONAL = 1;
const CLASS_COLLECTIVE = 2;

const PATH_SEP = '/';

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
        // type.name +
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
    if (content instanceof VirtualNode) {
        return content;
    }

    if (isString(content) || isNumber(content)) {
        const node = new VirtualNode(NODE_TEXT);

        node.props_.children = content;

        return node;
    }

    if (isArray(content)) {
        const node = new VirtualNode(NODE_ARRAY);

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
        let i = 0, posInRow = -1;
        for (i = 0; i < content.length; i++) {
            const childNode = createVirtualNodeFromContent(content[i]);
            if (childNode !== null) {
                appendChildVirtualNode(virtualNode, childNode, ++posInRow);
            }
        }
    }

    return virtualNode;
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

const PROP_TYPE_ALIAS = 'hook_alias';
const PROP_VIRTUAL_NODE = 'hook_vnode';

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
        type[PROP_TYPE_ALIAS] = createFunctionalTypeAlias()
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
function getAttachedVirtualNode(nativeNode) {
    return nativeNode[PROP_VIRTUAL_NODE];
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
    for (let i = 0; i < rootVirtualNode.children_.length; i++) {
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
        _resolveVirtualNodeRecursive(virtualNode.children_[i], virtualNode.path_);
    }
}

function createNativeTextNode(text) {
    return document.createTextNode(text);
}

function updateNativeTextNode(node, text) {
    node.textContent = text;
}

function createNativeElementWithNS(ns, type, attributes) {
    const element = (ns !== null
            ? document.createElementNS(ns, type)
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
        console.error('className instead of class');
        return [name,];
    }

    if (name === 'style') {
        if (!isEmpty(value) && !isObject(value)) {
            console.error('Style must be an object', value);
            return [name,];
        }
    }

    return [name, value];
}

// !!!IMPORTANT
// Only use this module for viewable nodes
// Passing Functional, Array, Fragment nodes will lead to crash

function hydrateViewableVirtualNode(viewableVirtualNode) {
    // Determine the namespace
    viewableVirtualNode.ns_ = _determineNS(viewableVirtualNode);

    // Create the native node
    const nativeNode = _createNativeNode(viewableVirtualNode);

    linkNativeNode(viewableVirtualNode, nativeNode);
    
    if (nativeNode !== null) {
        attachVirtualNode(nativeNode, viewableVirtualNode);
    }
}

function _determineNS(viewableVirtualNode) {
    // Intrinsic namespace
    if (viewableVirtualNode.type_ === 'svg') {
        return NS_SVG;
    }
 
    // As we never hydrate the container node,
    // the parent_ never empty here
    if (viewableVirtualNode.parent_.ns_ === NS_SVG && viewableVirtualNode.parent_.type_ === 'foreignObject') {
        return NS_HTML;
    }
    
    // By default, pass namespace below.
    return viewableVirtualNode.parent_.ns_;
}

function _createNativeNode(viewableVirtualNode) {
    if (viewableVirtualNode.type_ === NODE_TEXT) {
        return createNativeTextNode(viewableVirtualNode.props_.children);
    }

    {
        let nativeNS = null;
        if (viewableVirtualNode.ns_ === NS_SVG) {
            nativeNS = 'http://www.w3.org/2000/svg';
        }
        return createNativeElementWithNS(nativeNS, viewableVirtualNode.type_, viewableVirtualNode.props_);
    }
}

// !!!IMPORTANT
// Only use this module for viewable nodes
// Passing Functional, Array, Fragment nodes will lead to crash

function commitView(oldViewableVirtualNodeMap, newViewableVirtualNodeMap) {
    // for key in oldMap
    //     if newMap.has(key)
    //         updateNativeNodes
    //     else
    //         removeNativeNodes
    //
    // for key in newMap
    //     if !oldMap.has(key)
    //         insertNativeNodes
    //

    _removeAndUpdate(oldViewableVirtualNodeMap, newViewableVirtualNodeMap);
    _insert(oldViewableVirtualNodeMap, newViewableVirtualNodeMap);
}

function _removeAndUpdate(oldViewableVirtualNodeMap, newViewableVirtualNodeMap) {
    // If the current node is under the last removed node
    // So dont need to remove current node anymore
    // Use lastRemovedKey to track
    let lastRemovedKey = '';

    oldViewableVirtualNodeMap.forEach((oldViewableVirtualNode, key) => {
        if (newViewableVirtualNodeMap.has(key)) {
            const newViewableVirtualNode = newViewableVirtualNodeMap.get(key);

            // Reuse the existing native node
            linkNativeNode(newViewableVirtualNode, oldViewableVirtualNode.nativeNode_);

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

function _insert(oldViewableVirtualNodeMap, newViewableVirtualNodeMap) {
    let pendingVirtualNodes = [];

    newViewableVirtualNodeMap.forEach((newViewableVirtualNode, key) => {
        if (!oldViewableVirtualNodeMap.has(key)) {
            pendingVirtualNodes.push(newViewableVirtualNode);
        } else {
            _insertClosestNativeNodesOfVirtualNodes(pendingVirtualNodes, oldViewableVirtualNodeMap.get(key));
            pendingVirtualNodes.length = 0;
        }
    });

    if (pendingVirtualNodes.length > 0) {
        _insertClosestNativeNodesOfVirtualNodes(pendingVirtualNodes, null);
    }
}

function _insertClosestNativeNodesOfVirtualNodes(virtualNodes, virtualNodeAfter) {
    const nativeNodeAfter = virtualNodeAfter && _findClosestNativeNodes(virtualNodeAfter)[0] || null;
    
    for (let i = 0; i < virtualNodes.length; i++) {
        const virtualNode = virtualNodes[i];

        hydrateViewableVirtualNode(virtualNode);
        
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

function _findClosestNativeNodes(virtualNode) {
    if (virtualNode.nativeNode_ !== null) {
        return [virtualNode.nativeNode_];
    }
    
    {
        const output = [];
        for (let i = 0; i < virtualNode.children_.length; i++) {
            const childVirtualNode = virtualNode.children_[i];
            output.push(..._findClosestNativeNodes(childVirtualNode));
        }
        return output;
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
    for (let i = 0; i < virtualNode.children_.length; i++) {
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

    for (let i = 0; i < virtualNode.children_.length; i++) {
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
 * @param {*} children 
 * @param {Element} rootNativeNode
 */
 function mount(children, rootNativeNode) {
    const rootVirtualNode = createPortal(children, rootNativeNode);

    rootVirtualNode.path_ = createRootId();
    
    updateVirtualTree(rootVirtualNode);
}

/**
 * 
 * @param {*} children 
 * @param {Element} rootNativeNode
 * @returns {VirtualNode}
 */
function createPortal(children, rootNativeNode) {
    /**
     * @type {VirtualNode}
     */
     let rootVirtualNode;

     if (!(rootVirtualNode = getAttachedVirtualNode(rootNativeNode))) {
         while (rootNativeNode.firstChild) {
             rootNativeNode.removeChild(rootNativeNode.firstChild);
         }
         
         rootVirtualNode = new VirtualNode(RootType);
         rootVirtualNode.ns_ = ('ownerSVGElement' in rootNativeNode) ? NS_SVG : NS_HTML;
         
         linkNativeNode(rootVirtualNode, rootNativeNode);
         attachVirtualNode(rootNativeNode, rootVirtualNode);
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
