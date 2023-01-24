import React from 'react';
import {Root} from './effectUnmount_react';
import {cleanupView, React_renderViewAsync, sleep} from '../../../testUtils';
import {screen} from '@testing-library/dom';

describe('effectUnmount.test.js', () => {
    jest.setTimeout(600000);
    const onUnmount = jest.fn();

    beforeEach(async () => {
        await React_renderViewAsync(<Root onUnmount={onUnmount}/>);
    });

    it('Toggle calling unmount callback', async () => {
        const button = screen.getByTitle('re-render button');
        const checkbox = screen.getByTitle('Toggle calling unmount callback');

        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(1);

        // having unmount
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(2);
        
        // not having unmount
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(2);

        // not having unmount
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(2);

        // not having unmount
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(2);

        // not having unmount
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(2);

        // having unmount
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(3);

        // having unmount
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(4);

        // having unmount
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(5);

        // not having unmount
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(5);

        // having unmount
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(6);
        
        // having unmount
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(7);
        
        // not having unmount
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(7);
        
        // having unmount
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(8);
        
        // not having unmount
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(8);
        
        // not having unmount
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(8);

        // not having unmount
    });

    afterEach(() => {
        cleanupView();
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
});
