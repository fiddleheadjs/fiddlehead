import './Intro.less';
import {jsx} from 'core.pkg';

export let Intro = () => {
    return (
        <section className="Intro">
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
                React is the best option in most cases.
                Only use Fiddlehead if the following criteria are really important for your case:
            </p>
            <ul>
                <li>Simple usage: All about JSX and hooks</li>
                <li>Performant: Significant better memory usage and slightly better CPU usage</li>
                <li>Super small filesize: Only 8kb, or 3kb with GZIP</li>
            </ul>
            <p>
                Those also are the reasons why Fiddlehead exists.
                In some cases, we wanted to have a library which can provide a pleasurable development experience like React,
                while keeping the simplicity, lightweight, and performant.
            </p>
        </section>
    );
};
