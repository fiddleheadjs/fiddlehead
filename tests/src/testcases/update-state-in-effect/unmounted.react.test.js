import React from 'react';
import {Root} from './unmounted.react';
import {cleanupView, React_renderViewAsync} from '../../../testUtils';
import {screen, waitFor} from '@testing-library/dom';
import userEvent from '@testing-library/user-event'

describe('unmounted.test.js', () => {
    const unmountedCallback1 = jest.fn();
    const unmountedCallback2 = jest.fn();

    beforeEach(async () => {
        await React_renderViewAsync(
            <Root 
                unmountedCb1={unmountedCallback1} 
                unmountedCb2={unmountedCallback2} 
            />
        );
    });

    it('The Effect called the return function when the component unmounted',async () => {
        expect(screen.queryByTestId('mount-effect').innerHTML).toBe('<div></div>');
        //mounted component
        await waitFor(() => {
            expect(unmountedCallback1).toBeCalledTimes(0);
            expect(unmountedCallback2).toBeCalledTimes(0);
        });

        userEvent.click(screen.getByTestId('show-button'));

        await waitFor(() => {
            expect(unmountedCallback1).toBeCalledTimes(1);
            expect(unmountedCallback2).toBeCalledTimes(1);
            expect(screen.queryByTestId('mount-effect').innerHTML).toBe('');
        });
    });

    afterEach(() => {
        cleanupView();
        jest.clearAllMocks();
    });
});
