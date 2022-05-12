import {h, mount, useState, useEffect, useRef} from "../../output/dist/index.js";

function Wrapper2({children, myRef}) {
    return (
        <span className="Wrapper" ref={myRef}>
            {children}
        </span>
    );
}

function Wrapper({children, myRef}) {
    return <Wrapper2 myRef={myRef}>{children}</Wrapper2>;
}

function DemoWrapperWrapper() {
    const [layout, setLayout] = useState('A');
    const rootRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        console.log('effect always', rootRef.current, wrapperRef.current);
        return () => {
            console.log('unmount always', rootRef.current, wrapperRef.current);
        };
    });

    useEffect(() => {
        console.log('effect deps', rootRef.current, wrapperRef.current);
        return () => {
            console.log('unmount deps', rootRef.current, wrapperRef.current);
        };
    }, [layout]);

    useEffect(() => {
        console.log('effect lazy', rootRef.current, wrapperRef.current);
        return () => {
            console.log('unmount lazy', rootRef.current, wrapperRef.current);
        };
    }, []);

    return (
        <div className="Root" ref={rootRef}>
            <select onChange={ev => setLayout(ev.target.value)}>
                <option key="HAHAH@#$%#@#@][" value="A" selected={layout === 'A'}>Layout A</option>
                <option key={1234} value="B" selected={layout === 'B'}>Layout B</option>
            </select>
            <div style={{marginTop: '100px'}}>
                <span>Hi,</span>
                {layout === 'A' && <>
                    <Wrapper myRef={wrapperRef}>
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
                    <Wrapper myRef={wrapperRef}>
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

function TimeEnd() {
    console.timeEnd('mount');
    return null;
}

function DemoFinalWrapper() {
    return [<DemoWrapperWrapper/>, <TimeEnd/>];
}

console.time('mount');
mount(<DemoFinalWrapper/>, document.getElementById('sandbox-container'));
