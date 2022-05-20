import {h, mount, useState, useEffect} from '../../output/dist/index.min.js'; 

console.time('mount');
mount(<Tree/>, document.getElementById('sandbox-container'));
console.timeEnd('mount');

function Tree() {
    return (
        <main>
            <TimeStart/>
            {
                new Array(1000).fill(1).map((_, index) => (
                    <Node name={index} key={index}>
                        <Node name={index + ".1"}>
                            <div>
                                <Node name={index + ".1.1"}></Node>
                                <Node name={index + ".1.2"}></Node>
                                <Node name={index + ".1.3"}></Node>
                            </div>
                        </Node>
                        <Node name={index + ".2"}></Node>
                        <Node name={index + ".3"}></Node>
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
