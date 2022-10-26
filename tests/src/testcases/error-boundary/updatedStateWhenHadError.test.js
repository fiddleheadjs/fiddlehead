import {jsx} from 'core.pkg';
import {screen, waitFor} from '@testing-library/dom';
import {renderView, cleanupView} from '../../../testUtils';
import Root from './updatedStateWhenHadError';
import userEvent from '@testing-library/user-event';

async function sleep() {
    return new Promise((resolve) => setTimeout(resolve, 50));
}

describe('updatedStateWhenHadError.test.js', () => {
    beforeEach(async () => {
        renderView(<Root />);
        await sleep();
    });

    it('States updated correctly when Components hadn\'t errors', async () => {
        userEvent.click(screen.getByTestId('error-btn'));
        await sleep();

        expect(screen.getByTestId('click-message').textContent).toBe('Clicks: 1');
        expect(screen.getByTestId('show-message').textContent).toBe('Shows: 1');
        expect(screen.getByTestId('count-message').textContent).toBe('Counts: 1');
    });

    it('The useCatch just once rendering', async () => {
        userEvent.click(screen.getByTestId('error-btn'));
        await sleep();
        userEvent.click(screen.getByTestId('error-btn'));
        await sleep();
        
        expect(screen.getByTestId('click-message').textContent).toBe('Clicks: 2');
        expect(screen.queryAllByTestId('error-message').length).toEqual(1);
    });

    afterEach(() => {
        cleanupView();
    });
});
