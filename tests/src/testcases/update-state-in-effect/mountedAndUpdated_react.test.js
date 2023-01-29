import {Root} from './mountedAndUpdated_react';
import React from 'react';
import {React_renderViewAsync, cleanupView, sleep} from '../../../testUtils';
import {screen, waitFor} from '@testing-library/dom';
import userEvent from '@testing-library/user-event'

describe('mountedAndUpdated.test.js', () => {
    const getMockValue = jest.fn();

    const mountedCallback1 = jest.fn(); 
    const mountedCallback2 = jest.fn(); 
    const mountedCallback3 = jest.fn();

    const updatedCallback1 = jest.fn();
    const updatedCallback2 = jest.fn();
    const updatedCallback3 = jest.fn();

    let stateMock;

    beforeEach(async () => {
        stateMock = {a:{b: 1}, c: 3};
        
        getMockValue.mockReturnValue(stateMock);

        await React_renderViewAsync(
            <Root 
                stateMock={stateMock}
                getMockValue={getMockValue}
                mountedCb1={mountedCallback1}
                mountedCb2={mountedCallback2}
                mountedCb3={mountedCallback3}
                updatedCb1={updatedCallback1}
                updatedCb2={updatedCallback2}
                updatedCb3={updatedCallback3}
            />
        );
    });

    it('Effect called once when dependency param was an empty array',async () => {
        await waitFor(() => {
            //useEffect has dependency is empty array
            expect(mountedCallback1).toBeCalledTimes(1);
            expect(mountedCallback2).toBeCalledTimes(1);
            expect(mountedCallback3).toBeCalledTimes(1);
            //useEffect has dependency is variables
            expect(updatedCallback1).toBeCalledTimes(1);
            expect(updatedCallback2).toBeCalledTimes(1);
            expect(updatedCallback3).toBeCalledTimes(2); // TODO why 2?
        });
        
        userEvent.click(screen.getByTestId('count-button'));
        await waitFor(() => {
            //haven't call to effect callback when rerender
            expect(mountedCallback1).toBeCalledTimes(1);
            expect(mountedCallback2).toBeCalledTimes(1);
            expect(mountedCallback3).toBeCalledTimes(1);
        });
    });

    it('Effect called when dependency changed', async () => {
        stateMock = {a: 3};
        getMockValue.mockReturnValue(stateMock);
        await sleep();
        expect(updatedCallback1).toBeCalledTimes(1);
        expect(updatedCallback2).toBeCalledTimes(1);
        expect(updatedCallback3).toBeCalledTimes(2);
        await sleep();
        userEvent.click(screen.getByTestId('state-button'));
        await waitFor(() => {
            //change object state 
            expect(updatedCallback1).toBeCalledTimes(2);
            expect(updatedCallback2).toBeCalledTimes(2);
            expect(updatedCallback3).toBeCalledTimes(3);
        });
    });

    it('Effect did not call when object param in dependency changed',async () => {
        const setStateBtn = screen.getByTestId('state-button');
        
        stateMock.a = 2;
        getMockValue.mockReturnValue(stateMock);
        userEvent.click(setStateBtn);
        await waitFor(() => {
            //effect did call after object state changed
            expect(updatedCallback1).toBeCalledTimes(1);
            expect(updatedCallback2).toBeCalledTimes(1);
            expect(updatedCallback3).toBeCalledTimes(2);
        });

        getMockValue.mockReturnValue(stateMock);
        userEvent.click(setStateBtn);
        await waitFor(() => {
            //set state but state not change
            expect(updatedCallback1).toBeCalledTimes(1);
            expect(updatedCallback2).toBeCalledTimes(1);
            expect(updatedCallback3).toBeCalledTimes(2);
        });
    })

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        cleanupView();
    });
});
