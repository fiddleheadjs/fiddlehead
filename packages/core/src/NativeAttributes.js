import {hasOwnProperty, isFunction, isNumber, isString} from './Util';
import {NAMESPACE_HTML, NAMESPACE_SVG} from './VNode';

const MAY_BE_ATTR_OR_PROP = 0;
const MUST_BE_ATTR = 1;
const MUST_BE_PROP = 2;

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

let _updateElementAttribute = (namespace, element, attrName, newAttrValue, oldAttrValue) => {
    attrName = _normalizeElementAttributeName(namespace, attrName);

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

    let mayBe = _mayBeAttributeOrProperty(namespace, element, attrName, newAttrValue);

    if (mayBe === MUST_BE_PROP || mayBe === MAY_BE_ATTR_OR_PROP) {
        try {
            element[attrName] = newAttrValue;
        } catch (x) {
            // Property may not writable
        }
    }

    if (mayBe === MUST_BE_ATTR || mayBe === MAY_BE_ATTR_OR_PROP) {
        element.setAttribute(attrName, newAttrValue);
    }
};

let _removeElementAttribute = (namespace, element, attrName, oldAttrValue) => {
    attrName = _normalizeElementAttributeName(namespace, attrName);

    if (attrName === '') {
        return;
    }

    if (attrName === 'style') {
        _updateStyleProperties(element[attrName], null, oldAttrValue);

        // Clean up HTML code
        element.removeAttribute(attrName);
        return;
    }

    let mayBe = _mayBeAttributeOrProperty(namespace, element, attrName, oldAttrValue);

    if (mayBe === MUST_BE_PROP || mayBe === MAY_BE_ATTR_OR_PROP) {
        try {
            element[attrName] = null;
        } catch (x) {
            // Property may not writable
        }
    }

    if (mayBe === MUST_BE_ATTR || mayBe === MAY_BE_ATTR_OR_PROP) {
        element.removeAttribute(attrName);
    }
};

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

let _mayBeAttributeOrProperty = (namespace, element, attrName, attrValue) => {
    if (!(
        isString(attrValue) ||
        isNumber(attrValue)
    )) {
        return MUST_BE_PROP;
    }

    if (
        attrName === 'innerHTML' ||
        attrName === 'innerText' ||
        attrName === 'textContent'
    ) {
        return MUST_BE_PROP;
    }

    if (namespace === NAMESPACE_HTML) {
        if (
            attrName === 'href' ||
            attrName === 'list' ||
            attrName === 'form' ||
            attrName === 'download'
        ) {
            return MUST_BE_ATTR;
        }

        if (attrName in element) {
            return MAY_BE_ATTR_OR_PROP;
        }
    }
    
    return MUST_BE_ATTR;
};

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
