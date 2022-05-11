import {h, mount, useState, useEffect, useRef} from "../../src/index.js";

function Wrapper2({children}) {
    return (
        <span className="Wrapper">
            {children}
        </span>
    );
}

function Wrapper({children}) {
    return <Wrapper2>{children}</Wrapper2>;
}

function DemoWrapperWrapper() {
    const [layout, setLayout] = useState('A');
    console.log(layout);

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

mount(<DemoWrapperWrapper />, document.getElementById('sandbox-container'));
