import {jsx, useEffect, useState} from 'core.pkg';

export function Root({
    renderCount,
    mountedCb1,
    mountedCb2,
    mountedCb3
}) {
    const [render, setRender] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if(count < renderCount) {
            mountedCb1();
            setCount(a => a + 1);
        }
    });

    return (
        <main>
            <div data-testid="render-msg">Hello world!</div>
            <button
                data-testid="render-button"
                onClick={() => {
                    setRender((r) => r + 1);
                }}
                aria-label={`render ${render}`}
            >
                render {count}
            </button>
            <ChildA mountedCb2={mountedCb2} mountedCb3={mountedCb3}/>
        </main>
    );
}

function ChildA({mountedCb2, mountedCb3}) {
    useEffect(() => {
        mountedCb2();
    });

    return <div data-testid="child-2">
        <div>Component Child 2</div>
        <ChildrenB mountedCb3={mountedCb3} />
    </div>;
}

function ChildrenB({mountedCb3}) {
    useEffect(() => {
        mountedCb3();
    });

    return <div data-testid="child-3">
        Component Child 3
    </div>
}