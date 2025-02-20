import {jsx} from 'core.pkg';
import {Root} from './multipleStore';
import {renderView, cleanupView} from '../../../testUtils';
import {screen, waitFor} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('multipleStore.test.js', () => {
    const setMockValue1 = jest.fn();
    const setMockValue2 = jest.fn();

    beforeEach(() => {
        renderView(<Root setMockValue1={setMockValue1} setMockValue2={setMockValue2} />);
    });

    it('Stores updated together',async () => {
        setMockValue1.mockReturnValue('red');
        setMockValue2.mockReturnValue('home');
        userEvent.click(screen.getByTestId('set-multiple-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('content-route').textContent).toBe('Route: home');
            expect(screen.getByTestId('content-color').textContent).toBe('Color: red');
        });
    });

    it('Stores impacted to effect hook',async () => {
        setMockValue2.mockReturnValue('product');
        userEvent.click(screen.getByTestId('set-route'));
        
        await waitFor(() => {
            expect(screen.getByTestId('content-route').textContent).toBe('Route: product');
            expect(screen.getByTestId('content-color').textContent).toBe('Color: green');
        });
    });
    
    async function resetView() {
        userEvent.click(screen.getByTestId('reset-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('footer-route').textContent).toBe('Route: ');
            expect(screen.getByTestId('footer-color').textContent).toBe('Color: ');
        });
    }

    afterEach(async () => {
        await resetView();
        cleanupView();
        jest.resetAllMocks();
    });
});
