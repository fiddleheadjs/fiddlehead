import {jsx, render, useState, useEffect, useRef} from "hook";

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

    const style = (() => {
        switch (value) {
            case '1':
                return {
                    color: 'red',
                };
            case '2':
                return {
                    fontWeight: 'bold',
                };
            case '3':
                return {
                    color: 'red',
                    fontStyle: 'italic',
                }
        }
        return null;
    })();

    return (
        <main>
            <div key="haha">
                <Wrapper>
                    <Form value={value} setValue={setValue}/>
                    <div style={style}>
                        Hello world!
                    </div>
                </Wrapper>
            </div>
        </main>
    );
}

render(<DemoWrapperWrapper />, document.getElementById('sandbox-container'));
