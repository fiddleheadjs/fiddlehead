import {StateHook, STATE_ERROR} from './StateHook';

export function catchError(error, virtualNode) {
    let parent = virtualNode.parent_;
    let hook;

    while (parent !== null) {
        hook = parent.hook_;
        while (hook !== null) {
            if (hook instanceof StateHook && hook.tag_ === STATE_ERROR) {
                hook.setValue_(function (prevError) {
                    return prevError || error;
                });
                return;
            }
            hook = hook.next_;
        }
        parent = parent.parent_;
    }

    if (__DEV__) {
        setTimeout(function () {
            console.info('You can catch this error by implementing an error boundary with the useError hook');
        });
    }

    throw error;
}
