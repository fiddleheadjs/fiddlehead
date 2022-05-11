
// =======================================
// Types and Constants
// =======================================


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
    this.type = type;
    this.props = props;
    this.key = key;
    this.ref = ref;
    
    this.hooks = [];

    this.parent = null;
    this.children = [];
    this.path = [];

    this.viewNode = null;
    this.ns = null;
}

const NODE_TEXT = '#txt';
const NODE_FRAGMENT = '#frg';

const NS_HTML = 'html';
const NS_SVG = 'svg';

function linkViewNode(virtualNode, viewNode) {
    virtualNode.viewNode = viewNode;

    if (virtualNode.ref instanceof RefHook) {
        virtualNode.ref.current = viewNode;
    }
}

/**
 *
 * @param {*} current
 * @constructor
 */
function RefHook(current) {
    this.current = current;
}

/**
 *
 * @param {*} value
 * @param {function} setValue
 * @return {StateHook}
 * @constructor
 */
function StateHook(value, setValue) {
    this.value = value;
    this.setValue = setValue;
}

const EFFECT_NONE = 0;
const EFFECT_ALWAYS = 1;
const EFFECT_LAZY = 2;
const EFFECT_DEPS = 3;
const EFFECT_DEPS_CHANGED = 4;

/**
 *
 * @param {function} callback
 * @param {[]?} deps
 * @param {function?} lastDestroy
 * @return {EffectHook}
 * @constructor
 */
function EffectHook(callback, deps, lastDestroy) {
    this.tag = EFFECT_NONE;
    this.callback = callback;
    this.deps = deps;
    this.destroy = undefined;
    this.lastDestroy = lastDestroy;
}

/**
 *
 * @param {VirtualNode|null} parent
 * @param {[]} routeFromParent
 * @param {VirtualNode} current
 * @return {AppendInfo}
 * @constructor
 */
function AppendInfo(parent, routeFromParent, current) {
    this.parent = parent;
    this.routeFromParent = routeFromParent;
    this.current = current;
}

/**
 * 
 * @type {Array<AppendInfo>}
 */
 const NormallyEmptyAppendedNodeArray = [];

 const PROP_COMPONENT_TYPE = 'Hook$ComponentType';
 const PROP_CONTAINER_ID = 'Hook$ContainerId';
 const PROP_VIRTUAL_NODE = 'Hook$VirtualNode';


// =======================================
// Utils
// =======================================

let containerIdInc = 0;
function getContainerId(root) {
    if (!hasOwnProperty(root, PROP_CONTAINER_ID)) {
        root[PROP_CONTAINER_ID] = '~' + (++containerIdInc);
    }
    return root[PROP_CONTAINER_ID];
}

let componentTypeInc = 0;
/**
 * 
 * @param {Function} Component 
 * @returns {string}
 */
function getComponentType(Component) {
    if (!hasOwnProperty(Component, PROP_COMPONENT_TYPE)) {
        Component[PROP_COMPONENT_TYPE] = Component.name + '$' + (++componentTypeInc);
    }
    return Component[PROP_COMPONENT_TYPE];
}

let componentTempPathDec = 0;
function generateTemporaryPath() {
    return [--componentTempPathDec];
}

function stringifyPath(path) {
    return path.join('/');
}

function escapeKey(key) {
    return '@' + encodeURIComponent(key);
}


// =======================================
// Currently Processing Tracking
// =======================================


let currentlyRenderingFunctionalVirtualNode = null;
let currentlyProcessingHookIndex = -1;

function prepareCurrentlyRendering(functionalVirtualNode) {
    currentlyRenderingFunctionalVirtualNode = functionalVirtualNode;
    currentlyProcessingHookIndex = -1;
}

function flushCurrentlyRendering() {
    currentlyRenderingFunctionalVirtualNode = null;
    currentlyProcessingHookIndex = -1;
}

