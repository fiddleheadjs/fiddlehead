import React, {useState, useEffect, useRef} from "react";
import {render} from 'react-dom';

render(<A />, document.getElementById("root"));

function A() {
    const [shows, setShows] = useState(0);
    const btn = useRef(null);

    console.log('shows in render A', shows);

    useEffect(() => {
        console.log('simulate click in effect A');
        btn.current.click();
    }, []);

    return (
        <div>
            <button
                ref={btn}
                onClick={() => {
                    setShows(1);
                }}
            >
                Set State
            </button>
            <B shows={shows} />
        </div>
    );
}

function B({ shows }) {
    const [clicks, setClicks] = useState(0);

    console.log('shows in render B', shows);

    useEffect(() => {
        console.log('clicks++ in effect B');
        setClicks((c) => c + 1);
    }, []);

    useEffect(() => {
        console.log('shows in effect B', shows);
    }, [shows]);

    return `Shows ${shows} ; Clicks ${clicks}`;
}
