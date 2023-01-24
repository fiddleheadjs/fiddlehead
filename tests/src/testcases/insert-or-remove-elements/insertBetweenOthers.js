import {jsx, useState, useEffect, useRef} from "core.pkg";

export function App() {
    return <main>{[<A/>, '___', <B/>, ' ... ', <C/>]}</main>;
}

function A() {
    return <>{['Hello', <>{', '}</>, <>{['How ', ['are ', 'you?']]}</>]}</>;
}

function B() {
    const [howAreYou, setHowAreYou] = useState('1');

    const onKeydown = useRef((ev) => {
        if (['1', '2', '3'].includes(ev.key)) {
            setHowAreYou(ev.key);
        }
    });

    useEffect(() => {
        document.addEventListener('keydown', onKeydown.current);

        return () => {
            document.removeEventListener('keydown', onKeydown.current);
        }
    }, []);

    if (howAreYou === '1') {
        return [<span>{["I'm fine, ", ['thank ', 'you!']]}</span>, '***'];
    }

    if (howAreYou === '2') {
        return ["I'm tired ", '@@'];
    }

    return null;
}

function C() {
    return 'How about you?';
}
