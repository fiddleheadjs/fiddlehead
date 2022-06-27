import {Root} from './renderCorrectInOrder';
import {jsx} from 'hook';
import {renderView, cleanupView} from '../../../testUtils';
import {waitFor, screen} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('renderCorrectlyOrder.test.js', () => {
    const getMockValue = jest.fn();
    
    beforeEach(() => {
        renderView(<Root getMockValue={getMockValue} />);
    });

    it('Mounted render correctly content', () => {
        expect(screen.getByRole('main').textContent).toBe('It is component Children A some thing ...');
    });

    it('Removing element does not change order', async () => {
        getMockValue.mockReturnValue(2);
        userEvent.click(screen.getByRole('main'));

        await waitFor(() => {
            expect(screen.getByRole('main').textContent).toEqual('It is do some thing ...');
        });
    });

    it('Inserting element does not change order', async () => {
        getMockValue.mockReturnValue(2);
        userEvent.click(screen.getByRole('main'));
        getMockValue.mockReturnValue(1);
        userEvent.click(screen.getByRole('main'));

        await waitFor(() => {
            expect(screen.getByRole('main').textContent).toEqual('It is component Children A some thing ...');
        });
    });

    afterEach(() => {
        cleanupView();
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
});