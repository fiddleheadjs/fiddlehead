import {jsx, useEffect} from "core.pkg";
import {createStore, useReadableStore, useWritableStore} from "store.pkg";

const colorStore = createStore({
    color: ''
});

const routeStore = createStore({
    'route-name': ''
});

export function Root({setMockValue1, setMockValue2}) {
    return [
        <Header />,
        <Main setMockValue1={setMockValue1} setMockValue2={setMockValue2} />,
        <Footer />,
    ];
}

function Header() {
    const color = useReadableStore(
        colorStore,
        (data) => data["color"]
    );

    return (
        <header data-testid="header">
            Header: {color}
        </header>
    );
}

function Main({setMockValue1, setMockValue2}) {
    return (
        <main>
            <Sidebar
                setMockValue1={setMockValue1}
                setMockValue2={setMockValue2}
            />
            <Content />
        </main>
    );
}

function Sidebar({setMockValue1, setMockValue2}) {
    const setColor = useWritableStore(
        colorStore,
        (data, value) => (data["color"] = value)
    );
    const setRouteName = useWritableStore(
        routeStore,
        (data, value) => (data["route-name"] = value)
    );

    const routeName = useReadableStore(
        routeStore,
        (data) => data["route-name"]
    );

    useEffect(() => {
        if(routeName === 'product') {
            setColor('green');
        }
    }, [routeName]);

    return [
        <button
            data-testid="set-multiple-btn"
            onClick={(ev) => {
                setRouteName(setMockValue2());
                setColor(setMockValue1());
            }}
        />,
        <button 
            data-testid="set-route"
            onClick={() => setRouteName(setMockValue2())}
        />
    ];
}

function Content() {
    const routeName = useReadableStore(
        routeStore,
        (data) => data["route-name"]
    );
    const color = useReadableStore(
        colorStore,
        (data) => data["color"]
    );

    return [
        <div data-testid="content-route">Route: {routeName}</div>,
        <div data-testid="content-color">Color: {color}</div>,
    ];
}

function Footer() {
    const routeName = useReadableStore(
        routeStore,
        (data) => data["route-name"]
    );
    const color = useReadableStore(
        colorStore,
        (data) => data["color"]
    );

    const resetColorStore = useWritableStore(
        colorStore,
        (data, value) => (data['color'] = value)
    );
    const resetRouteStore = useWritableStore(
        routeStore,
        (data, value) => (data['route-name'] = value)
    );

    return (
        <footer>
            <div data-testid="footer-route">Route: {routeName}</div>
            <div data-testid="footer-color">Color: {color}</div>
            <button
                data-testid="reset-btn"
                onclick={() => {
                    resetColorStore('');
                    resetRouteStore('');
                }}
            />
        </footer>
    );
}
