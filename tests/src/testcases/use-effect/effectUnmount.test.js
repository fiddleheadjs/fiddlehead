import {jsx} from 'core.pkg';
import {Root} from './effectUnmount';
import {renderView, cleanupView} from '../../../testUtils';
import {waitFor, screen} from '@testing-library/dom';

async function sleep(timeout) {
    return new Promise((resolve) => setTimeout(resolve, 100));
}

describe('effectUnmount.test.js', () => {
    jest.setTimeout(600000);
    const onUnmount = jest.fn();

    beforeEach(() => {
        renderView(<Root onUnmount={onUnmount}/>);
    });

    it('Toggle calling unmount callback', async () => {
        const button = screen.getByTitle('re-render button');
        const checkbox = screen.getByTitle('Toggle calling unmount callback');

        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(1);

        console.log('having unmount');
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(2);
        
        console.log('not having unmount');
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(2);

        console.log('not having unmount');
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(2);

        console.log('not having unmount');
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(2);

        console.log('not having unmount');
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(2);

        console.log('having unmount');
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(3);

        console.log('having unmount');
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(4);

        console.log('having unmount');
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(5);

        console.log('not having unmount');
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(5);

        console.log('having unmount');
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(6);
        
        console.log('having unmount');
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(7);
        
        console.log('not having unmount');
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(7);
        
        console.log('having unmount');
        checkbox.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(8);
        
        console.log('not having unmount');
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(8);
        
        console.log('not having unmount');
        button.click();
        await sleep();
        expect(onUnmount).toBeCalledTimes(8);

        console.log('not having unmount');
    });

    afterEach(() => {
        cleanupView();
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
});
