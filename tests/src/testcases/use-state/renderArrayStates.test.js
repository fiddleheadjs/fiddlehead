import {Root, arrayMock} from './renderArrayStates';
import {renderView, cleanupView} from '../../../testUtils';
import {jsx} from 'hook';
import {screen, waitFor} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('renderArrayStates.test.js', () => {
    const getMockValue = jest.fn();

    beforeEach(() => {
        renderView(<Root getMockValue={getMockValue} />);
    });

    it('String item render correctly', () => {
        const stringItem = screen.getByTestId('item-string');

        expect(stringItem.innerHTML).toEqual('string');
        expect(stringItem.style.color).toEqual(arrayMock[0].style.color);
    });

    it('Number item render correctly', () => {
        const numberItem = screen.getByTestId('item-number');

        expect(numberItem.innerHTML).toEqual('1');
    });

    it('Array item render correctly', () => {
        const arrayItem = screen.getByTestId('item-array');

        expect(arrayItem.innerHTML).toEqual(arrayMock[5].content.join(''));
    });

    it('Object item render correctly', () => {
        const objectItem = screen.getByTestId('item-object');

        expect(objectItem.innerHTML).toEqual('');
    });

    it('Function item render correctly', () => {
        const functionItem = screen.getByTestId('item-function');

        expect(functionItem.innerHTML).toBe('');
    });

    it('Null item render correctly', () => {
        const nullItem = screen.getByTestId('item-null');

        expect(nullItem.innerHTML).toBe('');
    });

    it('Undefined item render correctly', () => {
        const undefineItem = screen.getByTestId('item-undefined');

        expect(undefineItem.innerHTML).toBe('');
    });

    it('Re-rendering correct array items', async () => {
        getMockValue.mockReturnValue(arrayMock.slice(2, 5));
        userEvent.click(screen.queryByTestId('items'));
        
        await waitFor(() => {
            expect(screen.queryByTestId('item-number')).toBeNull();
            expect(screen.queryByTestId('item-object')).toBeNull();

            expect(screen.getByTestId('item-function').innerHTML).toBe('');
            expect(screen.getByTestId('item-undefined').innerHTML).toBe('');
        });
    });

    afterEach(() => {
        cleanupView();
    });
});