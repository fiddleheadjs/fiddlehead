// Do not support namespace MathML as almost browsers do not support as well
var NAMESPACE_HTML = 0;
var NAMESPACE_SVG = 1; // Special node types

var TextNode = '#';
var Fragment = '[';

var Portal = function Portal(props) {
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

  this.slot_ = null; // Props and hooks
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

  this.effectHook_ = null; // Output native node and relates
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

  this.ref_ = null; // Linked-list pointers
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

  this.sibling_ = null; // Temporary properties
  // ====================
  // The previous version of this node

  /**
   * @type {VNode|null}
   */

  this.alternate_ = null; // The children (and their subtrees, of course) are marked to be deleted

  /**
   * @type {VNode[]|null}
   */

  this.deletions_ = null; // Insertion flag.
  // To be used to optimize the painting process

  /**
   * @type {number|null}
   */

  this.insertion_ = null; // If this node is a mounting point, this property tracks the native child
  // that will be used as the reference node to insert the new child after it

  /**
   * @type {Node|null}
   */

  this.mountingRef_ = null; // Timeout ID.
  // After updating states, we need to re-render the subtree to display the up-to-date UI.
  // But when we batching updates, we use this property to re-render only highest node
  // which also needs re-rendering

  /**
   * @type {number|null}
   */

  this.updateId_ = null;
}

var PROP_VNODE = '%vnode';
/**
 * 
 * @param {Node} nativeNode 
 * @param {VNode} vnode 
 */

var attachVNodeToNativeNode = function attachVNodeToNativeNode(nativeNode, vnode) {
  nativeNode[PROP_VNODE] = vnode;
};
/**
 * 
 * @param {Node} nativeNode 
 * @returns {VNode|undefined}
 */


var extractVNodeFromNativeNode = function extractVNodeFromNativeNode(nativeNode) {
  return nativeNode[PROP_VNODE];
};
/**
 * 
 * @param {VNode} vnode 
 * @param {Node} nativeNode
 */


