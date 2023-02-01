import {jsx, render, useCatch, useRef, useState} from 'core.pkg';

export let App = () => {
    let [error] = useCatch();

    return (
        <main>
            <div role="alert">{error !== null ? 'Something went wrong' : ''}</div>
            <DocumentPortal>
                <StatefulComponent />
            </DocumentPortal>
        </main>
    );
};

let StatefulComponent = () => {
    // When the component failed to render
    // it should flush the current node/hook
    useState();

    eval('const a;');
};

function DocumentPortal({children}) {
    let el = useRef(document.createElement('div')).current;

    useEffect(() => {
        if (el.parentNode === null) {
            document.body.appendChild(el);
        }
        return () => {
            if (el.parentNode !== null) {
                el.parentNode.removeChild(el);
            }
        };
    }, []);

    return createPortal(children, el);
}
