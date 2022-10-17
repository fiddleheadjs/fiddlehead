import {STATE_ERROR} from './StateHook';

export let catchError = (error, vnode) => {
    let parent = vnode.parent_;
    let hook;

    while (parent !== null) {
        hook = parent.stateHook_;
        while (hook !== null) {
            if (hook.tag_ === STATE_ERROR) {
                // Throw the error asynchorously
                // to avoid blocking effect callbacks
                setTimeout(() => {
                    hook.setValue_((prevError) => {
                        if (prevError != null) {
                            return prevError;
                        }
                        if (error != null) {
                            return error;
                        }
                        // If a nullish (null or undefined) is catched,
                        // null will be returned
                        return null;
                    });
                });

                // It is done here
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
