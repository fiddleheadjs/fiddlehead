import {jsx, render, useState, useEffect, useRef, Text} from 'core.pkg';

render(<Root/>, document.getElementById('root'));

function Root() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const textRef = useRef(null);

    useEffect(() => {
        console.log('mount', textRef);

        return () => {
            console.log('destroy', textRef);
        };
    });

    return (
        <div>
            <input type="text" placeholder="First name" onInput={ev => setFirstName(ev.target.value)}/>
            <input type="text" placeholder="Last name" onInput={ev => setLastName(ev.target.value)}/>
            <p>
                <FullName firstName={firstName} lastName={lastName} ref={textRef}/>
            </p>
        </div>
    )
}

function FullName({firstName, lastName, ref, inputRef}) {
    return (
        <Text ref={ref}>
            {firstName + ' ' + lastName}
        </Text>
    );
}