function resolveCurrentlyRenderingFunctionalVirtualNode() {
    if (currentlyRenderingFunctionalVirtualNode === null) {
        throw new Error('Cannot call hooks from outside of the component');
    }
    
    return currentlyRenderingFunctionalVirtualNode;
}


// =======================================
// Functional Virtual Node Map
// =======================================


/**
 *
 * @type {Object<VirtualNode>}
 */
 const functionalVirtualNodeMap = {};

function findFunctionalVirtualNode(path) {
    const pathString = stringifyPath(path);

    if (hasOwnProperty(functionalVirtualNodeMap, pathString)) {
        return functionalVirtualNodeMap[pathString];
    }

    return null;
}

function linkFunctionalVirtualNode(path, functionalVirtualNode) {
    functionalVirtualNodeMap[stringifyPath(path)] = functionalVirtualNode;
}

function unlinkFunctionalVirtualNode(path) {
    delete functionalVirtualNodeMap[stringifyPath(path)];
}


// =======================================
// useRef
// =======================================


function useRef(initialValue) {
    const functionalVitualNode = resolveCurrentlyRenderingFunctionalVirtualNode();

    currentlyProcessingHookIndex++;

    if (functionalVitualNode.hooks.length > currentlyProcessingHookIndex) {
        return functionalVitualNode.hooks[currentlyProcessingHookIndex];
    }

    const hook = new RefHook(initialValue);

    functionalVitualNode.hooks.push(hook);

    return hook;
}


// =======================================
// useState
// =======================================


function useState(initialValue) {
    const functionalVirtualNode = resolveCurrentlyRenderingFunctionalVirtualNode();

    currentlyProcessingHookIndex++;

    if (functionalVirtualNode.hooks.length > currentlyProcessingHookIndex) {
        const hook = functionalVirtualNode.hooks[currentlyProcessingHookIndex];
        return [hook.value, hook.setValue];
    }

    const hook = new StateHook(
        initialValue,
        (value) => {
            let newValue;

            if (isFunction(value)) {
                newValue = value(hook.value);
            } else {
                newValue = value;
            }

            if (newValue !== hook.value) {
                hook.value = newValue;
                updateVirtualTree(functionalVirtualNode);
            }
        }
    );

    functionalVirtualNode.hooks.push(hook);

    return [hook.value, hook.setValue];
}


// =======================================
// useEffect
// =======================================


function useEffect(callback, deps = null) {
    const functionalVirtualNode = resolveCurrentlyRenderingFunctionalVirtualNode();

    currentlyProcessingHookIndex++;

    if (functionalVirtualNode.hooks.length > currentlyProcessingHookIndex) {
        /**
         * @type {EffectHook}
         */
        const currentHook = functionalVirtualNode.hooks[currentlyProcessingHookIndex];

        if (!(
            deps === null && currentHook.deps === null ||
            deps.length === currentHook.deps.length
        )) {
            throw new Error('Deps must be size-fixed');
        }

        const effectTag = getEffectTag(deps, currentHook.deps);

        if (effectTag === EFFECT_LAZY) {
            return;
        }

        if (effectTag === EFFECT_DEPS) {
            currentHook.tag = effectTag;
            return;
        }

        if (effectTag === EFFECT_ALWAYS || effectTag === EFFECT_DEPS_CHANGED) {
            const newHook = new EffectHook(callback, deps, currentHook.destroy);
            newHook.tag = effectTag;
            functionalVirtualNode.hooks[currentlyProcessingHookIndex] = newHook;
            return;
        }

        return;
    }

    const hook = new EffectHook(callback, deps);
    hook.tag = getEffectTag(deps);

    functionalVirtualNode.hooks.push(hook);
}

