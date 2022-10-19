import {Root} from './ref';
import {renderView, cleanupView} from '../../../testUtils';
import {jsx, useRef} from 'core.pkg';
import {screen} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('ref.test.js', () => {
    const errorLog = jest.spyOn(console, 'error');
    const getMockValue = jest.fn();

    it('Should error when call ref hook from outside of the component', () => {
        expect(useRef).toThrowError(new Error('Hooks can only be called inside a component.'));
    });

    it('Ref current is not null', async () => {
        getMockValue.mockReturnValue(true);
        renderView(<Root getMockValue={getMockValue} />);
        const buttonEle = screen.getByTestId('button');
        userEvent.click(buttonEle);
        expect(buttonEle).toHaveFocus();
    });

    it('Ref properties must created from useRef', () => {
        getMockValue.mockReturnValue(false);
        renderView(<Root />);
        expect(errorLog).toBeCalledTimes(1);
    });

    afterEach(() => {
        cleanupView();
        jest.clearAllMocks();
    });
});
