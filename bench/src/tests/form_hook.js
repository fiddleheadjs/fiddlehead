import {jsx, render, useLayoutEffect} from "../../../index";

import {bench} from "../bench";
import {Form} from "../components/Form";

const root = document.getElementById("root");

bench([render1, render0], 100);

function render0(onFinish) {
    render(<App0 onFinish={onFinish} />, root);
}

function render1(onFinish) {
    render(<App1 onFinish={onFinish} />, root);
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
