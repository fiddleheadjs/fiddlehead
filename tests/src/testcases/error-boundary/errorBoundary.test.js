import {jsx, useCatch} from 'core.pkg';
import {screen, waitFor} from '@testing-library/dom';
import {renderView, cleanupView} from '../../../testUtils';
import {Root} from './errorBoundary';
import userEvent from '@testing-library/user-event';

async function sleep() {
    return new Promise((resolve) => setTimeout(resolve, 50));
}

describe('errorBoundary.test.js', () => {
    const getMockValue = jest.fn();

    it('Throw an error when Error hook called from outside of component', () => {
        expect(useCatch).toThrowError(new Error('Hooks can only be called inside a component.'));
    });

    it('Rendering corrected children when Components didn\'t have any error', async () => {
        getMockValue.mockReturnValue('');
        renderView(<Root getMockValue={getMockValue} />);
        await waitFor(() => {
            expect(screen.getByTestId('children').innerHTML).toEqual('Hello');
        });
    });
    
    it('Error state is not null when The component rendered fails',async () => {
        getMockValue.mockReturnValue('Error Boundary Component executed fail');
        const logInfo = jest.spyOn(console, 'info');
        const createRoot = () => renderView(<Root getMockValue={getMockValue} />);
        expect(createRoot).toThrowError(new Error('babel is not defined'));
        await waitFor(() => {
            expect(logInfo).toBeCalledTimes(1);
        });
    });

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

    it('Error state was null then clear error function called', async () => {
        getMockValue.mockReturnValue('Child component executed fail');
        renderView(<Root getMockValue={getMockValue} />);

        await waitFor(async () => {
            expect(
                screen.getByTestId('error-message').textContent
            )
            .toEqual('Error: Child component executed fail');
        });
        userEvent.click(screen.getByTestId('error-message'));
        await waitFor(async () => {
            expect(screen.queryByTestId('error-message')).toBe(null);
        });
    });

    it('clearError callback should not be changed', async () => {
        getMockValue.mockReturnValue(true);
        renderView(<Root getMockValue={getMockValue} />);
        await sleep();
        expect(parseInt(screen.getByTestId('count').textContent)).toBe(1);

        getMockValue.mockReturnValue(false);
        userEvent.click(screen.getByRole('main'));
        await sleep();
        expect(parseInt(screen.getByTestId('count').textContent)).toBe(1);

        getMockValue.mockReturnValue(true);
        userEvent.click(screen.getByRole('main'));
        await sleep();
        expect(parseInt(screen.getByTestId('count').textContent)).toBe(1);

        getMockValue.mockReturnValue(false);
        userEvent.click(screen.getByRole('main'));
        await sleep();
        expect(parseInt(screen.getByTestId('count').textContent)).toBe(1);

        getMockValue.mockReturnValue(true);
        userEvent.click(screen.getByRole('main'));
        await sleep();
        expect(parseInt(screen.getByTestId('count').textContent)).toBe(1);
    });

    afterEach(() => {
        cleanupView();
        jest.clearAllMocks();
    });
});
