import {jsx, useRef, useState, useMemo, render} from 'core.pkg';

render(<App/>, document.getElementById('root'));

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

// Auto memoized without memo() like React
function Child({obj}) {
    console.log('Object:', obj);
    
    let renders = useRef(0);
    renders.current++;
    
    return (
        <div>Child renders: {renders.current}</div>
    );
}
