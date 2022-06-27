import {jsx, useState} from 'core.pkg';

const memoizedNode = (
    <p data-testid='memoized-node'>
        <div>a Memoized Node, Stating is </div> 
        <ChildA />
    </p>
);

function ChildA() {
    const [show, setShow] = useState(false);

    return [
        <div data-testid="childA">
            {show ? "showing" : "hiding"}
        </div>,
        <button data-testid="btn-show" onClick={() => setShow((s) => !s)} />,
    ];
}

export function Root({getMockValue}) {
    const [count, setCount] = useState(0);
    const [component, setComponent] = useState(null);

    return (
        <main>
            <button
                data-testid="btn-count"
                onClick={() => setCount((c) => c + 1)}
            />
            <div>This is</div>
            {memoizedNode}
            {count}
            <div data-testid="state-component" onClick={() => setComponent(getMockValue())}>
                {component}
            </div>
        </main>
    );
}
