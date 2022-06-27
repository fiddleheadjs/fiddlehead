import {jsx, useError, useState, useEffect} from 'hook';

function ErrorBoundary({children, errorType}) {
    const [error, clearError] = useError(null);

    if(errorType === 'Error Boundary Component executed fail') {
        let a = a + babel;
    }

    return (
        error !== null ?
        <>
            <div data-testid="error-message" onClick={() => clearError()}>
                Error: {errorType}
            </div>
        </> : 
        children
    );
}

function Child({errorType}) {
    if(errorType === 'Child component executed fail') {
        throwError();    
    } 
    else if(errorType === 'Effect executed fail') {
        useEffect(() => {
            throwError();
        });
    } 
    else if(errorType === 'Unmounted callback executed fail') {
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
