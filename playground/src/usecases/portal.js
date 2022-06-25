import {jsx, render, createPortal, useRef, useEffect, useState} from 'core.pkg';

render(<Root/>, document.getElementById('root'));

function Root() {
    const [count, setCount] = useState(0);

    return (
        <div className="Root">
            <button
                onClick={() => {
                    setCount(t => t + 1);
                }}
            >
                Click me {count}
            </button>
            {
                (count % 4 >= 1) &&
                <DocumentPortal>
                    <Modal {...{count, setCount}}>
                        Xin chao {count}
                    </Modal>
                </DocumentPortal>
            }
            {
                (count % 4 <= 2) &&
                <DocumentPortal>
                    <Modal {...{count, setCount}}>
                        Hello {count}
                    </Modal>
                </DocumentPortal>
            }
        </div>
    );
}

function Modal({children, count, setCount}) {
    const [clicks, setClicks] = useState(0);
    console.log('render modal', clicks, children);

    return (
        <div
            className="Modal"
            style={{
                position: 'fixed',
                width: '300px',
                height: '300px',
                inset: '0px',
                margin: 'auto',
                background: '#FFFFFF80',
                padding: '16px',
                borderRadius: '4px',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                zIndex: 100,
            }}
        >
            {children}
            <button
                onClick={() => {
                    setCount(t => t + 1);
                    setClicks(t => t + 1);
                }}
            >
                Click me {clicks}
            </button>
        </div>
    );
}

function DocumentPortal({children}) {
    const elRef = useRef(document.createElement('div'));
    elRef.current.style.display = 'contents';
    
    useEffect(() => {
        if (elRef.current.parentNode === null) {
            document.body.appendChild(elRef.current);
        }

        return () => {
            if (elRef.current.parentNode !== null) {
                elRef.current.parentNode.removeChild(elRef.current);
            }
        };
    }, []);

    return createPortal(children, elRef.current);
}
