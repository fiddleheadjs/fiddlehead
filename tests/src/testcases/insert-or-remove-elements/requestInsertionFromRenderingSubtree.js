import {jsx, useState, useEffect, useLayoutEffect} from 'core.pkg';

export function Simple() {
    const [bx, showBx] = useState(false);

    return (
        <main>
            <B showBx={showBx} />
            {bx && 'b'}
        </main>
    );
}

export function Complex() {
    const [bx, showBx] = useState(false);
    const [cx, showCx] = useState(false);
    const [dx, showDx] = useState(false);
    const [ex, showEx] = useState(false);

    return (
        <main>
            {dx && 'd'}
            <B showBx={showBx} />
            {bx && 'b'}
            <C showCx={showCx} />
            {cx && 'c'}
            {bx && 'b'}
            <i>
                <>
                    {ex && 'e'}
                    <D showDx={showDx} />
                </>
                {dx && 'd'}
                <E showEx={showEx} />
            </i>
            {ex && 'e'}
        </main>
    );
}

export function SimpleMultiLevel() {
    const [ , toggle] = useState(false);

    return (
        <main>
            <XY toggle={toggle}/>
        </main>
    );
}

export function ComplexMultiLevel() {
    return (
        <main>
            <ML />
        </main>
    );
}

export function Nested() {
    return (
        <main>
            <ML>
                <SL />
            </ML>
        </main>
    );
}

function SL() {
    const [ , toggle] = useState(false);

    return (
        <>
            <XY toggle={toggle}/>
        </>
    );
}

function ML({children}) {
    const [bx, showBx] = useState(false);
    const [cx, showCx] = useState(false);
    const [dx, showDx] = useState(false);
    const [ex, showEx] = useState(false);
    const [fx, showFx] = useState(false);

    return (
        <>
            {children}
            {dx && 'd'}
            {fx && <><i>f<><><u>f</u></></>f</i></>}
            <B showBx={showBx} />
            {bx && 'b'}
            <C showCx={showCx} />
            {cx && 'c'}
            {children}
            {bx && 'b'}
            {fx && <><i>f<><><u>f</u></></>f</i></>}
            {ex && 'e'}
            <D showDx={showDx} />
            {dx && 'd'}
            <E showEx={showEx} />
            {ex && 'e'}
            <F showFx={showFx}/>
            {fx && 'fff'}
            {children}
        </>
    );
}

function B({showBx}) {
    showBx(true);

    return 'B';
}

function C({showCx}) {
    useEffect(() => {
        showCx(true);
    }, []);

    return 'C';
}

function D({showDx}) {
    useLayoutEffect(() => {
        showDx(true);
    }, []);

    return 'D';
}

function E({showEx}) {
    setTimeout(() => {
        showEx(true);
    }, 100);

    return 'E';
}

function F({showFx}) {
    showFx(true);

    return (
        <>
            <>{['F']}</>
            <span>
                <>
                    <b>
                        <>
                            <i>
                                {'F'}
                            </i>
                        </>
                        {'F'}
                    </b>
                </>
            </span>
        </>
    );
}

function XY({toggle}) {
    toggle(true);

    return (
        <span>
            {'X'}
            {'Y'}
        </span>
    );
}
