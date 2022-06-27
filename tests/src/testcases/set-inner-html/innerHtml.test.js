import {jsx, render} from 'core.pkg';
import {screen} from '@testing-library/dom';

describe('innerHtml.test.js', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    it('Rendering correct doms on innerHtml attribute', () => {
        const innerHTMLContent = `
            <p data-testid="p">
                <span data-testid="span">This is span tag</span>
                This is p tag
                <p data-testid="p">
                    <image data-testid="image" src="http://i.imgur.com/w7GCRPb.png" />
                </p>
            </p>
            <div data-testid="div">
                <input data-testid="input-text" readOnly="readOnly" type="text" placeHolder="This input tag" />
                <div data-testid="div">
                    <table data-testid="table">
                        <tbody data-testid="tbody">
                            <tr data-testid="tr">
                                <td data-testid="td"></td>
                                <tbody data-testid="tbody">
                                    <custom-tag data-testid="custom-tag" attr-test="attr-test"></custom-tag>
                                </tbody>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>`;

        render(<main innerHTML={innerHTMLContent}><div data-testid="div">Parent</div></main>, container);

        expect(screen.getAllByTestId('div')[0].textContent).toBe('Parent');

        screen.getAllByTestId('div').forEach((el) => {
            expect(el.tagName).toBe('DIV');
            expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
        });
        screen.getAllByTestId('image').forEach((el) => {
            expect(el.tagName).toBe('IMG');
            expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
            expect(el).toHaveAttribute('src', 'http://i.imgur.com/w7GCRPb.png');
        });
        screen.getAllByTestId('span').forEach((el) => {
            expect(el.tagName).toBe('SPAN');
            expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
        });
        screen.getAllByTestId('input-text').forEach((el) => {
            expect(el.tagName).toBe('INPUT');
            expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
            expect(el).toHaveAttribute('type', 'text');
        });
        screen.getAllByTestId('table').forEach((el) => {
            expect(el.tagName).toBe('TABLE');
            expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
        });
    });

    it('Rendering correct svg on innerHtml attribute', () => {
        const innerHTMLContent = `
            <svg data-testid="svg">
                <g data-testid="g" stroke-width="5">
                    <svg data-testid="svg">
                        <foreignObject data-testid="foreignObject">
                            <svg data-testid="svg">
                                <image data-testid="image" xlinkHref="http://i.imgur.com/w7GCRPb.png" />
                            </svg>
                            <div data-testid="div" />
                        </foreignObject>
                    </svg>
                    <image data-testid="image" xlinkHref="http://i.imgur.com/w7GCRPb.png" />
                </g>
            </svg>`;
        
        render(<main innerHTML={innerHTMLContent} />, container);

        screen.getAllByTestId('svg').forEach((el) => {
            expect(el.namespaceURI).toBe('http://www.w3.org/2000/svg');
            expect(el.tagName).toBe('svg');
        });
        screen.getAllByTestId('foreignObject').forEach((el) => {
            expect(el.namespaceURI).toBe('http://www.w3.org/2000/svg');
            expect(el.tagName).toBe('foreignObject');
        });
        screen.getAllByTestId('g').forEach((g) => {
            expect(g.namespaceURI).toBe('http://www.w3.org/2000/svg');
            expect(g.tagName).toBe('g');
            expect(g.getAttribute('stroke-width')).toBe('5');
        });
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });
});