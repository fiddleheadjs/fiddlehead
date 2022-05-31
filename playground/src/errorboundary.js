import {jsx, mount, useError, useEffect, useState, useRef, Fragment} from '../../output';

mount(<Root/>, document.getElementById('sandbox-container'));

function Root() {
    const [count, setCount] = useState(0);
    const [clicks, setClicks] = useState(0);

    return (
        <Fragment>
            <h2>Root Component {clicks}</h2>
            <button onClick={() => setCount(t => t + 1)}>Update Root {count}</button>
            <ErrorBoundary>
                <Content1>
                    <Content2/>
                    <Content3 setClicks={setClicks}/>
                </Content1>
            </ErrorBoundary>
        </Fragment>
    )
}

function ErrorBoundary({children}) {
    const [error, setError] = useError(null);
    // console.log('-->', error);

    useEffect(() => {

    });

    // console.log(error ? 'ERR: ' + error.message : 'ERR: none');

    return (
        <div>
            <div>Error Boundary</div>
            {
                error !== null ? <>
                    <div style={{color: '#f00'}}>Oops: {error.message}</div>
                    <button onClick={() => setError(null)}>Clear error</button>
                </> : (
                    children
                )
            }
        </div>
    );
}

function Content1({children}) {
    console.log('run content 1');
    // b += 2;
    
    return (
        <div className="Content1">
            Content 1
            {children}
        </div>
    );
}

function Content2({children}) {
    let ik = useRef(0);
    console.log('run content 2');

    useEffect(() => {
        console.log('hehe');
        // ee += 1;

        return () => {
            console.log(' gg');
            this.gg[++ik.current + ' gg'] = 1;
        };
    });

    useEffect(() => {
        console.log('run effect');
        this.ef[++ik.current + ' ef'] = 2;
    }, []);

    this.cc[++ik.current + ' cc'] = 2;
    
    return (
        <div className="Content2">
            Content 2
            {children}
        </div>
    );
}

function Content3({children, setClicks}) {
    console.log('run content 3');
    // b += 2;

    const [count, setCount] = useState(0);
    
    
    return (
        <div className="Content3">
            Content 3
            {children}
            <div>
                <button onClick={() => {
                    setCount(t => c += 1);
                    setClicks(t => t + 1);
                }}>Update Root {count}</button>
            </div>
        </div>
    );
}
