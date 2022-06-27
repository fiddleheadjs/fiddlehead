import {Root} from './renderState';
import {jsx, useState} from 'hook';
import {renderView, cleanupView} from '../../../testUtils';
import {screen, waitFor} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('renderState.test.js', () => {
    const getMockValue = jest.fn();
    let setStateBtn, displayState1Elm, displayState2Elm; 

    beforeEach(() => {
        renderView(<Root getMockValue={getMockValue} />);

        displayState1Elm = screen.getByTestId('state1');
        displayState2Elm = screen.getByTestId('state2');
        setStateBtn = screen.getByTestId('state-btn1');
    });

    it('Throw an error when state hook called from outside of the component', () => {
        expect(useState).toThrowError(new Error('Cannot use hooks from outside of components'));
    });

    it('The state updated when the set state function called', async () => {
        expect(setStateBtn).not.toBeDisabled();
        getMockValue.mockReturnValue(true);
        userEvent.click(setStateBtn);
        await waitFor(() => {
            expect(setStateBtn).toBeDisabled();
        });
    });

    it('Should render number state correctly', async () => {
        let stateMock = 5;
        getMockValue.mockReturnValue(stateMock);
        userEvent.click(setStateBtn);
        await waitFor(() => {
            expect(displayState1Elm.innerHTML).toEqual(stateMock.toString());
        });
    });

    it('Should render string state correctly', async () => {
        let stateMock = 'state updated';
        getMockValue.mockReturnValue(stateMock);
        userEvent.click(setStateBtn);
        await waitFor(() => {
            expect(displayState1Elm.innerHTML).toEqual(stateMock);
        });
    });

    it('The components rendered correctly when the set state function called from children\'s components', async () => {
        let stateMock = 'state updated';
        getMockValue.mockReturnValue(stateMock);

        userEvent.click(screen.getByTestId('state-btn2'));
        await waitFor(() => {
            expect(displayState1Elm.innerHTML).toEqual(stateMock);
        });
    });

    it('States were single synchronous when calling many set state functions at one time', async () => {
        let stateMock = 'state updated';
        getMockValue.mockReturnValue(stateMock);

        userEvent.click(screen.getByTestId('handle-button'));
        await waitFor(() => {
            expect(displayState1Elm.innerHTML).toEqual(stateMock);
            expect(displayState2Elm.innerHTML).toEqual('1');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        cleanupView();
    });
});
