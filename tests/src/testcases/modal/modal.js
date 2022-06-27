import {jsx, createPortal, useState, useRef, useEffect} from 'hook';

export function Root({
    getMockValue,
    mockMountedFunction,
    mockUnmountedFunction
}) {
    const [show, setShow] = useState(true);
    const [message, setMessage] = useState(0);

    return <>
        <div data-testid="component">
            <div data-testid="set-show" onClick={() => setShow(s => !s)}></div>
            {show 
            &&
            <Modal 
                message={message}
                setMessage={setMessage}
                getMockValue={getMockValue}
                mockMountedFunction={mockMountedFunction}
                mockUnmountedFunction={mockUnmountedFunction}
            >
                <div data-testid="div">
                    <p data-testid="p">
                        <span data-testid="span">Portal Render</span>
                    </p>
                    <image data-testid="image" src="http://i.imgur.com/w7GCRPb.png" />
                </div>
            </Modal>
            }
        </div>
    </>;
}

function Modal({
    children,
    message,
    setMessage,
    getMockValue,
    mockMountedFunction,
    mockUnmountedFunction
}) {
    const elRef = useRef(document.createElement('div'));

    useEffect(() => {
        mockMountedFunction();
        if (elRef.current.parentNode === null) {
            document.body.appendChild(elRef.current);
        }

        return () => {
            mockUnmountedFunction();
            if (elRef.current.parentNode !== null) {
                elRef.current.parentNode.removeChild(elRef.current);
            }
        };
    }, []);

    useEffect(() => {
        mockMountedFunction();
    }, [message]);

    return createPortal(
        <div data-testid="portal">
            <p data-testid="message" onClick={() => setMessage(getMockValue())}>{message}</p>
            {children}
        </div>,
    elRef.current);
}