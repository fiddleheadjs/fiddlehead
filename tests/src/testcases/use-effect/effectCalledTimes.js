import {jsx, useEffect, useState} from 'core.pkg';

export function Root({
    toBeCall1,
    toBeCall2,
    toBeCall3,
    toBeCall4,
    getMockValue
}) {
    const [render, setRender] = useState(true);

    useEffect(() => {
        toBeCall1();
    });

    useEffect(() => {
        toBeCall2();
    }, []);

    useEffect(() => {
        toBeCall3();
    }, [render]);

    return [<button onClick={() => setRender(getMockValue())} />,<>{render && <Child toBeCall={toBeCall4} />}</>];
}

function Child({toBeCall}) {
    useEffect(() => {
       return () => {
            toBeCall();
        }
    });

    return null;
}