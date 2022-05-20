import React, {useRef, useState, useEffect} from 'react';
import ReactDOM from 'react-dom';


function Cat({text, setText}) {
    //console.log('run Cat', text);

    const [] = useState(1);

    useEffect(() => {
        // //console.log('mount Lazy effect Cat');

        return () => {
            // //console.log('destroy Lazy effect Cat');
        };
    }, []);

    useEffect(() => {
        //console.log('mount Deps effect Cat', text);

        return () => {
            //console.log('destroy Deps effect Cat', text);
        };
    }, [text]);

    return <div className="Cat">
        <Wrapper>
            <span>Ad name: </span>
            <input
                type="text"
                value={text}
                onInput={ev => setText(ev.target.value)}
            />
        </Wrapper>
    </div>;
}

function Dog({text, setText}) {
    // //console.log('run Dog', text);

    const [speak, setSpeak] = useState('gruuu');

    useEffect(() => {
        // //console.log('mount Lazy effect Dog');

        return () => {
            // //console.log('destroy Lazy effect Dog');
        };
    }, []);

    useEffect(() => {
        // //console.log('mount Deps effect Dog', text);

        return () => {
            // //console.log('destroy Deps effect Dog', text);
        };
    }, [text]);

    return <div className="Dog">
        <Wrapper>
            <span>Ad name: </span>
            <input
                type="text"
                value={text}
                onChange={ev => setText(ev.target.value)}
            />
        </Wrapper>
        <br/>
        <Wrapper>
            Speak:{' '}
            <input
                value={speak}
                onChange={ev => setSpeak(ev.target.value)}
            />
        </Wrapper>
    </div>;
}

function Bird({layout, text, setText}) {
    const [] = useState();

    useEffect(() => {
        //console.log('mount Lazy effect Bird');

        return () => {
            //console.log('destroy Lazy effect Bird');
        };
    }, []);

    // useEffect(() => {
    //     // //console.log('mount Always effect Bird');
    //
    //     return () => {
    //         // //console.log('destroy Always effect Bird');
    //     };
    // });

    return <div className="Bird">
        {
            layout === 'dog' &&
            <Dog text={text} setText={setText}/>
        }
        {
            layout === 'cat' &&
            <Cat text={text} setText={setText}/>
        }
    </div>;
}

function YourAd({count, setCount}) {
    const [layout, setLayout] = useState('cat');

    const [name, setName] = useState('unnamed');
    //console.log('name', name);

    const selectRef = useRef(null);

    useEffect(() => {
        // //console.log('mount Lazy effect YourAd');

        return () => {
            // //console.log('destroy Lazy effect YourAd');
        };
    }, []);

    useEffect(() => {
        //console.log('+ select_element', selectRef.current);

        return () => {
            //console.log('- select_element', selectRef.current);
        };
    });

    useEffect(() => {
        // //console.log('mount Deps effect YourAd', layout, name);

        return () => {
            // //console.log('destroy Deps effect YourAd', layout, name);
        };
    }, [layout, name]);

    return <form className="YourAd" style={{padding: '16px', border: '1px solid #ccc'}}>
        <div>
            <span>Your Ad: {name}</span>
        </div>
        <br/>
        <div>
            <select ref={selectRef} onChange={ev => setLayout(ev.target.value)}>
                <option value="cat" selected={layout === 'cat'}>Layout Cat</option>
                <option value="dog" selected={layout === 'dog'}>Layout Dog</option>
            </select>
        </div>
        <br/>
        <Wrapper>
            {
                layout === 'cat' &&
                <Wrapper key="#hehe/hahaha mm">
                    <br/>
                    <div>This is cat layout.</div>
                    <Cat text={name} setText={setName}/>
                </Wrapper>
            }
            {
                layout === 'dog' &&
                <Wrapper>
                    <div>This is not default layout, update from ancestor might reset the state of this part if tree updating logic not correct.</div>
                    <br/>
                    <Dog text={name} setText={setName}/>
                </Wrapper>
            }
        </Wrapper>
        <br/>
        <Wrapper>
            <div><strong><i>This is Bird container</i></strong></div>
            <br/>
            <Bird
                layout={layout}
                text={name}
                setText={setName}
            />
        </Wrapper>
        <br/>
        <div>
            <button type="button" onClick={() => {
                setCount(count => count + 1);
            }}>
                Update count
            </button>
            {' '}
            <span>
                Re-renders:
                {count}
            </span>
        </div>
    </form>;
}

function Wrapper({children}) {
    return <div className="Wrapper">
        {children}
    </div>;
}

function MyAd() {
    const [count, setCount] = useState(1);

    const adRef = useRef(null);

    useEffect(() => {
        //console.log('+ ad_element', adRef.current);

        return () => {
            //console.log('- ad_element', adRef.current);
        };
    });

    return <article className="MyAd">
        {[false, 1, 2, [4, 5], ' Count: ', count]}
        <Wrapper>
            <inner>
                <my-div>
                    <love-div>
                        <test-div>
                            <a>link</a>
                            <Wrapper>
                                <Wrapper>
                                    <Wrapper>
                                        test
                                        <Wrapper>
                                            <YourAd ref={adRef} count={count} setCount={setCount}/>
                                        </Wrapper>
                                    </Wrapper>
                                </Wrapper>
                            </Wrapper>
                        </test-div>
                    </love-div>
                    <b><i>hehe</i></b>
                </my-div>
            </inner>
        </Wrapper>
    </article>;
}

function Demo() {
    const [shows, setShows] = useState(true);

    //console.log('shows', shows);
    return <><paragraph>
        <input type="checkbox" checked={shows} onChange={ev => setShows(shows => !shows)}/>
        <h2>Demo</h2>
        hello
        {
            shows &&
            <MyAd/>
        }
    </paragraph></>;
}

function DemoWrapper() {
    return new Array(1000).fill(1).map((_, i) => <Demo key={i}/>);
}

function DemoWrapperWrapper() {
    return <hh-ff><DemoWrapper/></hh-ff>;
}

console.time('stack');
ReactDOM.render(<DemoWrapperWrapper/>, document.getElementById('sandbox-container'));
console.timeEnd('stack');
