import React, {useRef, useState, useMemo, memo} from 'react';
import {createRoot} from 'react-dom/client';

createRoot(document.getElementById('root')).render(<App/>);

function App() {
    let [triggers, setTriggers] = useState(1);
    let obj = useMemo(() => ({}), [Math.floor(triggers / 5)]);

    return (
        <>
            <Child obj={obj}/>
            <button onClick={() => setTriggers(t => t + 1)}>Parent triggers: {triggers}</button>
        </>
    );
}

var Child = memo(function ({obj}) {
    console.log('Object:', obj);
    
    let renders = useRef(0);
    renders.current++;
    
    return (
        <div>Child renders: {renders.current}</div>
    );
});
