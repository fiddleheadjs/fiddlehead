import {h, render, useState, useEffect, useRef} from "../../index.js";

function Wrapper({children}) {
    return (
        <span className="Wrapper">
            {children}
        </span>
    );
}

function Form({value, setValue}) {
    return (
        <input value={value} onInput={ev => setValue(ev.target.value)}/>
    );
}

function DemoWrapperWrapper() {
    const [value, setValue] = useState('');

    return (
        <main>
            <div key="haha">
                <Wrapper>
                    <Form value={value} setValue={setValue}/>
                </Wrapper>
            </div>
        </main>
    );
}

render(<DemoWrapperWrapper />, document.getElementById('sandbox-container'));
