import {jsx, render, useState, useEffect} from 'core.pkg';

render(<A />, document.getElementById('root'));

function A() {
    const [shows, setShows] = useState(0);

    console.log('++ A render, shows = ' + shows);

    useEffect(() => {
        console.log('++ A effectCallback, shows = ' + shows);
        setShows(s => s + 1);
        return () => {
            console.log('++ A effectDestroy, shows = ' + shows);
            setShows(s => s + 1);
        };
    }, []);

    return <B shows={shows} />;
}

function B({shows}) {
    const [clicks, setClicks] = useState(0);

    console.log('++ B render, shows = ' + shows + ', clicks = ' + clicks);

    useEffect(() => {
        console.log('++ B effectCallback, shows = ' + shows + ', clicks = ' + clicks);
        setClicks(c => c + 1);
        return () => {
            console.log('++ B effectDestroy, shows = ' + shows + ', clicks = ' + clicks);
            setClicks(c => c + 1);
        };
    }, [shows]);

    return `Shows ${shows} ; Clicks ${clicks}`;
}
