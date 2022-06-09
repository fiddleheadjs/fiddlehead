import {jsx, render, useState, useEffect} from '../../output';

render(<Parent />, document.getElementById('sandbox-container'));

function Parent() {
    const [shows, setShows] = useState(0);
    
    console.log('Parent render, shows = ' + shows);

    useEffect(() => {
        console.log('Parent effect, shows = ' + shows);
        setShows(s => s + 1);
    }, []);

    return <div>
        <Children shows={shows} />
    </div>;
}

function Children({shows}) {
    const [clicks, setClicks] = useState(0);
    
    console.log('Children render, clicks = ' + clicks);

    useEffect(() => {
        console.log('Children effect, shows = ' + shows + ', clicks = ' + clicks);
        setClicks(c => c + 1);
    }, [shows]);

    return `Clicks ${clicks}`;
}
