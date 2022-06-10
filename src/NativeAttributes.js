import {hasOwnProperty, isNullish, isNumber, isString} from './Util';

export function updateNativeTextContent(node, text) {
    if (node.textContent !== text) {
        node.textContent = text;
    }
}

export function updateNativeElementAttributes(element, newAttributes, oldAttributes) {
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
        _updateStyleProperties(element[attrName], newAttrValue, oldAttrValue);
        return;
    }

    if (_canBeAttribute(attrName, newAttrValue)) {
        element.setAttribute(attrName, newAttrValue);
        // Continue handle as properties
    }
    if (attrName in element) {
        try {
            element[attrName] = newAttrValue;
            return;
        } catch (x) {
            // Property may not writable
        }
    }
}

function _removeElementAttribute(element, attrName, oldAttrValue) {
    attrName = _normalizeElementAttributeName(attrName);
    
    if (attrName === '') {
        return;
    }

    if (attrName === 'style') {
        _updateStyleProperties(element[attrName], null, oldAttrValue);

        // Clean up HTML code
        element.removeAttribute(attrName);
        return;
    }

    if (_canBeAttribute(attrName, oldAttrValue)) {
        element.removeAttribute(attrName);
        // Continue handle as properties
    }
    if (attrName in element) {
        try {
            element[attrName] = null;
        } catch (x) {
            // Property may not writable
        }
    }
}

function _normalizeElementAttributeName(attrName) {
    // Support React className
    if (attrName === 'className') {
        return 'class';
    }

    // Support camelcase event listener bindings
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
    const newEmpty = isNullish(newKeyValues);
    const oldEmpty = isNullish(oldKeyValues);
    
    if (newEmpty && oldEmpty) {
        return;
    }

    let key;

    if (newEmpty) {
        for (key in oldKeyValues) {
            if (_hasOwnNonEmpty(oldKeyValues, key)) {
                removeFn(target, key, oldKeyValues[key]);
            }
        }
        return;
    }

    if (oldEmpty) {
        for (key in newKeyValues) {
            if (_hasOwnNonEmpty(newKeyValues, key)) {
                updateFn(target, key, newKeyValues[key]);
            }
        }
        return;
    }
    
    {
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
}

function _hasOwnNonEmpty(target, prop) {
    return (
        hasOwnProperty.call(target, prop)
        && !isNullish(target[prop])
    );
}

function _canBeAttribute(name, value) {
    if (name === 'innerHTML' || name === 'innerText' || name === 'textContent') {
        return false;
    }

    if (!(isString(value) || isNumber(value))) {
        return false;
    }

    return true;
}
