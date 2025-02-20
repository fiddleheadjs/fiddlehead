import {STATE_ERROR} from './StateHook';
import {scheduleTimeout} from './Util';

export let catchError = (error, vnode) => {
    let parent = vnode.parent_;
    let hook;

    while (parent !== null) {
        hook = parent.stateHook_;
        while (hook !== null) {
            if (hook.tag_ === STATE_ERROR) {
                // Throw the error asynchorously
                // to avoid blocking effect callbacks
                scheduleTimeout(() => {
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
        console.info('Let\'s try to implement an error boundary with useCatch hook to provide a better user experience.');
    }

    throw error;
};
