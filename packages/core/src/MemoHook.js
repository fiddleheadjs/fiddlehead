import {useRef} from './RefHook';
import {depsMismatch, warnIfDepsSizeChangedOnDEV} from './Dependencies';

function Memo() {
    this.value_ = undefined;
    this.lastDeps_ = undefined;
}

export let useMemo = (create, deps) => {
    let memo = useRef(new Memo()).current;
    
    warnIfDepsSizeChangedOnDEV(deps, memo.lastDeps_);

    if (depsMismatch(deps, memo.lastDeps_)) {
        memo.value_ = create();
        memo.lastDeps_ = deps;
    }

    return memo.value_;
};

export let useCallback = (callback, deps) => {
    let memo = useRef(new Memo()).current;

    warnIfDepsSizeChangedOnDEV(deps, memo.lastDeps_);

    if (depsMismatch(deps, memo.lastDeps_)) {
        memo.value_ = callback;
        memo.lastDeps_ = deps;
    }

    return memo.value_;
};
