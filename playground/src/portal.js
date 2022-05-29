import {h, mount, createPortal, useRef, useEffect, useState} from '../../output';

mount(<Root/>, document.getElementById('sandbox-container'));

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
                count % 8 > 0 &&
                <DocumentPortal>
                    <Modal>
                        Xin chao {count}
                    </Modal>
                </DocumentPortal>
            }
        </div>
    )
}

function Modal({children}) {
    return (
        <div
            className="Modal"
            style={{
                position: 'fixed',
                width: '300px',
                height: '300px',
                inset: '0px',
                margin: 'auto',
                background: '#FFF',
                padding: '16px',
                borderRadius: '4px',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                zIndex: 100,
            }}
        >
            {children}
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
