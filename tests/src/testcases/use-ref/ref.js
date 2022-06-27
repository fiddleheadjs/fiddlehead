import {jsx, useRef} from 'hook';

export function Root({getMockValue}) {
    const buttonRef = getMockValue ? useRef(null) : {current: null};

    const handleClick = () => {
        const {current} = buttonRef;

        if(current) {
            current.focus();
        }
    }

    return (
        <main>
            <div>
                <div data-testid="render-msg">Hello world!</div>
                <button ref={buttonRef} data-testid="button" onClick={handleClick}>
                    submit
                </button>
            </div>
        </main>
    );
}