function getEffectTag(deps, lastDeps = false) {
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

function compareSameLengthArrays(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

/**
 *
 * @param {EffectHook} effectHook
 */
function mountEffectHook(effectHook) {
    effectHook.destroy = effectHook.callback();
}

/**
 *
 * @param {EffectHook} hook
 * @param {boolean} isNodeUnmounted
 */
function destroyEffectHook(hook, isNodeUnmounted = false) {
    if (hook.lastDestroy !== undefined && !isNodeUnmounted) {
        hook.lastDestroy();
        return;
    }

    if (hook.destroy !== undefined) {
        hook.destroy();
    }
}

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNewNodeMounted
 */
function mountEffectsByFunctionalVirtualNode(functionalVirtualNode, isNewNodeMounted) {
    functionalVirtualNode.hooks.forEach(hook => {
        if (!(hook instanceof EffectHook)) {
            return;
        }

        if (isNewNodeMounted || hook.tag === EFFECT_ALWAYS || hook.tag === EFFECT_DEPS_CHANGED) {
            mountEffectHook(hook);
        }
    });
}

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNodeUnmounted
 */
function destroyEffectsByFunctionalVirtualNode(functionalVirtualNode, isNodeUnmounted) {
    functionalVirtualNode.hooks.forEach(hook => {
        if (!(
            hook instanceof EffectHook &&
            (hook.lastDestroy !== undefined || hook.destroy !== undefined)
        )) {
            return;
        }

        if (isNodeUnmounted || hook.tag === EFFECT_ALWAYS || hook.tag === EFFECT_DEPS_CHANGED) {
            destroyEffectHook(hook, isNodeUnmounted);
        }
    });
}


// =======================================
// Update Virtual Tree
// =======================================


/**
 * 
 * @param {VirtualNode} rootVirtualNode 
 * @param {boolean} isInit 
 */
function updateVirtualTree(rootVirtualNode, isInit = false) {
    const oldVirtualNodeMap = isInit ? {} : _getVirtualNodeMap(rootVirtualNode);
    _updateVirtualNodeRecursive(rootVirtualNode, rootVirtualNode.parent);
    finishResolveVirtualTree();
    const newVirtualNodeMap = _getVirtualNodeMap(rootVirtualNode);

    _resolveUnmountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap);
    hydrateVirtualTree(rootVirtualNode);
    commitToHTML(oldVirtualNodeMap, newVirtualNodeMap);
    _resolveMountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap);
}

/**
 * 
 * @param {VirtualNode} virtualNode 
 */
 function _updateVirtualNodeRecursive(virtualNode) {
    if (virtualNode.type === NODE_TEXT) {
        return;
    }

    if (!isFunction(virtualNode.type)) {
        virtualNode.children.forEach(childVirtualNode => {
            _updateVirtualNodeRecursive(childVirtualNode);
        });
        return;
    }

    {
        prepareCurrentlyRendering(virtualNode);
        const newVirtualNode = virtualNode.type(virtualNode.props);
        flushCurrentlyRendering();

        resolveVirtualTree(newVirtualNode, virtualNode.path);
        
        newVirtualNode.parent = virtualNode;
        virtualNode.children[0] = newVirtualNode;

        _updateVirtualNodeRecursive(newVirtualNode);
    }
}

function _resolveUnmountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key)) {
            const unmounted = !hasOwnProperty(newVirtualNodeMap, key);
            const virtualNode = oldVirtualNodeMap[key];

            if (isFunction(virtualNode.type)) {
                destroyEffectsByFunctionalVirtualNode(virtualNode, unmounted);

                if (unmounted) {
                    unlinkFunctionalVirtualNode(virtualNode.path);
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

            if (isFunction(virtualNode.type)) {
                mountEffectsByFunctionalVirtualNode(virtualNode, mounted);
            }
        }
    }
}

function _getVirtualNodeMap(rootVirtualNode) {
    const out = {};

    const walk = (virtualNode) => {
        out[stringifyPath(virtualNode.path)] = virtualNode;

        virtualNode.children.forEach(childVirtualNode => {
            walk(childVirtualNode);
        });
    };

    walk(rootVirtualNode);

    return out;
}



