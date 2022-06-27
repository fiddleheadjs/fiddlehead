import {jsx, render} from 'hook';
import {screen} from '@testing-library/dom';

describe('svgNodeCreate.test', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    it('SVG nodes create correctly', () => {
        render(
            <svg>
                <image xlinkHref="http://i.imgur.com/w7GCRPb.png" />
            </svg>
        , container);

        const svgElement = container.firstElementChild;
        expect(svgElement.innerHTML).toContain('xlinkHref="http://i.imgur.com/w7GCRPb.png"');
    });

    it('Nodes create correctly', () => {
        render(
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
            </svg>,
        container);

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

    it('Can render SVG into a non-React SVG tree', () => {
        const outerSVGRoot = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        const containerSVG = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'g',
        );
        outerSVGRoot.appendChild(containerSVG);
        container.appendChild(containerSVG);

        render(<image data-testid="image" />, containerSVG);

        const image = screen.getByTestId('image');
        expect(image.namespaceURI).toBe('http://www.w3.org/2000/svg');
        expect(image.tagName).toBe('image');
    });

    afterEach(() => {
        document.body.removeChild(container);
    });
});
