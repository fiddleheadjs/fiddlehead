import {Root} from './alwaysMounted';
import {jsx} from 'core.pkg';
import {renderView, cleanupView} from '../../../testUtils';
import {waitFor} from '@testing-library/dom';

describe('alwaysMounted.test.js', () => {
    const mountedCallback1 = jest.fn();
    const mountedCallback2 = jest.fn();
    const mountedCallback3 = jest.fn();

    it('Layout effect callback called when state changed and the second param was undefined', async () => {
        renderView(
            <Root 
                renderCount={3}
                mountedCb1={mountedCallback1}
                mountedCb2={mountedCallback2}
                mountedCb3={mountedCallback3}
            />
        );

        expect(mountedCallback1).toHaveBeenCalledTimes(1);
        expect(mountedCallback2).toHaveBeenCalledTimes(1);
        expect(mountedCallback3).toHaveBeenCalledTimes(1);
        //because set state was nested to setTimeout so we need waitFor
        await waitFor(() => {
            expect(mountedCallback1).toHaveBeenCalledTimes(3);
            expect(mountedCallback2).toHaveBeenCalledTimes(4);
            expect(mountedCallback3).toHaveBeenCalledTimes(4);
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
        cleanupView();
    });
});
