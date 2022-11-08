
import React from 'react';
import {App} from './setStateInRender_react';
import {cleanupView, React_renderViewAsync} from '../../../testUtils';
import {screen, waitFor} from '@testing-library/dom';

describe('effectUnmount.test.js', () => {
    beforeEach(async () => {
        await React_renderViewAsync(<App/>);
    });

    it('Re-render multiple times', async () => {
        await waitFor(() => {
            expect(screen.getByRole('main').textContent).toBe('10');
        });
    });

    afterEach(() => {
        cleanupView();
    });
});
