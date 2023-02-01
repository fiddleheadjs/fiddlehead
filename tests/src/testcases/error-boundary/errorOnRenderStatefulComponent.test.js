import {jsx} from 'core.pkg';
import {screen} from '@testing-library/dom';
import {renderView, cleanupView, sleep} from '../../../testUtils';
import {App} from './errorOnRenderStatefulComponent';

describe('errorOnRenderStatefulComponent.test', () => {
    beforeEach(() => {
        renderView(<App />);
    });

    it('Error from a stateful component when rendering should be catched', async () => {
        await sleep();
        let alert = screen.getByRole('alert');
        expect(alert.textContent).toBe('Something went wrong');
    });

    afterEach(() => {
        cleanupView();
    });
});
