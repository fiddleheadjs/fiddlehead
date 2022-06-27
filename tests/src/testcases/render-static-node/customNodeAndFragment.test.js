import {Root} from './customNodeAndFragment';
import {jsx} from 'core.pkg';
import {renderView, cleanupView} from '../../../testUtils';
import {waitFor, screen} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('customNodeAndFragment.test.js', () => {
    beforeEach(() => {
        renderView(<Root />);
    });

    it('Rendering the correct custom nodes and contents in fragment nodes', () => {
        screen.getAllByTestId('myP').forEach((el) => {
            expect(el.tagName).toBe('MYP');
            expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
        });
        screen.getAllByTestId('mySpan').forEach((el) => {
            expect(el.tagName).toBe('MYSPAN');
            expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
        });
        screen.getAllByTestId('myDiv').forEach((el) => {
            expect(el.tagName).toBe('MYDIV');
            expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
        });

        expect(screen.queryByTestId('myText').tagName).toBe('MYTEXT');
        expect(screen.queryByTestId('myText').namespaceURI).toBe('http://www.w3.org/1999/xhtml');
        expect(screen.queryByTestId('myText').textContent).toBe('ChildA Component do something');
    });

    it('Re-Rendering the correct custom nodes and contents in fragment nodes', async () => {
        userEvent.click(screen.queryByTestId('myMain'));
        
        await waitFor(() => {
            screen.getAllByTestId('myP').forEach((el) => {
                expect(el.tagName).toBe('MYP');
                expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
            });
            screen.getAllByTestId('mySpan').forEach((el) => {
                expect(el.tagName).toBe('MYSPAN');
                expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
            });
            screen.getAllByTestId('myDiv').forEach((el) => {
                expect(el.tagName).toBe('MYDIV');
                expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
            });
            
            expect(screen.queryByTestId('myText').tagName).toBe('MYTEXT');
            expect(screen.queryByTestId('myText').namespaceURI).toBe('http://www.w3.org/1999/xhtml');
            expect(screen.queryByTestId('myText').textContent).toBe('ChildA Component');
        });
    });

    afterEach(() => {
        cleanupView();
    });
});