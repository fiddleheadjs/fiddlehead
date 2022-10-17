import {jsx, useCatch} from 'core.pkg';
import {screen, waitFor} from '@testing-library/dom';
import {renderView, cleanupView} from '../../../testUtils';
import {Root} from './effectWhenError';
import userEvent from '@testing-library/user-event';

async function sleep() {
    return new Promise((resolve) => setTimeout(resolve, 50));
}

describe('errorBoundary.test.js', () => {
    const getMockValue = jest.fn();

    it('Error state wasn\'t null when children components rendered fails', async () => {
        getMockValue.mockReturnValue('Child component executed fail');
        renderView(<Root getMockValue={getMockValue} />);
        await waitFor(() => {
            expect(
                screen.getByTestId('error-message').textContent
            )
            .toEqual('Error: Child component executed fail');
        });
    });

    it('Error state wasn\'t null when effect callback executed fail', async () => {
        getMockValue.mockReturnValue('Effect executed fail');
        renderView(<Root getMockValue={getMockValue} />);
        await waitFor(() => {
            expect(
                screen.getByTestId('error-message').textContent
            )
            .toEqual('Error: Effect executed fail');
        });
    });

    it('Error state wasn\'t null when destroying callback of component executed fail', async () => {
        getMockValue.mockReturnValue('Unmounted callback executed fail');
        renderView(<Root getMockValue={getMockValue} />);
        getMockValue.mockReturnValue(false);
        userEvent.click(screen.getByRole('main'));
        await waitFor(() => {
            expect(
                screen.getByTestId('error-message').textContent
            )
            .toEqual('Error: Unmounted callback executed fail');
        });
    });

    afterEach(() => {
        cleanupView();
        jest.clearAllMocks();
    });
});