// =======================================
// Create Element
// =======================================


/**
 * creates an element with certain content and attributes
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
    props.children = content;

    const tempPath = generateTemporaryPath();

    const virtualNode = new VirtualNode(type, props, key, ref);
    linkFunctionalVirtualNode(tempPath, virtualNode);

    virtualNode.resolvePath = () => {
        unlinkFunctionalVirtualNode(tempPath);

        const existing = findFunctionalVirtualNode(virtualNode.path);
        if (existing) {
            virtualNode.hooks = existing.hooks;
        }

        linkFunctionalVirtualNode(virtualNode.path, virtualNode);
    };

    return virtualNode;
}

function _createStaticVirtualNode(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes;

    const virtualNode = new VirtualNode(type, props, key, ref);

    _appendVirtualChildren(virtualNode, content);

    return virtualNode;
}

function _appendVirtualChildren(element, content) {
    const append = function (item, indexes) {
        let virtualNode;

        if (isString(item) || isNumber(item)) {
            virtualNode = new VirtualNode(NODE_TEXT, {}, null, null);
            virtualNode.text = String(item);
        } else {
            virtualNode = item;
        }

        if (virtualNode instanceof VirtualNode) {
            element.children.push(virtualNode);
            NormallyEmptyAppendedNodeArray.push(
                new AppendInfo(element, indexes, virtualNode)
            );
        }
    };

    const appendRecursively = function (content, indexes) {
        if (isArray(content)) {
            content.forEach(function (item, idx) {
                appendRecursively(item, [...indexes, idx]);
            });
        } else {
            append(content, indexes);
        }
    }

    appendRecursively(content, []);
}


// =======================================
// Virtual Tree Manipulation
// =======================================


function resolveVirtualTree(rootVirtualNode, basePath = []) {
    const rootAppendInfo = new AppendInfo(null, [], rootVirtualNode);
    let arr = [...NormallyEmptyAppendedNodeArray];
    let currentPath = [...basePath];

    /**
     *
     * @param {AppendInfo} appendInfo
     * @param {VirtualNode} virtualNode
     */
    const walk = (appendInfo, virtualNode) => {
        const pivotPathSize = currentPath.length;

        if (virtualNode !== rootVirtualNode) {
            currentPath.push(...appendInfo.routeFromParent);

            // If a node has key, replace the index of this node
            // in the children node list of the parent
            // by the key
            if (virtualNode.key !== null) {
                currentPath.pop();
                currentPath.push(escapeKey(virtualNode.key));
            }

            // Add the component type to the current path
            if (isFunction(virtualNode.type)) {
                currentPath.push(getComponentType(virtualNode.type));
            } else {
                currentPath.push(virtualNode.type);
            }
        }

        arr = arr.filter(item => {
            if (item.parent === appendInfo.current) {
                walk(item, item.current);
                return false;
            }
            return true;
        });

        virtualNode.path = [...currentPath];
        virtualNode.parent = appendInfo.parent;

        if (virtualNode.resolvePath !== undefined) {
            virtualNode.resolvePath();
            delete virtualNode.resolvePath;
        }

        currentPath.length = pivotPathSize;
    }

    walk(rootAppendInfo, rootVirtualNode);

    return rootVirtualNode;
}

function finishResolveVirtualTree() {
    NormallyEmptyAppendedNodeArray.length = 0;
}

