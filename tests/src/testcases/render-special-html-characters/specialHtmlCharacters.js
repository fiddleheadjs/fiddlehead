import {jsx, useState} from 'core.pkg';

export function Root() {
    const [show, setShow] = useState(true);

    return (
        <main data-testid="main">
            {[
                <>{show && <>&#40;</>}</>,
                <p>Root&#62;</p>,
                <ChildA specialCharacter="&#41;" show={show} />,
                <button data-testid="button" onClick={() => setShow((s) => !s)} />,
            ]}
        </main>
    );
}

function ChildA({specialCharacter, show}) {
    return [<>&nbsp;</>, "", <>ChildA{show && <>&nbsp;{specialCharacter}</>}</>];
}
