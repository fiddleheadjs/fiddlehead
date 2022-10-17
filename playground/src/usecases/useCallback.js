import {jsx, useRef, useState, useCallback, render} from 'core.pkg';

render(<App/>, document.getElementById('root'));

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

// Auto memoized without memo() like React
function Child({callback}) {
    console.log('Callback:', callback);
    
    let renders = useRef(0);
    renders.current++;
    
    return (
        <div>Child renders: {renders.current}</div>
    );
}