function hydrateVirtualTree(virtualNode) {
    // Determine the namespace
    if (virtualNode.type === 'svg') {
        virtualNode.ns = NS_SVG;
    } else {
        if (virtualNode.parent !== null) {
            virtualNode.ns = virtualNode.parent.ns;
        } else {
            virtualNode.ns = NS_HTML;
        }
    }

    // Create the view node
    let viewNode = null;

    if (virtualNode.type === NODE_TEXT) {
        viewNode = craeteDOMTextNode(virtualNode.text);
    } else if (virtualNode.type === NODE_FRAGMENT) {
        // Do nothing here
        // But be careful, removing it changes the condition
    } else if (isString(virtualNode.type)) {
        let viewNS = null;
        if (virtualNode.ns === NS_SVG) {
            viewNS = 'http://www.w3.org/2000/svg';
        }
        viewNode = createDOMElementWithNS(viewNS, virtualNode.type, virtualNode.props);

        // For debug
        viewNode[PROP_VIRTUAL_NODE] = virtualNode;
    }

    linkViewNode(virtualNode, viewNode);

    // Continue with the children
    virtualNode.children.forEach(childVirtualNode => {
        hydrateVirtualTree(childVirtualNode);
    });
}

// =======================================
// Mounting
// =======================================

function mount(rootVirtualNode, container) {
    resolveVirtualTree(rootVirtualNode, [getContainerId(container)]);
    finishResolveVirtualTree();

    const containerVirtualNode = new VirtualNode(container.nodeName.toLowerCase(), {}, null, null);

    linkViewNode(containerVirtualNode, container);

    rootVirtualNode.parent = containerVirtualNode;

    if (container.ownerSVGElement) {
        containerVirtualNode.ns = NS_SVG;
    } else {
        containerVirtualNode.ns = NS_HTML;
    }

    updateVirtualTree(rootVirtualNode, true);
}


// =======================================
// Commit to HTML
// =======================================


function commitToHTML(oldVirtualNodeMap, newVirtualNodeMap) {
    _removeOldViewNodes(oldVirtualNodeMap, newVirtualNodeMap);
    _updateExistingViewNodes(oldVirtualNodeMap, newVirtualNodeMap);
    _insertNewViewNodes(oldVirtualNodeMap, newVirtualNodeMap);
}

function _removeOldViewNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    // If the current node is under the last removed node
    // So dont need to remove current node anymore
    // Use lastRemovedKey to track
    let lastRemovedKey = '';
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key) && !hasOwnProperty(newVirtualNodeMap, key)) {
            if (!key.startsWith(lastRemovedKey + '/')) {
                const oldVirtualNode = oldVirtualNodeMap[key];
                _removeViewNodesOfVirtualNode(oldVirtualNode);
                lastRemovedKey = key;
            }
        }
    }
}

function _updateExistingViewNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    const keys = Object.keys({...oldVirtualNodeMap, ...newVirtualNodeMap});
    keys.forEach(key => {
        if (hasOwnProperty(oldVirtualNodeMap, key) && hasOwnProperty(newVirtualNodeMap, key)) {
            const oldVirtualNode = oldVirtualNodeMap[key];
            const newVirtualNode = newVirtualNodeMap[key];

            linkViewNode(newVirtualNode, oldVirtualNode.viewNode);

            if (newVirtualNode.type === NODE_TEXT) {
                if (newVirtualNode.text !== oldVirtualNode.text) {
                    newVirtualNode.viewNode.textContent = newVirtualNode.text;
                }
            } else {
                updateDOMElementAttributes(newVirtualNode.viewNode, newVirtualNode.props, oldVirtualNode.props);
            }
        }
    });
}

function _insertNewViewNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    let pendingVirtualNodes = [];

    for (let key in newVirtualNodeMap) {
        if (hasOwnProperty(newVirtualNodeMap, key)) {
            if (!hasOwnProperty(oldVirtualNodeMap, key)) {
                pendingVirtualNodes.push(newVirtualNodeMap[key]);
            } else {
                _insertClosestViewNodesOfVirtualNodes(pendingVirtualNodes, oldVirtualNodeMap[key]);
                pendingVirtualNodes.length = 0;
            }
        }
    }

    if (pendingVirtualNodes.length > 0) {
        _insertClosestViewNodesOfVirtualNodes(pendingVirtualNodes, null);
    }
}

