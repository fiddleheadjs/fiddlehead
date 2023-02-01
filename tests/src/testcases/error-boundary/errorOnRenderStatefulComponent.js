import {jsx, render, useCatch, useState} from 'core.pkg';

export let App = () => {
    let [error] = useCatch();

    return (
        <main>
            <div role="alert">{error !== null ? 'Something went wrong' : ''}</div>
            <StatefulComponent />
        </main>
    );
};

let StatefulComponent = () => {
    // When the component failed to render
    // it should flush the current node/hook
    useState();

    eval('const a;');
};
