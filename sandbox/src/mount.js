import Hook, {useState, useEffect, useRef} from "../../index.js";


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
                    <b>My</b>
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
                    <>
                        <i>
                            <>am</>
                        </i>
                    </>
                </>}
                <a>Quyet</a>
            </div>
        </div>
    );
}

Hook.render(<DemoWrapperWrapper />, document.getElementById('sandbox-container'));
