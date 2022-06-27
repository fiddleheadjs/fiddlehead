import {Root} from './refInEffect';
import {renderView, cleanupView} from '../../../testUtils';
import {jsx} from 'hook';
import {screen, waitFor} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('refInEffect.test.js', () => {
    const refCallTimes = jest.fn();

    beforeEach(() => {
        renderView(<Root refCallTimes={refCallTimes} />)
    });

    it('Ref wasn\'t null when component was mounted', async () => {
        await waitFor(() => {
            expect(refCallTimes).toBeCalledTimes(2);
            expect(screen.getByRole('button')).toHaveFocus();
        });
    });

    it('Ref is not null in unmounted callback', async () => {
        userEvent.click(screen.getByRole('main'));

        await waitFor(() => {
            expect(refCallTimes).toBeCalledTimes(5);
            expect(screen.queryByRole('button')).toBeNull();
        });
    });

    it('Ref is null when component is rendering', () => {
        expect(refCallTimes).toBeCalledTimes(0);
        expect(screen.getByRole('button')).not.toHaveFocus();
    });

    afterEach(() => {
        cleanupView();
        jest.clearAllMocks();
    });
});
