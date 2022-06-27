import {Root} from './memoizedNode';
import {jsx} from 'hook';
import {renderView, cleanupView} from '../../../testUtils';
import {waitFor, screen} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('memoizedNode.test.js', () => {
    const getMockValue = jest.fn();

    beforeEach(() => {
        renderView(<Root getMockValue={getMockValue} />);
    });

    it('Memoized Node renders correctly', () => {
        expect(screen.getByTestId('memoized-node').textContent).toBe('a Memoized Node, Stating is hiding');
    });

    it('Component saved in state hook is null', () => {
        expect(screen.getByTestId('state-component').innerHTML).toBe('');
    });

    it('Re-rendering correct memoized node', async () => {
        userEvent.click(screen.queryByTestId('btn-count'));
        await waitFor(() => {
            expect(screen.getByTestId('memoized-node').textContent).toBe('a Memoized Node, Stating is hiding');
        });
    });

    it('Updating correct memoized node has state',async () => {
        userEvent.click(screen.queryByTestId('btn-show'));
        await waitFor(() => {
            expect(screen.queryByTestId('childA').textContent).toBe('showing');
        });
    });

    it('State Component renders correct', async () => {
        getMockValue.mockReturnValue(<p>State Component</p>);
        userEvent.click(screen.getByTestId('state-component'));

        await waitFor(() => {
            expect(screen.getByTestId('state-component').innerHTML).toBe('<p>State Component</p>');
        });
    });

    afterEach(() => {
        getMockValue.mockClear();
        cleanupView();
    });
});