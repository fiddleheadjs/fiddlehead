import {jsx, render} from 'hook';
import {screen} from '@testing-library/dom';

describe('mount.test.js', () => {
    let error, container;

    beforeAll(() => {
        error = jest.spyOn(console, 'error');
    });

    beforeEach(() => {
        container = document.createElement('div');
        document.body.append(container);
    });

    it('Error logged when container was null', () => {
        const mountFallback = () => render(<p></p>, null);

        expect(mountFallback).toThrow(new TypeError(`Cannot read property '%vnode' of null`));
    });

    it('Rendering correct doms in innerHtml attribute', () => {
        render(<div data-testid='parent' innerHTML="<p class='child-text' data-testid='child-text'>Child</p>">Parent </div>, container);

        expect(screen.queryByTestId('parent').textContent).toEqual('Parent Child');
        expect(screen.queryByTestId('child-text').innerHTML).toEqual('Child');
        expect(screen.queryByTestId('child-text').className).toEqual('child-text');
    });

    it('Rendering correct array nodes', () => {
        const Component = ({text, testid}) => <p data-testid={testid}>{text}</p>;

        render([
            <div data-testid="a">Component A</div>,
            <>
                <div data-testid="b">Component B</div>
            </>,
            <Component testid="c" text={"Component C"}/>,
            <div data-testid="container-d-e">
                {[<Component testid="d" text={"Component D"}/>,<div>Component E</div>]}
            </div>
        ], container);

        expect(screen.queryByTestId('a').textContent).toEqual('Component A');
        expect(screen.queryByTestId('b').textContent).toEqual('Component B');
        expect(screen.queryByTestId('c').textContent).toEqual('Component C');
        expect(screen.queryByTestId('d').textContent).toEqual('Component D');
        expect(screen.queryByTestId('container-d-e').innerHTML).toBe(
            '<p data-testid="d">Component D</p><div>Component E</div>'
        );
    });

    it('Error logged when container had children', () => {
        const children = document.createElement('div');
        container.appendChild(children);
        render(<p></p>, container);

        expect(error).toBeCalledTimes(1);
        expect(error).toBeCalledWith('Target node must be empty');
    });

    it('Using `class` attribute on nodes', () => {
        render(<p data-testid="test-class" class="test-class"></p>, container);
        expect(screen.queryByTestId('test-class').className).toEqual('test-class');
    });

    afterAll(() => {
        error.mockClear();
        document.body.innerHTML = '';
    });
});