import {
    jsx,
    mount,
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    Fragment,
} from "../../../output";
import {bench} from "../bench";

const root = document.getElementById("root");

const TABLE_ROWS = 10000;

console.log('Rows: ', TABLE_ROWS);

bench([renderFn2, renderFn1], 100);

function renderFn1(onFinish) {
    mount(<App1 onFinish={onFinish} />, root);
}

function renderFn2(onFinish) {
    mount(<App2 onFinish={onFinish} />, root);
}

function App1({onFinish}) {
    useLayoutEffect(() => {
        onFinish();
    }, []);

    const arr = new Array(TABLE_ROWS).fill(1);

    return (
        <table>
            <tbody>
                {arr.map((_, i) => (
                    <tr key={i}>
                        <td>{i}</td>
                        <td>{arr[i]}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function App2({onFinish}) {
    useLayoutEffect(() => {
        onFinish();
    }, []);

    return 'ABCD';
}
