import {jsx, useState, Fragment} from 'hook';

function Wrapper({children}) {
   return <>
        {children}
    </>
}
const ChildA = () => 'Children A ';

export function Root({getMockValue}) {
    const [state, setState] = useState(1);

    return (
        <main onClick={() =>{setState(getMockValue()); }}>
            {[
                <>It{' '}</>,
                <>
                    {[
                        <span>is{' '}</span>,
                        state === 1 &&
                        <Fragment>
                            component{' '}
                        </Fragment>
                    ]}
                </>,
                <Fragment>
                    {[
                        state === 1 &&
                        <ChildA />,
                        state === 2 &&
                        <p>do{' '}</p>,
                        <Wrapper>
                            some{' '}
                            <Fragment>
                                thing{' '}
                            </Fragment>
                        </Wrapper>
                    ]}
                    <>...</>
                </Fragment>
            ]}
        </main>
    );
}
