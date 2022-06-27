import {Root} from './modal';
import {jsx} from 'hook';
import {renderView, cleanupView} from '../../../testUtils';
import {screen, queryByTestId, waitFor} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('modal.test.js', () => {
    const getMockValue = jest.fn();
    const mockMountedFunction = jest.fn();
    const mockUnmountedFunction = jest.fn();

    beforeEach(() => {
        renderView(<Root getMockValue={getMockValue} mockMountedFunction={mockMountedFunction} mockUnmountedFunction={mockUnmountedFunction} />);
    });

    it('Portal component render correctly', async () => {
        await waitFor(() => {
            expect(queryByTestId(screen.getByTestId('component'), 'portal')).toBeNull();
            expect(screen.getByTestId('div').tagName).toBe('DIV');
            expect(screen.getByTestId('div').namespaceURI).toBe('http://www.w3.org/1999/xhtml');
            expect(screen.getByTestId('span').innerHTML).toBe('Portal Render');
        });
    });

    it('Effect callback and return callback of portal component called when parents component were re-rendered',async () => {
        await waitFor(() => {
            expect(mockMountedFunction).toBeCalledTimes(2);
        });
        
        userEvent.click(screen.getByTestId('message'));
        await waitFor(() =>{
            expect(mockMountedFunction).toBeCalledTimes(3);
        });

        userEvent.click(screen.getByTestId('set-show'));
        await waitFor(() =>{
            expect(mockUnmountedFunction).toBeCalledTimes(1);
        });
    });

    it('Portal components rendered correctly when the state changed', async () => {
        await waitFor(() => {
            expect(mockMountedFunction).toBeCalledTimes(2);
        });

        const countState = screen.getByTestId('message');
        expect(countState.innerHTML).toBe('0');

        getMockValue.mockReturnValue('Portal rendering');
        userEvent.click(countState);
        await waitFor(() =>{
            expect(countState.innerHTML).toBe('Portal rendering');
        });

        userEvent.click(screen.getByTestId('set-show'));
        await waitFor(() =>{
            expect(screen.queryByTestId('portal')).toBeNull();
        });
    });

    afterEach(() => {
        getMockValue.mockClear();
        cleanupView();
    });

});
