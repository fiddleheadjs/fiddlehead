import {jsx} from 'core.pkg';
import {history, App} from './quicklyNavigateWithSlowConnection';
import {screen, waitFor} from '@testing-library/dom';
import {renderView, cleanupView, sleep} from '../../../testUtils';

describe('quicklyNavigateWithSlowConnection.test.js', () => {
    beforeEach(() => {
        renderView(<App/>);
    });

    afterEach(() => {
        cleanupView();
    });

    it('Renders homepage correctly', async () => {
        await waitFor(() => {
            expect(screen.getByRole('article').textContent).toBe('Homepage');
        });
    });

    it('Renders final page correctly after navigate many times quickly', async () => {
        await waitFor(() => {
            expect(screen.getByRole('article'));
        });
        history.push('/download');
        await sleep(30);
        history.push('/getting-started');
        await sleep(30);
        history.push('/api');
        await sleep(1000);
        expect(screen.getByRole('article').textContent).toBe('API');
    });
});