var linkNativeNodeWithVNode = function linkNativeNodeWithVNode(vnode, nativeNode) {
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


var createPortal = function createPortal(content, nativeNode) {
  return new PortalElement(content, nativeNode);
};
/**
 * 
 * @param {PortalElement} element
 * @returns {VNode}
 */


var createVNodeFromPortalElement = function createVNodeFromPortalElement(element) {
  var vnode = new VNode(Portal, {
    children: element.content_
  }); // Determine the namespace (we only support SVG and HTML namespaces)

  vnode.namespace_ = 'ownerSVGElement' in element.nativeNode_ ? NAMESPACE_SVG : NAMESPACE_HTML;
  linkNativeNodeWithVNode(vnode, element.nativeNode_); // Do not attach the vnode to the native node,
  // Because many portals can share the same native node.

  return vnode;
}; // The mounting point is a virtual node which has a native node (not null)
// It means that a mounting point can contains native children

/**
 * 
 * @param {VNode} current 
 * @returns {VNode}
 */


var resolveMountingPoint = function resolveMountingPoint(current) {
  while (true) {
    if (current === null) {
      return null;
    }

    if (current.nativeNode_ !== null) {
      return current;
    }

    current = current.parent_;
  }
}; // Walk through native children of a parent

/**
 * 
 * @param {function} callback 
 * @param {VNode} parent 
 * @param {VNode?} stopBefore
 * @returns {void}
 */


var walkNativeChildren = function walkNativeChildren(callback, parent, stopBefore) {
  var current = parent.child_;

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

var hasOwnProperty = Object.prototype.hasOwnProperty;
var slice = Array.prototype.slice;

var isString = function isString(value) {
  return typeof value === 'string'
  /* || value instanceof String*/
  ;
};

var isNumber = function isNumber(value) {
  return typeof value === 'number'
  /* || value instanceof Number*/
  ;
};

var isFunction = function isFunction(value) {
  return typeof value === 'function';
};

var isArray = function isArray(value) {
  return value instanceof Array;
};
/**
 * 
 * @param {Array} a 
 * @param {Array} b 
 * @returns {boolean}
 */


var compareArrays = function compareArrays(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  for (var i = a.length - 1; i >= 0; --i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
};

var updateNativeTextContent = function updateNativeTextContent(node, newText, oldText) {
  if (newText !== oldText) {
    node.textContent = newText;
  }
};

var updateNativeElementAttributes = function updateNativeElementAttributes(element, newAttributes, oldAttributes) {
  _updateKeyValues(element, newAttributes, oldAttributes, _updateElementAttribute, _removeElementAttribute);
};

var _updateElementAttribute = function _updateElementAttribute(element, attrName, newAttrValue, oldAttrValue) {
  attrName = _normalizeElementAttributeName(attrName);

  if (attrName === '') {
    return;
  }

  if (attrName === 'style') {
    _updateStyleProperties(element[attrName], newAttrValue, oldAttrValue);

    return;
  }

  if (newAttrValue === oldAttrValue) {
    return;
  }

  if (attrName in element) {
    // Handles as properties first
    try {
      element[attrName] = newAttrValue;
    } catch (x) {// Property may not writable
    }
  }

  if (_canBeAttribute(attrName, newAttrValue)) {
    element.setAttribute(attrName, newAttrValue);
  }
};

var _removeElementAttribute = function _removeElementAttribute(element, attrName, oldAttrValue) {
  attrName = _normalizeElementAttributeName(attrName);

  if (attrName === '') {
    return;
  }

  if (attrName === 'style') {
    _updateStyleProperties(element[attrName], null, oldAttrValue); // Clean up HTML code


    element.removeAttribute(attrName);
    return;
  }

  if (attrName in element) {
    // Handles as properties first
    try {
      element[attrName] = null;
    } catch (x) {// Property may not writable
    }
  }

  if (_canBeAttribute(attrName, oldAttrValue)) {
    element.removeAttribute(attrName);
  }
};

var _normalizeElementAttributeName = function _normalizeElementAttributeName(attrName) {
  // Support React className
  if (attrName === 'className') {
    return 'class';
  } // Support camelcase event listener bindings


  if (attrName.length >= 4 && // at least 4 chars
  attrName.charCodeAt(0) === 111 && // 1st char is o
  attrName.charCodeAt(1) === 110 && // 2nd char is n
  attrName.charCodeAt(2) <= 90 && attrName.charCodeAt(2) >= 65 // 3rd char is [A-Z]
  ) {
    return attrName.toLowerCase();
  }

  return attrName;
};

var _canBeAttribute = function _canBeAttribute(name, value) {
  if (name === 'innerHTML' || name === 'innerText' || name === 'textContent') {
    return false;
  }

  if (!(isString(value) || isNumber(value))) {
    return false;
  }

  return true;
};

var _updateStyleProperties = function _updateStyleProperties(style, newProperties, oldProperties) {
  _updateKeyValues(style, newProperties, oldProperties, _updateStyleProperty, _removeStyleProperty);
};

var _updateStyleProperty = function _updateStyleProperty(style, propName, newPropValue) {
  style[propName] = newPropValue;
};

var _removeStyleProperty = function _removeStyleProperty(style, propName) {
  style[propName] = '';
};

var _updateKeyValues = function _updateKeyValues(target, newKeyValues, oldKeyValues, updateFn, removeFn) {
  var oldEmpty = oldKeyValues == null; // is nullish

  var newEmpty = newKeyValues == null; // is nullish

  var key;

  if (oldEmpty) {
    if (newEmpty) ;else {
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
        if (_hasOwnNonEmpty(newKeyValues, key)) ;else {
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
};

var _hasOwnNonEmpty = function _hasOwnNonEmpty(target, prop) {
  return hasOwnProperty.call(target, prop) && target[prop] != null // is not nulllish
  ;
};

var createNativeTextNode = function createNativeTextNode(text) {
  return document.createTextNode(text);
};

var createNativeElementWithNS = function createNativeElementWithNS(ns, type, attributes) {
  var element = ns === NAMESPACE_SVG ? document.createElementNS('http://www.w3.org/2000/svg', type) : document.createElement(type);
  updateNativeElementAttributes(element, attributes);
  return element;
};

var removeNativeNode = function removeNativeNode(nativeNode) {
  if (nativeNode.parentNode !== null) {
    nativeNode.parentNode.removeChild(nativeNode);
  }
};

var insertNativeNodeAfter = function insertNativeNodeAfter(parent, newChild, childBefore) {
  parent.insertBefore(newChild, childBefore !== null ? childBefore.nextSibling : parent.firstChild);
}; // Important!!!
// This module does not handle Portal nodes


var hydrateView = function hydrateView(vnode) {
  vnode.namespace_ = _determineNS(vnode); // Do nothing more with fragments

  if (_isDry(vnode.type_)) {
    return;
  }

  var nativeNode;

  if (vnode.type_ === TextNode) {
    nativeNode = createNativeTextNode(vnode.props_);
  } else {
    nativeNode = createNativeElementWithNS(vnode.namespace_, vnode.type_, vnode.props_);
  }

  linkNativeNodeWithVNode(vnode, nativeNode);

  if (true) {
    attachVNodeToNativeNode(nativeNode, vnode);
  }
};

var rehydrateView = function rehydrateView(newVNode, oldVNode) {
  newVNode.namespace_ = _determineNS(newVNode); // Do nothing more with fragments

  if (_isDry(newVNode.type_)) {
    return;
  } // Reuse the existing native node


  linkNativeNodeWithVNode(newVNode, oldVNode.nativeNode_);

  if (true) {
    attachVNodeToNativeNode(oldVNode.nativeNode_, newVNode);
  }

  if (newVNode.type_ === TextNode) {
    updateNativeTextContent(newVNode.nativeNode_, newVNode.props_, oldVNode.props_);
  } else {
    updateNativeElementAttributes(newVNode.nativeNode_, newVNode.props_, oldVNode.props_);
  }
}; // We only support HTML and SVG namespaces
// as the most of browsers support


var _determineNS = function _determineNS(vnode) {
  // Intrinsic namespace
  if (vnode.type_ === 'svg') {
    return NAMESPACE_SVG;
  } // As we never hydrate the container node,
  // the parent_ never empty here


  if (vnode.parent_.namespace_ === NAMESPACE_SVG && vnode.parent_.type_ === 'foreignObject') {
    return NAMESPACE_HTML;
  } // By default, pass namespace below.


  return vnode.parent_.namespace_;
}; // Check if a node type cannot be hydrated


var _isDry = function _isDry(type) {
  return type === Fragment || isFunction(type);
}; // Important!!!
// This module does not handle Portal nodes


var updateView = function updateView(newVNode, oldVNode) {
  rehydrateView(newVNode, oldVNode);

  if (newVNode.nativeNode_ !== null) {
    var mpt = resolveMountingPoint(newVNode.parent_);

    if (mpt !== null) {
      mpt.mountingRef_ = newVNode.nativeNode_;
    }
  }
};

var insertView = function insertView(vnode) {
  if (vnode.nativeNode_ !== null) {
    var mpt = resolveMountingPoint(vnode.parent_);

    if (mpt !== null) {
      insertNativeNodeAfter(mpt.nativeNode_, vnode.nativeNode_, mpt.mountingRef_);
      mpt.mountingRef_ = vnode.nativeNode_;
    }
  }
};

var deleteView = function deleteView(vnode) {
  if (vnode.nativeNode_ !== null) {
    removeNativeNode(vnode.nativeNode_);
  } else {
    walkNativeChildren(removeNativeNode, vnode);
  }
};

var currentVNode = null;
var currentRefHook = null;
var currentStateHook = null;
var currentEffectHook = null;

var prepareCurrentlyProcessing = function prepareCurrentlyProcessing(functionalVNode) {
  currentVNode = functionalVNode;
};

var flushCurrentlyProcessing = function flushCurrentlyProcessing() {
  currentVNode = null;
  currentRefHook = null;
  currentStateHook = null;
  currentEffectHook = null;
};

var resolveRootVNode = function resolveRootVNode() {
  _throwIfCallInvalid();

  var vnode = currentVNode;

  while (vnode.parent_ !== null) {
    vnode = vnode.parent_;
  }

  return vnode;
};

var resolveCurrentRefHook = function resolveCurrentRefHook(createHookFn, processFn) {
  _throwIfCallInvalid();

  currentRefHook = _resolveCurrentHookImpl(createHookFn, currentRefHook, currentVNode.refHook_);

  if (currentVNode.refHook_ === null) {
    currentVNode.refHook_ = currentRefHook;
  }

  return processFn(currentRefHook);
};

var resolveCurrentStateHook = function resolveCurrentStateHook(createHookFn, processFn) {
  _throwIfCallInvalid();

  currentStateHook = _resolveCurrentHookImpl(createHookFn, currentStateHook, currentVNode.stateHook_);

  if (currentVNode.stateHook_ === null) {
    currentVNode.stateHook_ = currentStateHook;
  }

  return processFn(currentStateHook);
};

var resolveCurrentEffectHook = function resolveCurrentEffectHook(createHookFn, processFn) {
  _throwIfCallInvalid();

  currentEffectHook = _resolveCurrentHookImpl(createHookFn, currentEffectHook, currentVNode.effectHook_);

  if (currentVNode.effectHook_ === null) {
    currentVNode.effectHook_ = currentEffectHook;
  }

  return processFn(currentEffectHook);
};

var _resolveCurrentHookImpl = function _resolveCurrentHookImpl(createHookFn, currentHook, firstHookOfNode) {
  if (currentHook === null) {
    if (firstHookOfNode === null) {
      return createHookFn(currentVNode);
    } else {
      return firstHookOfNode;
    }
  } else {
    if (currentHook.next_ === null) {
      var nextHook = createHookFn(currentVNode);
      currentHook.next_ = nextHook;
      return nextHook;
    } else {
      return currentHook.next_;
    }
  }
};

var _throwIfCallInvalid = function _throwIfCallInvalid() {
  if (currentVNode === null) {
    throw new Error('Cannot use hooks from outside of components');
  }
};

var STATE_NORMAL = 0;
var STATE_ERROR = 1;
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

var useState = function useState(initialValue) {
  return resolveCurrentStateHook(function (currentVNode) {
    return new StateHook(STATE_NORMAL, initialValue, currentVNode);
  }, function (currentHook) {
    return [currentHook.value_, currentHook.setValue_];
  });
};

var useError = function useError() {
  return resolveCurrentStateHook(function (currentVNode) {
    // Make sure we have only one error hook in a component
    if (true) {
      var hook = currentVNode.stateHook_;

      while (hook !== null) {
        if (hook.tag_ === STATE_ERROR) {
          console.error('A component accepts only one useError hook');
        }

        hook = hook.next_;
      }
    }

    return new StateHook(STATE_ERROR, null, currentVNode);
  }, function (currentHook) {
    return [currentHook.value_, function () {
      currentHook.setValue_(null);
    }];
  });
};

var _setState = function _setState(value) {
  var newValue;

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
    this.value_ = newValue; // Schedule a work to update the UI

    if (this.context_.updateId_ === null) {
      this.context_.updateId_ = setTimeout(_flushUpdates, 0, this);
    }
  }
};

var _flushUpdates = function _flushUpdates(hook) {
  // Find the highest node also has pending updates
  var highestContext = null;
  var current = hook.context_;

  while (current !== null) {
    if (current.updateId_ !== null) {
      highestContext = current;
    }

    current = current.parent_;
  } // Re-render tree from the highest node


  if (highestContext !== null) {
    renderTree(highestContext);
  }
};

var catchError = function catchError(error, vnode) {
  var parent = vnode.parent_;
  var hook;

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
};

var EFFECT_NORMAL = 0;
var EFFECT_LAYOUT = 1;
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
  this.next_ = null;
}

var useEffect = function useEffect(callback, deps) {
  return _useEffectImpl(EFFECT_NORMAL, callback, deps);
};

var useLayoutEffect = function useLayoutEffect(callback, deps) {
  return _useEffectImpl(EFFECT_LAYOUT, callback, deps);
};

var _useEffectImpl = function _useEffectImpl(tag, callback, deps) {
  if (deps === undefined) {
    deps = null;
  }

  return resolveCurrentEffectHook(function (currentVNode) {
    return new EffectHook(tag, callback, deps);
  }, function (currentHook) {
    if (true) {
      if (!(deps === null && currentHook.deps_ === null || deps.length === currentHook.deps_.length)) {
        throw new Error('Deps must be size-fixed');
      } // On the production, we accept the deps change its length
      // and consider it is changed

    }

    currentHook.callback_ = callback;
    currentHook.deps_ = deps;
  });
};
/**
 *
 * @param {number} effectTag
 * @param {VNode} vnode
 * @param {boolean} isNewlyMounted
 */


var mountEffects = function mountEffects(effectTag, vnode, isNewlyMounted) {
  var hook = vnode.effectHook_;

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
};
/**
 * @param {number} effectTag
 * @param {VNode} vnode
 * @param {boolean} isUnmounted
 */


var destroyEffects = function destroyEffects(effectTag, vnode, isUnmounted) {
  var hook = vnode.effectHook_;

  while (hook !== null) {
    if (hook.tag_ === effectTag) {
      if (hook.destroy_ !== null) {
        if (isUnmounted || _mismatchDeps(hook.deps_, hook.lastDeps_)) {
          try {
            hook.destroy_();
          } catch (error) {
            catchError(error, vnode);
          }
        }
      }
    }

    hook = hook.next_;
  }
};
/**
 *
 * @param {EffectHook} hook
 */


var _mountEffect = function _mountEffect(hook) {
  // Save the last deps for the next time
  hook.lastDeps_ = hook.deps_; // Run the effect callback

  hook.destroy_ = hook.callback_();

  if (hook.destroy_ === undefined) {
    hook.destroy_ = null;
  }
};
/**
 * 
 * @param {[]|null} deps 
 * @param {[]|null} lastDeps 
 * @returns {boolean}
 */


var _mismatchDeps = function _mismatchDeps(deps, lastDeps) {
  // Always
  if (deps === null) {
    return true;
  } // Lazy


  if (deps.length === 0) {
    return false;
  } // Deps
  // 1. When init effect


  if (lastDeps === null) {
    return false;
  } // 2. Two arrays are equal


  if (compareArrays(deps, lastDeps)) {
    return false;
  } // DepsChanged


  {
    return true;
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


var createRef = function createRef(initialValue) {
  return new Ref(initialValue);
};
/**
 *
 * @param {any} initialValue
 */


var useRef = function useRef(initialValue) {
  return resolveCurrentRefHook(function (currentVNode) {
    return new RefHook(initialValue);
  }, function (currentHook) {
    return currentHook.ref_;
  });
};
/**
 * 
 * @param {VNode} current
 * @param {any[]} content
 */


var setChildrenFromContent = function setChildrenFromContent(current, content) {
  var child,
      prevChild = null,
      i = 0;

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


var setOnlyChildFromContent = function setOnlyChildFromContent(current, content) {
  var child = createVNodeFromContent(content);

  if (child !== null) {
    current.child_ = child;
    child.parent_ = current; // Don't need to set the slot property
    // as this node have only one child
  }
}; // Use the same empty object to save memory.
// Do NOT mutate it


var emptyProps = {};
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


var createElement = function createElement(type, props, content) {
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


var createVNodeFromJSXElement = function createVNodeFromJSXElement(element) {
  // Type and content
  var type = element.type_;
  var content = element.content_;
  var isFunctionalType = isFunction(type);
  var hasContent = content !== undefined; // Resolve props

  var props = element.props_;
  var key = null;
  var ref = null;

  if (props === null) {
    // Functional types always need the props to be an object
    if (isFunctionalType) {
      if (hasContent) {
        props = {
          children: content
        };
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
    } // Set children for functional types
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
          if (true) {
            console.error('The ref property is invalid');
          }
        }

        delete props.ref;
      }
    }
  } // Initialize the node


  var vnode = new VNode(type, props); // Set key and ref

  vnode.key_ = key;
  vnode.ref_ = ref; // Set children

  if (hasContent) {
    if (isFunctionalType) ;else if (type === TextNode) {
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


var createVNodeFromContent = function createVNodeFromContent(content) {
  if (content instanceof JSXElement) {
    return createVNodeFromJSXElement(content);
  }

  if (isString(content)) {
    return new VNode(TextNode, content);
  }

  if (isNumber(content)) {
    return new VNode(TextNode, '' + content);
  }

  if (isArray(content)) {
    var fragment = new VNode(Fragment, null);
    setChildrenFromContent(fragment, content);
    return fragment;
  }

  if (content instanceof PortalElement) {
    return createVNodeFromPortalElement(content);
  }

  return null;
};

var reconcileChildren = function reconcileChildren(current, isRenderRoot) {
  if (isFunction(current.type_)) {
    _reconcileOnlyChildOfDynamicNode(current, current.alternate_, isRenderRoot);
  } else if (current.alternate_ !== null) {
    _reconcileChildrenOfStaticNode(current, current.alternate_);
  }
};

var _reconcileOnlyChildOfDynamicNode = function _reconcileOnlyChildOfDynamicNode(current, alternate, isRenderRoot) {
  if (alternate !== null) {
    // Copy hooks
    current.refHook_ = alternate.refHook_;
    current.stateHook_ = alternate.stateHook_;
    current.effectHook_ = alternate.effectHook_; // Update contexts of state hooks

    var stateHook = current.stateHook_;

    while (stateHook !== null) {
      stateHook.context_ = current;
      stateHook = stateHook.next_;
    } // Transfer the update ID


    current.updateId_ = alternate.updateId_;
    alternate.updateId_ = null;
  }

  var newContent;
  prepareCurrentlyProcessing(current);

  try {
    newContent = current.type_(current.props_);
  } catch (error) {
    catchError(error, current);
    newContent = null;
  }

  flushCurrentlyProcessing();
  var newChild = createVNodeFromContent(newContent);

  if (newChild !== null) {
    newChild.parent_ = current; // Don't need to set the slot property
    // as a dynamic node can have only one child
  }

  var oldChild = isRenderRoot ? current.child_ : alternate !== null ? alternate.child_ : null;

  if (oldChild !== null) {
    if (newChild !== null && newChild.type_ === oldChild.type_ && newChild.key_ === oldChild.key_) {
      _markAlternate(newChild, oldChild);
    } else {
      _addDeletion(current, oldChild);
    }
  }

  current.child_ = newChild;
};

var _reconcileChildrenOfStaticNode = function _reconcileChildrenOfStaticNode(current, alternate) {
  var oldChildren = _mapChildren(alternate);

  var newChildren = _mapChildren(current);

  var newChild;
  oldChildren.forEach(function (oldChild, mapKey) {
    newChild = newChildren.get(mapKey);

    if (newChild !== undefined && newChild.type_ === oldChild.type_) {
      _markAlternate(newChild, oldChild);
    } else {
      _addDeletion(current, oldChild);
    }
  });
};

var _markAlternate = function _markAlternate(newChild, oldChild) {
  newChild.alternate_ = oldChild;
};

var _addDeletion = function _addDeletion(current, childToDelete) {
  if (current.deletions_ === null) {
    current.deletions_ = [childToDelete];
  } else {
    current.deletions_.push(childToDelete);
  }
};

var _mapChildren = function _mapChildren(node) {
  var map = new Map();
  var child = node.child_;

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


var renderTree = function renderTree(current) {
  var effectMountNodes = new Map();
  var effectDestroyNodes = new Map(); // The mounting point of the current

  var mpt = resolveMountingPoint(current); // In the tree, the mounting point lies at a higher level
  // than the current, so we need to initialize/cleanup
  // its temporary properties from outside of the work loop

  walkNativeChildren(function (nativeChild) {
    mpt.mountingRef_ = nativeChild;
  }, mpt, current); // Main work

  _workLoop(_performUnitOfWork, _onReturn, current, effectMountNodes, effectDestroyNodes); // Cleanup


  mpt.mountingRef_ = null; // Layout effects

  effectDestroyNodes.forEach(function (isUnmounted, vnode) {
    destroyEffects(EFFECT_LAYOUT, vnode, isUnmounted);
  });
  effectMountNodes.forEach(function (isNewlyMounted, vnode) {
    mountEffects(EFFECT_LAYOUT, vnode, isNewlyMounted);
  }); // Effects

  setTimeout(function () {
    effectDestroyNodes.forEach(function (isUnmounted, vnode) {
      destroyEffects(EFFECT_NORMAL, vnode, isUnmounted);
    });
    effectMountNodes.forEach(function (isNewlyMounted, vnode) {
      mountEffects(EFFECT_NORMAL, vnode, isNewlyMounted);
    });
  });
}; // Optimize insertion to reduce reflow number


var INSERT_ON_RETURN = 0;
var INSERT_OFFSCREEN = 1;

var _performUnitOfWork = function _performUnitOfWork(current, root, effectMountNodes, effectDestroyNodes) {
  var isRenderRoot = current === root; // Reconcile current's children

  reconcileChildren(current, isRenderRoot); // Portal nodes never change the view itself

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
  } // Delete subtrees that no longer exist


  if (current.deletions_ !== null) {
    for (var i = 0; i < current.deletions_.length; ++i) {
      deleteView(current.deletions_[i]);

      _workLoop(function (deleted) {
        if (deleted.effectHook_ !== null) {
          effectDestroyNodes.set(deleted, true);
        } // Important!!!
        // Cancel the update schedule on the deleted nodes


        if (deleted.updateId_ !== null) {
          clearTimeout(deleted.updateId_);
          deleted.updateId_ = null;
        }
      }, null, current.deletions_[i]);
    }

    current.deletions_ = null;
  } // Cancel the update schedule on the current node


  if (current.updateId_ !== null) {
    clearTimeout(current.updateId_);
    current.updateId_ = null;
  }
}; // Callback called after walking through a node and all of its ascendants


var _onReturn = function _onReturn(current) {
  // Process the insert-on-return node before walk out of its subtree
  if (current.insertion_ === INSERT_ON_RETURN) {
    insertView(current);
  } // This is when we cleanup the remaining temporary properties


  current.mountingRef_ = null;
  current.insertion_ = null;
}; // Reference: https://github.com/facebook/react/issues/7942


var _workLoop = function _workLoop(performUnit, onReturn, root, D0, D1) {
  var current = root;

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
};
/**
 * 
 * @param {any} children 
 * @param {Element} targetNativeNode
 */


var render = function render(children, targetNativeNode) {
  var root = extractVNodeFromNativeNode(targetNativeNode);

  if (root) {
    // Update the children
    root.props_.children = children;
  } else {
    // Create a new root
    if (true) {
      if (targetNativeNode.firstChild) {
        console.error('Target node must be empty');
      }
    }

    var portalElement = createPortal(children, targetNativeNode);
    root = createVNodeFromPortalElement(portalElement);
    attachVNodeToNativeNode(targetNativeNode, root);
  }

  renderTree(root);
};

export { Fragment, TextNode, createElement, createPortal, createRef, createElement as jsx, render, resolveRootVNode, useEffect, useError, useLayoutEffect, useRef, useState };