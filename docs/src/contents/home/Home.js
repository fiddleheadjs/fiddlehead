import './Home.less';
import {jsx} from 'core.pkg';

export let Home = () => {
    return (
        <div className="Home">
            <h1>Fiddlehead</h1>
            <p>
                Fiddlehead is a lightweight library which allows you to develop your web frontend easier.
                If you are familiar with React, then you can see Fiddlehead's APIs are similar.
                It implements the main concepts of React: JSX, virtual DOM, hooks.
            </p>
            <p>
                React has changed our way to develop UI.
                Its declarative programming style help our codes more predictable.
                Our purpose is creating a minimal library that provide the same development experience as React.
            </p>
            <p>
                Fiddlehead is all about JSX and hooks.
                It does not support class components, synthetic events, context APIs.
            </p>
        </div>
    );
};
