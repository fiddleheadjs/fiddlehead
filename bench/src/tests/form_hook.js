import {jsx, mount, useLayoutEffect} from "../../../output";

import {bench} from "../bench";
import {Form} from "../components/Form";

const root = document.getElementById("root");

bench([render0, render1], 100);

function render0(onFinish) {
    mount(<App0 onFinish={onFinish} />, root);
}

function render1(onFinish) {
    mount(<App1 onFinish={onFinish} />, root);
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
