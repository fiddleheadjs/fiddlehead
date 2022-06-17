import {jsx, render, useState, useEffect} from "hook";

render(<A />, document.getElementById("sandbox-container"));

function A() {
    const [shows, setShows] = useState(0);

    console.log('shows in render A', shows);

    useEffect(() => {
        console.log('click in effect A');
        document.querySelector(".btn-set-state").click();
    }, []);

    return (
        <div>
            <button
                class="btn-set-state"
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
        setClicks((c) => c + 1);
    }, []);

    useEffect(() => {
        console.log('shows in effect B', shows);
    }, [shows]);

    return `Shows ${shows} ; Clicks ${clicks}`;
}
