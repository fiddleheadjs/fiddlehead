import {jsx, useCatch, useState, useEffect, useLayoutEffect} from 'core.pkg';

function ErrorBoundary({children, errorType}) {
    const [error, clearError] = useCatch(null);

    const [count, setCount] = useState(0);

    useEffect(function mount() {
        setCount(c => c + 1);
    }, [setCount, clearError]);

    return (
        <error-boundary>
            <div-before>hehe</div-before>
            {
                error !== null ?
                    <>
                        <div data-testid="error-message" onClick={() => clearError()}>
                            Error: {errorType}
                        </div>
                    </> :
                    children
            }
            <div-after><span data-testid="count">{count}</span></div-after>
        </error-boundary>
    );
}

function Child({errorType}) {
    if (errorType === 'Child component executed fail') {
        throwError();
    }
    
    useEffect(() => {
        if (errorType === 'Effect executed fail') {
            throwError();
        }
        else if (errorType === 'Unmounted callback executed fail') {
            return () => {
                throwError();
            };
        }
    });

    return <>
        <div data-testid="children">
            Hello
        </div>
    </>;
}

export function Root({getMockValue}) {
    const [show, setShow] = useState(true);
    const [errorType, setErrorType] = useState(getMockValue());

    return (
        <>
            <main onClick={() => setShow(getMockValue())}>
                <ErrorBoundary errorType={errorType}>
                    {show && <Child errorType={errorType} />}
                </ErrorBoundary>
            </main>
        </>
    );
}
