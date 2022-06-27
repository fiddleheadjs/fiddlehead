import {Root} from './specialHtmlCharacters';
import {jsx} from 'hook';
import {renderView, cleanupView} from '../../../testUtils';
import {waitFor, screen} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('specialHtmlCharacters.test.js', () => {
    beforeEach(() => {
        renderView(<Root />);
    });

    it('Rendering correct html special characters', () => {
        expect(screen.queryByTestId('main').textContent).toBe('(Root> ChildA )');
    });

    it('Re-rendering correct html special characters', async () => {
        userEvent.click(screen.queryByTestId('button'));
        await waitFor(() => {
            expect(screen.queryByTestId('main').textContent).toBe('Root> ChildA');
        });
    });

    afterEach(() => {
        cleanupView();
    });
});