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
                {
                    clicks < 1
                    ?
                    <Content1>
                        <Content2/>
                        <Contents setClicks={setClicks}/>
                    </Content1>
                    :
                    <Content2>
                        <Content1/>
                        <Contents setClicks={setClicks}/>
                    </Content2>
                }
            </ErrorBoundary>
        </Fragment>
    )
}

function Contents({setClicks}) {
    const [shows, setShows] = useState(0);

    return <>
        <h4>Shows: {shows}</h4>
        <Content3 setClicks={setClicks} setShows={setShows}/>
    </>;
}

function ErrorBoundary({children}) {
    const [error, setError] = useError(null);
    // console.log('-->', error);

    useEffect(() => {

    });

    window.errorBoundary = this;
    // console.log('return OldChild ==>', this.child_ && this.child_.type_.name);

    // console.log(error ? 'ERR: ' + error.message : 'ERR: none');

    if (error === null) {
        // console.log('return children', this.child_);
        return children;
    }

    // console.log('return error', this.child_);
    return (
        <nav>
            <h4>Error Boundary</h4>
            Error: {error && error.message}
            {
                error !== null &&
                <>
                    <div style={{color: '#f00'}}>Oops: {error.message}</div>
                    <button onClick={() => setError(null)}>Clear error</button>
                </>
            }
        </nav>
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
        // console.log('hehe');
        // ee += 1;

        return () => {
            // console.log(' gg');
            // this.gg[++ik.current + ' gg'] = 1;
        };
    });

    useEffect(() => {
        // console.log('run effect');
        // this.ef[++ik.current + ' ef'] = 2;
    }, []);

    // this.cc[++ik.current + ' cc'] = 2;
    
    return (
        <div className="Content2">
            Content 2
            {children}
        </div>
    );
}

function Content3({children, setClicks, setShows}) {
    console.log('run content 3');
    // b += 2;

    const [count, setCount] = useState(0);
    
    
    return (
        <div className="Content3">
            Content 3
            {children}
            <div>
                <button onClick={() => {
                    setCount(t => {console.log('---return count'); return count += 1;});
                    setClicks(t => {console.log('---return clicks'); return t + 1;});
                    setShows(t => {console.log('---return shows =', t); return t + 1;});
                }}>Click me {count}</button>
            </div>
        </div>
    );
}
