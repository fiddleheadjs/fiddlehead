import {jsx, useState, Fragment} from 'core.pkg';

export function Root({getMockValue}) {
    const [layout, setLayout] = useState("cat");

    return (
        <form>
            <select data-testid='layout-selection' onClick={() => setLayout(getMockValue())}>
                <option value="cat" selected={layout === "cat"}>
                    Layout Cat
                </option>
                <option value="dog" selected={layout === "dog"}>
                    Layout Dog
                </option>
            </select>
            <Wrapper>
                {layout === "cat" && (
                    <Wrapper key="#cat">
                        <div data-testid="layout-text">This is cat layout</div>
                        <Cat />
                    </Wrapper>
                )}
                {layout === "dog" && (
                    <Wrapper>
                        <div data-testid="layout-text">This is dog layout</div>
                        <Dog />
                    </Wrapper>
                )}
            </Wrapper>
        </form>
    );
}

function Cat() {
    const [count, setCount] = useState(1);

    return [
        <div data-testid='cat'>
            {count > 1 ? `There have ${count} cats` : 'There has a cat'}
        </div>,
        <button type='button' onClick={() => setCount(c => c + 1)} />
    ]
}

function Dog() {
    const [count, setCount] = useState(1);

    return [
        <div data-testid='dog'>
            {count > 1 ? `There have ${count} dogs` : 'There has a dog'}
        </div>,
        <button type='button' onClick={() => setCount(c => c + 1)} />
    ]
}

function Wrapper({children}) {
    return <Fragment>{children}</Fragment>
}