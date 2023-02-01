import {jsx} from 'core.pkg';
import {screen} from '@testing-library/dom';
import {renderView, cleanupView, sleep} from '../../../testUtils';
import {App} from './rootUnderRoot';


describe('rootUnderRoot.test.js', () => {
    beforeEach(() => {
        renderView(<App />);
    });

    it('Error under a portal element should be catched', async () => {
        await sleep();
        let alert = screen.getByRole('alert');
        expect(alert.textContent).toBe('Something went wrong');
    });

    afterEach(() => {
        cleanupView();
    });
});
