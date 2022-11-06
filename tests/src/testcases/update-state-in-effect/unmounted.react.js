import React, {Fragment, useEffect, useState} from 'react';

export function Root({unmountedCb1, unmountedCb2}) {
    const [show, setShow] = useState(true);
    const [count, setCount] = useState(0);

    return (
        <main>
            <div data-testid="render-msg">Hello world!</div>
            <button
                data-testid="show-button"
                onClick={() => {
                    setShow(f => !f);
                }}
            ></button>

            <div data-testid="mount-effect">
                {show && 
                    <ChildA setCount={setCount} unmountedCb1={unmountedCb1} unmountedCb2={unmountedCb2} />
                }
            </div>
        </main>
    );
}

function ChildA({setCount, unmountedCb1, unmountedCb2}) {
    const [count2, setCount2] = useState(0);
    useEffect(() => {
        return () => {
            unmountedCb1();
            setCount(v => v + 1);
        }
    }, []);

    return [
        <div key="1">
            <ChildB setCount2={setCount2} unmountedCb2={unmountedCb2} />
        </div>, 
        <Fragment key="2"></Fragment>
    ];
}

function ChildB({setCount2, unmountedCb2}) {
    useEffect(() => {
        return () => {
            unmountedCb2();
            setCount2(v => v + 1);
        }
    }, []);

    return null;
}