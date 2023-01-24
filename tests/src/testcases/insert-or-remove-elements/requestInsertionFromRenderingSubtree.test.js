import {jsx} from 'core.pkg';
import {Simple, Complex, SimpleMultiLevel, ComplexMultiLevel, Nested} from './requestInsertionFromRenderingSubtree';
import {renderView, cleanupView, sleep} from '../../../testUtils';
import {screen, waitFor} from '@testing-library/dom';

describe('requestInsertionFromRenderingSubtree', () => {
    it('Simple child list', async () => {
        renderView(<Simple />);
        await sleep(300);
        expect(screen.getByRole('main').textContent).toEqual('Bb');
    });
    
    it('Complex child list', async () => {
        renderView(<Complex />);
        await sleep(300);
        expect(screen.getByRole('main').textContent).toEqual('dBbCcbeDdEe');
    });
    
    it('Simple multi level', async () => {
        renderView(<SimpleMultiLevel />);
        await sleep(300);
        expect(screen.getByRole('main').textContent).toEqual('XY');
    });
    
    it('Complex multi level', async () => {
        renderView(<ComplexMultiLevel />);
        await sleep(300);
        expect(screen.getByRole('main').textContent).toEqual('dfffBbCcbfffeDdEeFFFfff');
    });
    
    it('Nested', async () => {
        renderView(<Nested />);
        await sleep(300);
        expect(screen.getByRole('main').textContent).toEqual('XYdfffBbCcXYbfffeDdEeFFFfffXY');
    });

    afterEach(() => {
        cleanupView();
    });
});
