import {jsx, useCatch, useState, useEffect} from 'core.pkg';

function ErrorBoundary({children, errorType}) {
    const [error, clearError] = useCatch(null);

    if (errorType === 'Error Boundary Component executed fail') {
        let a = a + babel;
    }

    const [count, setCount] = useState(0);

    useEffect(() => {
        setCount(c => c + 1)
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
    else if (errorType === 'Effect executed fail') {
        useEffect(() => {
            throwError();
        });
    }
    else if (errorType === 'Unmounted callback executed fail') {
        useEffect(() => {
            return () => {
                throwError();
            }
        });
    }

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
