import {Root} from './effectCalledTimes';
import {jsx, useEffect} from 'core.pkg';
import {renderView, cleanupView} from '../../../testUtils';
import {waitFor, screen} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('effectCallTimes.test.js', () => {
    const toBeCall1 = jest.fn();
    const toBeCall2 = jest.fn();
    const toBeCall3 = jest.fn();
    const toBeCall4 = jest.fn();
    const getMockValue = jest.fn();

    beforeEach(() => {
        renderView(<Root getMockValue={getMockValue} toBeCall1={toBeCall1} toBeCall2={toBeCall2} toBeCall3={toBeCall3} toBeCall4={toBeCall4}/>);
    });

    it('Effect callback always call when component mounted', async () => {
        await waitFor(() => {
            expect(toBeCall1).toBeCalledTimes(1);
            expect(toBeCall2).toBeCalledTimes(1);
            expect(toBeCall3).toBeCalledTimes(1);
        });
    });

    it('Effect callback with dependency is undefined always call when component re-rendered', async () => {
        getMockValue.mockReturnValue(1);
        userEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(toBeCall1).toBeCalledTimes(2);
        });
    });

    it('Effect callback with dependency is an empty array doesn\'t call when component re-rendered', async () => {
        getMockValue.mockReturnValue(1);
        userEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(toBeCall2).toBeCalledTimes(1);
        });
    });

    it('Effect callback always call when dependency has updated', async () => {
        getMockValue.mockReturnValue(1);
        userEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(toBeCall3).toBeCalledTimes(2);
        });
    });

    it('Effect destroy callback doesn\'t call when component mounted', async () => {
        await waitFor(() => {
            expect(toBeCall4).toBeCalledTimes(0);
        });
    });

    it('Effect destroy callback call when component unmounted', async () => {
        getMockValue.mockReturnValue(false);
        userEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(toBeCall4).toBeCalledTimes(1);
        });
    });

    it('Throw an error when call effect hook from outside of the component', () => {
        expect(useEffect).toThrowError(new Error('Hooks can only be called inside a component.'));
    });

    afterEach(() => {
        cleanupView();
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
});
