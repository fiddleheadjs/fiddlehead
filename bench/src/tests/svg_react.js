import React, {useLayoutEffect} from "react";
import ReactDOM from "react-dom/client";
import {bench} from "../bench";
import {Svg0} from "../components/Svg0";
import {Svg1} from "../components/Svg1";
import {Svg2} from "../components/Svg2";
import {Svg3} from "../components/Svg3";
import {Svg4} from "../components/Svg4";

const root = ReactDOM.createRoot(document.getElementById("root"));

bench([render0, render1, render2, render3, render4], 10);

function render0(onFinish) {
    root.render(<App0 onFinish={onFinish} />);
}

function render1(onFinish) {
    root.render(<App1 onFinish={onFinish} />);
}

function render2(onFinish) {
    root.render(<App2 onFinish={onFinish} />);
}

function render3(onFinish) {
    root.render(<App3 onFinish={onFinish} />);
}

function render4(onFinish) {
    root.render(<App4 onFinish={onFinish} />);
}

function App0({onFinish}) {
    useLayoutEffect(() => {
        onFinish();
    }, []);

    return <Svg0 />;
}

function App1({onFinish}) {
    useLayoutEffect(() => {
        onFinish();
    }, []);

    return <Svg1 />;
}

function App2({onFinish}) {
    useLayoutEffect(() => {
        onFinish();
    }, []);

    return <Svg2 />;
}

function App3({onFinish}) {
    useLayoutEffect(() => {
        onFinish();
    }, []);

    return <Svg3 />;
}

function App4({onFinish}) {
    useLayoutEffect(() => {
        onFinish();
    }, []);

    return <Svg4 />;
}