function _insertClosestViewNodesOfVirtualNodes(virtualNodes, virtualNodeAfter) {
    const viewNodeAfter = virtualNodeAfter && _findClosestViewNodes(virtualNodeAfter)[0] || null;

    virtualNodes.forEach(virtualNode => {
        if (virtualNode.viewNode !== null) {
            const viewHost = _findViewHost(virtualNode);

            if (viewHost !== null) {
                if (viewNodeAfter !== null && viewHost === viewNodeAfter.parentNode) {
                    viewHost.insertBefore(virtualNode.viewNode, viewNodeAfter);
                } else {
                    viewHost.appendChild(virtualNode.viewNode);
                }
            }
        }
    });
}

function _removeViewNodesOfVirtualNode(virtualNode) {
    _findClosestViewNodes(virtualNode).forEach(viewNode => {
        if (viewNode.parentNode !== null) {
            viewNode.parentNode.removeChild(viewNode);
        }
    });
}

function _findViewHost(virtualNode) {
    if (virtualNode.parent === null) {
        return null;
    }

    if (virtualNode.parent.viewNode === null) {
        return _findViewHost(virtualNode.parent);
    }

    return virtualNode.parent.viewNode;
}

function _findClosestViewNodes(virtualNode) {
    if (virtualNode.viewNode !== null) {
        return [virtualNode.viewNode];
    } else {
        return virtualNode.children.reduce((arr, childVirtualNode) => {
            return arr.concat(_findClosestViewNodes(childVirtualNode));
        }, []);
    }
}


// =======================================
// DOM manipulation
// =======================================


function craeteDOMTextNode(text) {
    return document.createTextNode(text);
}

function createDOMElementWithNS(ns, type, attributes) {
    const node = (ns !== null
        ? document.createElementNS(ns, type)
        : document.createElement(type)
    );

    updateDOMElementAttributes(node, attributes, {});

    return node;
}

function updateDOMElementAttributes(element, newAttributes, oldAttributes) {
    for (let attrName in oldAttributes) {
        if (hasOwnProperty(oldAttributes, attrName)) {
            if (isEmpty(newAttributes[attrName])) {
                _removeDOMElementAttribute(element, attrName, oldAttributes[attrName]);
            }
        }
    }

    for (let attrName in newAttributes) {
        if (hasOwnProperty(newAttributes, attrName)) {
            _setDOMElementAttribute(element, attrName, newAttributes[attrName], oldAttributes[attrName]);
        }
    }
}

function _removeDOMElementAttribute(element, attrName, attrValue) {
    const [name, value] = _transformDOMElementAttribute(attrName, attrValue);
    
    if (isEmpty(value)) {
        return;
    }

    element.removeAttribute(name);
}

function _setDOMElementAttribute(element, attrName, attrValue, oldAttrValue) {
    const [name, value] = _transformDOMElementAttribute(attrName, attrValue);

    if (isEmpty(value)) {
        return;
    }

    if (name === 'style') {
        if (!isEmpty(oldAttrValue)) {
            const [, oldValue] = _transformDOMElementAttribute(attrName, oldAttrValue);
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
            // The property is not wriable
        }
    }
}

function _transformDOMElementAttribute(name, value) {
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
        return [name, ];
    }
    
    if (name === 'style') {
        if (!isEmpty(value) && !isPlainObject(value)) {
            console.error('style must be a plain object', value);
            return [name, ];
        }
    }

    return [name, value];
}


// =======================================
// Helpers
// =======================================


function hasOwnProperty(obj, propName) {
    return Object.prototype.hasOwnProperty.call(obj, propName);
}

function isString(value) {
    return typeof value === 'string' || value instanceof String;
}

function isNumber(value) {
    return typeof value === 'number' || value instanceof Number;
}

function isBoolean(value) {
    return value === true || value === false || value instanceof Boolean;
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


// =======================================
// Exports
// =======================================


export {
    createElement as h,
    mount,
    useState,
    useEffect,
    useRef,
};
