import {h, render, useState, useEffect, useRef} from "../../output/dist/index.min.js";

function Wrapper({children}) {
    return (
        <span className="Wrapper">
            {children}
        </span>
    );
}

function DemoWrapperWrapper() {
    const [layout, setLayout] = useState('A');

    return (
        <div className="Root">
            <select onchange={ev => setLayout(ev.target.value)}>
                <option value="A" selected={layout === 'A'}>Layout A</option>
                <option value="B" selected={layout === 'B'}>Layout B</option>
            </select>
            <div style={{marginTop: '100px'}}>
                <span>Hi,</span>
                {layout === 'A' && <>
                    <Wrapper>
                        <b>My</b>
                    </Wrapper>
                    <>
                        <>
                            <i>name</i>
                            <span>
                                <u>is</u>
                            </span>
                        </>
                    </>
                </>}
                {layout === 'B' && <>
                    <b>I</b>
                    <Wrapper>
                        <>
                            <i>
                                <>am</>
                            </i>
                        </>
                    </Wrapper>
                </>}
                <Wrapper>
                    <>
                        <a>Quyet</a>
                    </>
                </Wrapper>
            </div>
        </div>
    );
}

render(<DemoWrapperWrapper />, document.getElementById('sandbox-container'));
