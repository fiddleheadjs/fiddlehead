import {jsx} from 'core.pkg';
import {App} from './insertBetweenOthers';
import {renderView, cleanupView, sleep} from '../../../testUtils';
import {waitFor, screen} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('renderCorrectInOrder', () => {
    beforeEach(() => {
        renderView(<App />);
    }); 

    it('correct order', async () => {
        const main = screen.getByRole('main');
        await sleep();
        await waitFor(() => {
            expect(main.textContent).toEqual(`Hello, How are you?___I'm fine, thank you!*** ... How about you?`);
        });
        await userEvent.keyboard('2');
        await waitFor(() => {
            expect(main.textContent).toEqual(`Hello, How are you?___I'm tired @@ ... How about you?`);
        });
        await userEvent.keyboard('3');
        await waitFor(() => {
            expect(main.textContent).toEqual(`Hello, How are you?___ ... How about you?`);
        });
        await userEvent.keyboard('2');
        await waitFor(() => {
            expect(main.textContent).toEqual(`Hello, How are you?___I'm tired @@ ... How about you?`);
        });
        await userEvent.keyboard('1');
        await waitFor(() => {
            expect(main.textContent).toEqual(`Hello, How are you?___I'm fine, thank you!*** ... How about you?`);
        });
    });

    afterEach(() => {
        cleanupView();
    });
});
