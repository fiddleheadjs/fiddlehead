import {hasOwnProperty, isFunction, theSame} from './Util';
import {NAMESPACE_HTML, NAMESPACE_SVG} from './VNode';

export let updateNativeTextContent = (node, newText, oldText) => {
    if (newText !== oldText) {
        node.textContent = newText;
    }
};

export let updateNativeElementAttributes = (namespace, element, newAttributes, oldAttributes) => {
    _updateKeyValues(
        namespace, element, newAttributes, oldAttributes,
        _updateElementAttribute, _removeElementAttribute
    );
};

// #StartBlock ElementAttributes

const MANIPULATE_AS_STYLE = 1;
const MANIPULATE_AS_PROPERTY = 2;
const MANIPULATE_AS_ATTRIBUTE = 3;
const MANIPULATE_AS_PROPERTY_AND_ATTRIBUTE = 4;

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

// Should not depend on attribute values,
// as it may lead to different names
// with the old value and new value
let _normalizeElementAttributeName = (namespace, attrName) => {
    // Normalize className to class
    if (attrName === 'className') {
        return 'class';
    }

    // Support camelcase event listener bindings
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

let _updateStyleProperties = (style, newProperties, oldProperties) => {
    _updateKeyValues(
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

let _updateKeyValues = (namespace, target, newKeyValues, oldKeyValues, updateFn, removeFn) => {
    let oldEmpty = oldKeyValues == null; // is nullish
    let newEmpty = newKeyValues == null; // is nullish

    let key;

    if (oldEmpty) {
        if (newEmpty) {
            // Do nothing here
        } else {
            for (key in newKeyValues) {
                if (_hasOwnNonEmpty(newKeyValues, key)) {
                    updateFn(namespace, target, key, newKeyValues[key]);
                }
            }
        }
    } else if (newEmpty) {
        for (key in oldKeyValues) {
            if (_hasOwnNonEmpty(oldKeyValues, key)) {
                removeFn(namespace, target, key, oldKeyValues[key]);
            }
        }
    } else {
        for (key in oldKeyValues) {
            if (_hasOwnNonEmpty(oldKeyValues, key)) {
                if (_hasOwnNonEmpty(newKeyValues, key)) {
                    // Do nothing here
                } else {
                    removeFn(namespace, target, key, oldKeyValues[key]);
                }
            }
        }
        for (key in newKeyValues) {
            if (_hasOwnNonEmpty(newKeyValues, key)) {
                updateFn(namespace, target, key, newKeyValues[key], oldKeyValues[key]);
            }
        }
    }
};

let _hasOwnNonEmpty = (target, prop) => {
    return (
        hasOwnProperty.call(target, prop)
        && target[prop] != null // is not nulllish
    );
};
