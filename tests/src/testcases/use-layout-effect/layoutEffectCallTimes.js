import {jsx, useLayoutEffect, useState} from 'core.pkg';

export function Root({
    toBeCall1,
    toBeCall2,
    toBeCall3,
    toBeCall4,
    getMockValue
}) {
    const [render, setRender] = useState(true);

    useLayoutEffect(() => {
        toBeCall1();
    });

    useLayoutEffect(() => {
        toBeCall2();
    }, []);

    useLayoutEffect(() => {
        toBeCall3();
    }, [render]);

    return [<button onClick={() => setRender(getMockValue())} />,<div data-testid="render-state">{render}</div>,<>{render && <Child toBeCall={toBeCall4} />}</>];
}

function Child({toBeCall}) {
    useLayoutEffect(() => {
       return () => {
            toBeCall();
        }
    });

    return null;
}