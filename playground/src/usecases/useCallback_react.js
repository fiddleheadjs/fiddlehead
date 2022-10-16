import React, {useRef, useState, useCallback, memo} from 'react';
import {createRoot} from 'react-dom/client';

createRoot(document.getElementById('root')).render(<App/>);

function App() {
    let [triggers, setTriggers] = useState(1);
    let callback = useCallback({}, [Math.floor(triggers / 5)]);

    return (
        <>
            <Child callback={callback}/>
            <button onClick={() => setTriggers(t => t + 1)}>Parent triggers: {triggers}</button>
        </>
    );
}

var Child = memo(function ({callback}) {
    console.log('Callback:', callback);

    let renders = useRef(0);
    renders.current++;
    
    return (
        <div>Child renders: {renders.current}</div>
    );
});
