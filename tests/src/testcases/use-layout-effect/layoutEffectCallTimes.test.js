import {Root} from './layoutEffectCallTimes';
import {jsx, useLayoutEffect} from 'hook';
import {renderView, cleanupView} from '../../../testUtils';
import {waitFor, screen} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('layoutEffectCallTimes.test.js', () => {
    const toBeCall1 = jest.fn();
    const toBeCall2 = jest.fn();
    const toBeCall3 = jest.fn();
    const toBeCall4 = jest.fn();
    const getMockValue = jest.fn();

    beforeEach(() => {
        renderView(
            <Root 
                getMockValue={getMockValue} 
                toBeCall1={toBeCall1} 
                toBeCall2={toBeCall2} 
                toBeCall3={toBeCall3} 
                toBeCall4={toBeCall4}
            />
        );
    });

    it('Throw an error when call effect hook from outside of the component', () => {
        expect(useLayoutEffect).toThrowError(new Error('Cannot use hooks from outside of components'));
    });

    it('Layout effect callback always call when component mounted', async () => {
        expect(toBeCall1).toBeCalledTimes(1);
        expect(toBeCall2).toBeCalledTimes(1);
        expect(toBeCall3).toBeCalledTimes(1);
    });

    it('Layout effect callback with dependency is undefined always called when component re-rendered', async () => {
        getMockValue.mockReturnValue(1);
        userEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(screen.getByTestId('render-state').textContent).toBe('1');
            expect(toBeCall1).toBeCalledTimes(2);
        });
    });

    it('Layout effect callback with dependency is an empty array didn\'t call when component re-rendered', async () => {
        getMockValue.mockReturnValue(1);
        userEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(screen.getByTestId('render-state').textContent).toBe('1');
            expect(toBeCall2).toBeCalledTimes(1);
        });
    });

    it('Layout effect callback always called when dependencies updated', async () => {
        getMockValue.mockReturnValue(1);
        userEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(screen.getByTestId('render-state').textContent).toBe('1');
            expect(toBeCall3).toBeCalledTimes(2);
        });
    });

    it('Layout effect destroy callback didn\'t call when component mounted', async () => {
        await waitFor(() => {
            expect(toBeCall4).toBeCalledTimes(0);
        });
    });

    it('Layout effect destroy callback call when component unmounted', async () => {
        getMockValue.mockReturnValue(false);
        userEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(toBeCall4).toBeCalledTimes(1);
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
        cleanupView();
    });
});
