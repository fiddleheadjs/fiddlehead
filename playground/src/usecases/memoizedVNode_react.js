import React, {useState, useEffect} from 'react';
import {render} from 'react-dom';

const memoizedVNode = <em>Memoized<C/></em>;

function Root() {
    return <A/>;

    const [el, setEl] = useState('A');

    return (
        <>
            <button onClick={() => setEl(t => t === 'A' ? 'B' : 'A')}>Toggle A/B</button>
            {el === 'A' ? <A/> : <B/>}
        </>
    );
}

function A() {
    const [clicks, setClicks] = useState(0);

    console.log('A', memoizedVNode);

    return (
        <div onClick={() => setClicks(t => t + 1)}>
            {memoizedVNode}
            <span>.A</span>
            {memoizedVNode}
        </div>
    );
}

function B() {
    const [clicks, setClicks] = useState(0);

    console.log('B', memoizedVNode);

    return (
        <div onClick={() => setClicks(t => t + 1)}>
            {memoizedVNode}
            <span>.B</span>
        </div>
    );
}

function C({children}) {
    console.log('C');

    const [clicks, setClicks] = useState(0);

    useEffect(() => {
        console.log('effect C');
    })

    return <b onClick={ev => setClicks(t => t + 1)}>.C {clicks}</b>
}

render(<Root/>, document.getElementById('root'));
