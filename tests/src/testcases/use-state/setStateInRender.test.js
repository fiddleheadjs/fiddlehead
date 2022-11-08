import {jsx} from 'core.pkg';
import {App} from './setStateInRender';
import {cleanupView, renderView, sleep} from '../../../testUtils';
import {screen} from '@testing-library/dom';

describe('effectUnmount.test.js', () => {
    beforeEach(() => {
        renderView(<App/>);
    });

    it('Re-render multiple times', async () => {
        await sleep(1000);
        expect(screen.getByRole('main').textContent).toBe('10');
    });

    afterEach(() => {
        cleanupView();
    });
});
