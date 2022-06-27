import {jsx, useLayoutEffect, useState} from 'hook';

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
    useLayoutEffect(() => {
        return () => {
            unmountedCb1();
            setCount(v => v + 1);
        }
    }, []);

    return [
        <div>
            <ChildB setCount2={setCount2} unmountedCb2={unmountedCb2} />
        </div>, 
        <></>
    ];
}

function ChildB({setCount2, unmountedCb2}) {
    useLayoutEffect(() => {
        return () => {
            unmountedCb2();
            setCount2(v => v + 1);
        }
    }, []);

    return null;
}