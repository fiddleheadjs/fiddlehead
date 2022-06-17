import {
    jsx,
    render,
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    Fragment,
} from "core.pkg";
import {bench} from "../bench";

const TABLE_ROWS = 10000;
console.log('Rows: ', TABLE_ROWS);

const root = document.getElementById("root");

bench([render0, renderFn1, renderFn2], 10);

function render0(onFinish) {
    render(<App0 onFinish={onFinish} />, root);
}

function renderFn1(onFinish) {
    render(<App1 onFinish={onFinish} />, root);
}

function renderFn2(onFinish) {
    render(<App2 onFinish={onFinish} />, root);
}

function App0({onFinish}) {
    useLayoutEffect(() => {
        onFinish();
    }, []);

    return 'ABCD';
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
                        <td>{i + '-aaa'}</td>
                        <td>{i + '-bbb'}</td>
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

    const arr = new Array(TABLE_ROWS).fill(1);

    return (
        <table>
            <tbody>
                {arr.map((_, i) => (
                    <tr key={i}>
                        <td>{i + '-aaa'}<i></i></td>
                        <td>{i + '-bbb'}<i></i></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
