import {jsx, render, createPortal, useRef, useEffect, useState} from '../../../index';

render(<Root/>, document.getElementById('sandbox-container'));

function Root() {
    const [count, setCount] = useState(0);
    const [shows, setShows] = useState(false);

    console.log('render root', count, shows);

    return (
        <div className="Root">
            <button
                onClick={() => {
                    setCount(t => t + 1);
                    setShows(t => !t);
                }}
            >
                Click me {count}
            </button>
            {
                (shows || count % 3 > 0) &&
                <DocumentPortal>
                    <Modal {...{count, setCount, shows, setShows}}>
                        Xin chao {count}
                    </Modal>
                </DocumentPortal>
            }
        </div>
    )
}

function Modal({children, count, setCount, shows, setShows}) {
    const [clicks, setClicks] = useState(0);
    console.log('render modal', clicks);

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
            <button
                onClick={() => {
                    setCount(t => t + 1);
                    setShows(t => !t);
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
