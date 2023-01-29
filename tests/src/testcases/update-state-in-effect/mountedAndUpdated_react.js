import React, {useEffect, useState} from 'react';

export const Root = React.memo(function ({
    stateMock,
    getMockValue,
    mountedCb1,
    mountedCb2,
    mountedCb3,
    updatedCb1,
    updatedCb2,
    updatedCb3,
}) {
    const [count, setCount] = useState(0);
    const [show, setShow] = useState(stateMock);

    useEffect(() => {
        mountedCb1();
    }, []);

    useEffect(() => {
        updatedCb1();
    }, [show]);

    return (
        <main>
            <div data-testid="render-msg">Hello world!</div>
            <button
                data-testid="count-button"
                onClick={() => {
                    setCount((r) => r + 1);
                }}
                aria-label={`render ${count}`}
            ></button>
            <button
                data-testid="state-button"
                onClick={() => {setShow(getMockValue())}}
            />
            <div data-testid="mount-effect">
                <ChildA 
                    show={show} 
                    mountedCb2={mountedCb2} 
                    updatedCb2={updatedCb2} 
                    mountedCb3={mountedCb3}
                    updatedCb3={updatedCb3}
                />
            </div>
        </main>
    );
});

const ChildA = React.memo(function ({
    show,
    mountedCb2,
    updatedCb2, 
    mountedCb3,
    updatedCb3
}) {
    const [value, setValue] = useState('');

    useEffect(() => {
        mountedCb2();
        setValue("Component Child 2");
    }, []);

    useEffect(() => {
        updatedCb2();
        setValue("Component Child 2");
    }, [show]);

    return <div data-testid="child-2">
        <ChildB show={show} value={value} mountedCb3={mountedCb3} updatedCb3={updatedCb3} />
    </div>;
});

const ChildB = React.memo(function ({
    show, 
    value,
    mountedCb3, 
    updatedCb3
}) {
    useEffect(() => {
        mountedCb3();
    }, []);

    useEffect(() => {
        updatedCb3();
    }, [show, value]);

    return <div data-testid="child-3">
        Component Child 3
    </div>
});
