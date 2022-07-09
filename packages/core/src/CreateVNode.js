import {createVNodeFromJSXElement, JSXElement} from './JSXElement';
import {createVNodeFromPortalElement, PortalElement} from './PortalElement';
import {isArray, isNumber, isString} from './Util';
import {Fragment, TextNode, VNode} from './VNode';
import {setChildrenFromContent} from './SetChildren';

/**
 *
 * @param {any} content
 * @return {VNode|null}
 */
export let createVNodeFromContent = (content) => {
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
        let fragment = new VNode(Fragment, null);
        setChildrenFromContent(fragment, content);
        return fragment;
    }

    if (content instanceof PortalElement) {
        return createVNodeFromPortalElement(content);
    }

    return null;
}
