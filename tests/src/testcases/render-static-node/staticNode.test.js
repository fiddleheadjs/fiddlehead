import {Root} from './staticNode';
import {jsx} from 'hook';
import {renderView, cleanupView} from '../../../testUtils';
import {screen} from '@testing-library/dom';

describe('staticNode.test.js', () => {
    beforeEach(() => {
        renderView(<Root />);
    });

    it('Rendering corrected static nodes when the state changed', async () => {
        screen.getAllByTestId('div').forEach((el) => {
            expect(el.tagName).toBe('DIV');
            expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
        });
        screen.getAllByTestId('image').forEach((el) => {
            expect(el.tagName).toBe('IMAGE');
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
        screen.getAllByTestId('tbody').forEach((el) => {
            expect(el.tagName).toBe('TBODY');
            expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
        });
        screen.getAllByTestId('custom-tag').forEach((el) => {
            expect(el.tagName).toBe('CUSTOM-TAG');
            expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
        });
    });

    it('Rendering the correct an array', () => {
        expect(screen.getAllByTestId('option').length).toBe(5);
        screen.getAllByTestId('option').forEach((el) => {
            expect(el.tagName).toBe('OPTION');
            expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
        });
    });

    afterEach(() => {
        cleanupView();
    });
});