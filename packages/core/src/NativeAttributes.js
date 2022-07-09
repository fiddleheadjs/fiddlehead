import {hasOwnProperty, isNumber, isString} from './Util';

export let updateNativeTextContent = (node, text) => {
    if (node.textContent !== text) {
        node.textContent = text;
    }
}

export let updateNativeElementAttributes = (element, newAttributes, oldAttributes) => {
    _updateKeyValues(
        element, newAttributes, oldAttributes,
        _updateElementAttribute, _removeElementAttribute
    );
}

let _updateElementAttribute = (element, attrName, newAttrValue, oldAttrValue) => {
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
        } catch (x) {
            // Property may not writable
        }
    }
}

let _removeElementAttribute = (element, attrName, oldAttrValue) => {
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

let _normalizeElementAttributeName = (attrName) => {
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

let _canBeAttribute = (name, value) => {
    if (name === 'innerHTML' || name === 'innerText' || name === 'textContent') {
        return false;
    }

    if (!(isString(value) || isNumber(value))) {
        return false;
    }

    return true;
}

let _updateStyleProperties = (style, newProperties, oldProperties) => {
    _updateKeyValues(
        style, newProperties, oldProperties,
        _updateStyleProperty, _removeStyleProperty
    );
}

let _updateStyleProperty = (style, propName, newPropValue) => {
    style[propName] = newPropValue;
}

let _removeStyleProperty = (style, propName) => {
    style[propName] = '';
}

let _updateKeyValues = (target, newKeyValues, oldKeyValues, updateFn, removeFn) => {
    let oldEmpty = oldKeyValues == null; // is nullish
    let newEmpty = newKeyValues == null; // is nullish

    let key;

    if (oldEmpty) {
        if (newEmpty) {
            // Do nothing here
        } else {
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
                if (_hasOwnNonEmpty(newKeyValues, key)) {
                    // Do nothing here
                } else {
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

let _hasOwnNonEmpty = (target, prop) => {
    return (
        hasOwnProperty.call(target, prop)
        && target[prop] != null // is not nulllish
    );
}
