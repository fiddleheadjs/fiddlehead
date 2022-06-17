import React, {useLayoutEffect} from "react";
import ReactDOM from "react-dom/client";
import {bench} from "../bench";
import {Form} from "../components/Form";

const root = ReactDOM.createRoot(document.getElementById("root"));

bench([render1, render0], 20);

function render0(onFinish) {
    root.render(<App0 onFinish={onFinish} />);
}

function render1(onFinish) {
    root.render(<App1 onFinish={onFinish} />);
}

function App0({onFinish}) {
    useLayoutEffect(() => {
        onFinish();
    }, []);

    return <Form />;
}

function App1({onFinish}) {
    useLayoutEffect(() => {
        onFinish();
    }, []);

    return 'ABCD';
}
