import {hasOwnProperty, isFunction, theSame} from './Util';
import {NAMESPACE_HTML, NAMESPACE_SVG} from './VNode';

/**
 * 
 * @param {Text} node 
 * @param {string} newText 
 * @param {string} oldText 
 */
export let updateNativeTextContent = (node, newText, oldText) => {
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
export let updateNativeElementAttributes = (namespace, element, newAttributes, oldAttributes) => {
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

    if (__DEV__) {
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
        if (newEmpty) {
            // Do nothing here
        } else {
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
                if (_hasOwnNonEmpty(newKVs, key)) {
                    // Do nothing here
                } else {
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
