import {useRef} from './RefHook';
import {depsMismatch, warnIfDepsSizeChangedOnDEV} from './Dependencies';

function Memo() {
    this.value_ = undefined;
    this.prevDeps_ = undefined;
}

export let useMemo = (create, deps) => {
    let memo = useRef(new Memo()).current;
    
    warnIfDepsSizeChangedOnDEV(deps, memo.prevDeps_);

    if (depsMismatch(deps, memo.prevDeps_)) {
        memo.value_ = create();
        memo.prevDeps_ = deps;
    }

    return memo.value_;
};

export let useCallback = (callback, deps) => {
    let memo = useRef(new Memo()).current;

    warnIfDepsSizeChangedOnDEV(deps, memo.prevDeps_);

    if (depsMismatch(deps, memo.prevDeps_)) {
        memo.value_ = callback;
        memo.prevDeps_ = deps;
    }

    return memo.value_;
};
