import {jsx, mount, useState, useEffect, useRef, TextNode} from '../../output';

mount(<Root/>, document.getElementById('sandbox-container'));

function Root() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const textRef = useRef(null);

    useEffect(() => {
        console.log('mount', textRef.current);

        return () => {
            console.log('destroy', textRef.current);
        };
    });

    return (
        <div>
            <input type="text" placeholder="First name" onInput={ev => setFirstName(ev.target.value)}/>
            <input type="text" placeholder="Last name" onInput={ev => setLastName(ev.target.value)}/>
            <p>
                <FullName firstName={firstName} lastName={lastName} ref={4}/>
            </p>
        </div>
    )
}

function FullName({firstName, lastName, ref}) {
    return (
        <TextNode ref={ref}>
            {firstName}
            {' '}
            {lastName}
        </TextNode>
    );
}
