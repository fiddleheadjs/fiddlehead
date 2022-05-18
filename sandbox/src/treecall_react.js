import React, {useRef, useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';

console.time('mount');
const root = ReactDOM.createRoot(document.getElementById('sandbox-container'));
root.render(<Tree/>, document.getElementById('sandbox-container'));
console.timeEnd('mount');

function Tree() {
    return (
        <main>
            <TimeStart/>
            {
                new Array(5000).fill(1).map((_, index) => (
                    <Node name={index} key={index}>
                        <Node name={index + ".1"}>
                            <div>
                                <Node name={index + ".1.1"}></Node>
                                <Node name={index + ".1.2"}></Node>
                                <Node name={index + ".1.3"}></Node>
                            </div>
                        </Node>
                        <Node name={index + ".2"}></Node>
                        <Node name={index + "1.3"}></Node>
                    </Node>
                ))
            }
            <TimeEnd/>
        </main>
    );
}

function Node({name, children}) {
    // return children;
    return <div>{name} {children}</div>;
}

function TimeStart() {
    console.time('render');
    return null;
}

function TimeEnd() {
    console.timeEnd('render');
    return null;
}
