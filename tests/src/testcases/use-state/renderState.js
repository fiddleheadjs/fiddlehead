import {jsx, useState} from 'core.pkg';

export function Root({getMockValue}) {
    const [state1, setState1] = useState(false);
    const [state2, setState2] = useState(0);

    const setStateTogetherTime = () => {
        setState1(getMockValue());
        setState2(s => s + 1);
    }

    return (
        <main>
            <button data-testid="state-btn1" disabled={state1} onClick={() => setState1(getMockValue())}></button>
            <button data-testid="handle-button" onClick={() => setStateTogetherTime()}></button>
            <ChildA state1={state1} state2={state2} setState1={setState1} getMockValue={getMockValue} />
        </main>
    );
}

function ChildA({state1, state2, setState1, getMockValue}) {
    return [
        <StateComponent state={state1} testid="state1" />,
        <StateComponent state={state2} testid="state2" />,
        <button
            data-testid="state-btn2"
            onClick={() => setState1(getMockValue())}
        />
    ];
}

const StateComponent = ({state, testid}) => <div data-testid={testid}>{state}</div>