import {STATE_ERROR} from './StateHook';

export let catchError = (error, vnode) => {
    let parent = vnode.parent_;
    let hook;

    while (parent !== null) {
        hook = parent.stateHook_;
        while (hook !== null) {
            if (hook.tag_ === STATE_ERROR) {
                hook.setValue_((prevError) => (
                    prevError != null ? prevError : error
                ));
                return;
            }
            hook = hook.next_;
        }
        parent = parent.parent_;
    }

    if (__DEV__) {
        console.info('You can catch the following exception by implementing an error boundary with the useCatch hook');
    }

    throw error;
};
