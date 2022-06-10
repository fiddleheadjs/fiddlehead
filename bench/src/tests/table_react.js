import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    Fragment,
} from "react";
import ReactDOM from "react-dom/client";
import {bench} from "../bench";

const TABLE_ROWS = 10000;
console.log('Rows: ', TABLE_ROWS);

const root = ReactDOM.createRoot(document.getElementById("root"));

bench([renderFn0, renderFn1, renderFn2], 50);

function renderFn0(onFinish) {
    root.render(<App0 onFinish={onFinish} />);
}

function renderFn1(onFinish) {
    root.render(<App1 onFinish={onFinish} />);
}

function renderFn2(onFinish) {
    root.render(<App2 onFinish={onFinish} />);
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

    const arr = new Array(TABLE_ROWS).fill(1);

    return (
        <table>
            <tbody>
                {arr.map((_, i) => (
                    <tr key={i}>
                        <td>{i}<i></i></td>
                        <td>{arr[i]}<i></i></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
