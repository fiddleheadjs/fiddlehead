import {jsx, Fragment, useState} from "hook";

export function Root() {
    const [show, setShow] = useState(true);

    return (
        <myMain data-testid="myMain" onClick={() => setShow((s) => !s)}>
            This is myDiv tag
            <myP data-testid="myP">
                <mySpan data-testid="mySpan">This is mySpan tag</mySpan>
            </myP>
            <myDiv data-testid="myDiv">
                <myDiv data-testid="myDiv">
                    {[
                        <></>,
                        <myTable>
                            <myBody></myBody>
                        </myTable>,
                        <>
                            <myDiv data-testid="myDiv"></myDiv>
                        </>,
                        <Fragment>
                            <ChildA show={show} />
                        </Fragment>,
                    ]}
                </myDiv>
            </myDiv>
        </myMain>
    );
}

function ChildA({show}) {
    return [
        <myText data-testid="myText">
            <>
                <>
                    <Fragment>
                        {[
                            <myDiv data-testid="myDiv">
                                <>
                                    {[
                                        <>
                                            <Fragment>
                                                <mySpan data-testid="mySpan">
                                                    ChildA Component
                                                </mySpan>
                                            </Fragment>
                                        </>,
                                        <>
                                            {show && (
                                                <>
                                                    {[
                                                        <Fragment>
                                                            {" "}
                                                            do something
                                                        </Fragment>,
                                                    ]}
                                                </>
                                            )}
                                        </>,
                                    ]}
                                </>
                            </myDiv>,
                            <></>,
                        ]}
                    </Fragment>
                </>
            </>
        </myText>,
    ];
}
