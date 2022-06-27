import {jsx, useError} from 'core.pkg';
import {screen, waitFor} from '@testing-library/dom';
import {renderView, cleanupView} from '../../../testUtils';
import {Root} from './resetStateAfterRemove';
import userEvent from '@testing-library/user-event';

describe('keepStateBeforeRemove.test.js', () => {
    const getMockValue = jest.fn();
    beforeEach(() => {
        renderView(<Root getMockValue={getMockValue} />)
    });

    it('Rendering correct cat layout', () => {
        expect(screen.getByTestId('layout-text').textContent).toBe('This is cat layout');
        expect(screen.getByTestId('cat').textContent).toBe('There has a cat');
    });

    it('Rendering correct nodes when dog layout switched', async () => {
        getMockValue.mockReturnValue('dog');
        userEvent.click(screen.queryByTestId('layout-selection'));

        await waitFor(() => {
            expect(screen.getByTestId('layout-text').textContent).toBe('This is dog layout');
            expect(screen.getByTestId('dog').textContent).toBe('There has a dog');
        });
    });

    it('Reset count state when switch between two layouts', async () => {
        userEvent.click(screen.getByRole('button'));
        await waitFor(() => {
            expect(screen.getByTestId('cat').textContent).toBe('There have 2 cats');
        });

        await getLayoutSync('dog');
        userEvent.dblClick(screen.getByRole('button'));
        await waitFor(() => {
            expect(screen.getByTestId('dog').textContent).toBe('There have 3 dogs');
        });

        await getLayoutSync('cat');
        await waitFor(() => {
            expect(screen.getByTestId('cat').textContent).toBe('There has a cat');
        });

        await getLayoutSync('dog');
        await waitFor(() => {
            expect(screen.getByTestId('dog').textContent).toBe('There has a dog');
        });
    });

    async function getLayoutSync(layout) {
        if(layout === 'cat') {
            getMockValue.mockReturnValue('cat');
            userEvent.click(screen.queryByTestId('layout-selection'));
            await waitFor(() => {
                expect(screen.getByTestId('layout-text').textContent).toBe('This is dog layout');
            });
        } else {
            getMockValue.mockReturnValue('dog');
            userEvent.click(screen.queryByTestId('layout-selection'));
            await waitFor(() => {
                expect(screen.getByTestId('layout-text').textContent).toBe('This is dog layout');
            });
        }
    }

    afterEach(() => {
        cleanupView();
        jest.clearAllMocks();
    });
});