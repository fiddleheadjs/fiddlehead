import {jsx} from 'core.pkg';
import {Root} from './store';
import {renderView, cleanupView} from '../../../testUtils';
import {screen, waitFor} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('store.test.js', () => {
    const setMockValue = jest.fn();

    beforeEach(() => {
        renderView(<Root setMockValue={setMockValue}/>);
    });

    it('Components rendered correct when store updated',async () => {
        expect(screen.getByTestId('header').textContent).toBe('Header: ');
        expect(screen.getByTestId('footer-title').textContent).toBe('Footer: ');
        setMockValue.mockReturnValue('Menu');
        userEvent.click(screen.getByTestId('header-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('header').textContent).toBe('Header: Menu');
            expect(screen.getByTestId('footer-title').textContent).toBe('Footer: Menu');
        });
    });

    it('Components rendered correct when Children Components updated updated store',async () => {
        expect(screen.getByTestId('nav-list').textContent).toBe('Nav List: ');
        expect(screen.getByTestId('footer-nav-list').textContent).toBe('Nav list: ');
        setMockValue.mockReturnValue(1);
        userEvent.click(screen.getByTestId('nav-list-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('nav-list').textContent).toBe('Nav List: 1');
            expect(screen.getByTestId('footer-nav-list').textContent).toBe('Nav list: 1');
        });
    });

    it('Components rendered correct when store update functions called together', async () => {
        expect(screen.getByTestId('header').textContent).toBe('Header: ');
        expect(screen.getByTestId('nav-list').textContent).toBe('Nav List: ');
        setMockValue.mockReturnValue('Updated');
        userEvent.click(screen.getByTestId('set-multiple-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('header').textContent).toBe('Header: Updated');
            expect(screen.getByTestId('footer-title').textContent).toBe('Footer: Updated');
            expect(screen.getByTestId('nav-list').textContent).toBe('Nav List: Updated');
            expect(screen.getByTestId('footer-nav-list').textContent).toBe('Nav list: Updated');
        });
    });

    it('Store update functions call in effect hook', async () => {
        setMockValue.mockReturnValue(3);
        userEvent.click(screen.getByTestId('nav-list-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('nav-item').textContent).toBe('Nav Item: active');
        });
    });

    // TODO: check this
    // it('Store updated when component destroy functions called store update',async () => {
    //     setMockValue.mockReturnValue(1);
    //     userEvent.click(screen.getByTestId('nav-list-btn'));
    //     await waitFor(() => {
    //         expect(screen.getByTestId('footer-nav-item').textContent).toBe('Nav item: hidden');
    //     });
    // });

    async function resetView() {
        userEvent.click(screen.getByTestId('reset-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('header').textContent).toBe('Header: ');
            expect(screen.getByTestId('footer-title').textContent).toBe('Footer: ');
            expect(screen.getByTestId('nav-list').textContent).toBe('Nav List: ');
            expect(screen.getByTestId('footer-nav-list').textContent).toBe('Nav list: ');
        });
    }

    afterEach(async () => {
        await resetView();
        cleanupView();
        jest.resetAllMocks();
    });
});
