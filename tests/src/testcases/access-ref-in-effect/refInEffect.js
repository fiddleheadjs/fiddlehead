import {jsx, useRef, useEffect, useState} from 'core.pkg';

export function Root({ refCallTimes }) {
    const buttonRef = useRef(null);
    const [show, setShow] = useState(true);

    useEffect(() => {
        if(buttonRef.current) {
            refCallTimes();
            buttonRef.current.focus();
        }
    }, [buttonRef.current]);

    useEffect(() => {
        if(buttonRef.current) {
            refCallTimes();
            buttonRef.current.focus();
        }
    });

    return (
        [
            <main onClick={() => setShow(s => !s)}>
               {show && <ChildA buttonRef={buttonRef} refCallTimes={refCallTimes} />}
            </main>,
            <></>
        ]
    );
}

function ChildA({buttonRef, refCallTimes}) {
    useEffect(() => {
        return () => {
            if(buttonRef.current) {
                refCallTimes();
                buttonRef.current.focus();
            }
        };
    }, []);

    return (
        <button ref={buttonRef} data-testid="button" >
            submit
        </button>
    );
}
