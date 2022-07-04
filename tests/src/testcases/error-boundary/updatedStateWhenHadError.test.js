import {jsx} from 'core.pkg';
import {screen, waitFor} from '@testing-library/dom';
import {renderView, cleanupView} from '../../../testUtils';
import Root from './updatedStateWhenHadError';
import userEvent from '@testing-library/user-event';

describe('updatedStateWhenHadError.test.js', () => {
    beforeAll(() => {
        jest.useFakeTimers()
        renderView(<Root />);
    });

    it('States updated correctly when Components hadn\'t errors', async () => {
        userEvent.click(screen.getByTestId('error-btn'));
        
        await waitFor(() => {
            expect(screen.getByTestId('click-message').textContent).toBe('Clicks: 1');
            expect(screen.getByTestId('show-message').textContent).toBe('Shows: 1');
            expect(screen.getByTestId('count-message').textContent).toBe('Counts: 1');
        });
    });

    it('States updated correctly when Components had errors', async () => {
        userEvent.click(screen.getByTestId('error-btn'));
        jest.runAllTimers();
        
        await waitFor(() => {
            expect(screen.getByTestId('click-message').textContent).toBe('Clicks: 2');
            expect(screen.queryByTestId('show-message')).toBe(null);
            expect(screen.queryAllByTestId('error-message').length).toEqual(1);
        });
    });

    afterAll(() => {
        cleanupView();
        jest.clearAllMocks();
    });
});