import {jsx, useEffect} from "core.pkg";
import {useStoreInit, useStoreRead, useStoreWrite} from "store.pkg";

export function Root({setMockValue}) {
    useStoreInit(Root, {
        byId: {}
    });
    return [<Header setMockValue={setMockValue} />, <Main setMockValue={setMockValue} />, <Footer />];
}

function Header({setMockValue}) {
    const headerTitle = useStoreRead(Root, (data) => data.byId['header-title']);

    return (
        <header data-testid="header">
            Header: {headerTitle}
            <Menu setMockValue={setMockValue} />
        </header>
    );
}

function Menu({setMockValue}) {
    const setHeaderTitle = useStoreWrite(Root, (data, value) => data.byId['header-title'] = value);

    return [
        <button
            data-testid="header-btn"
            onClick={(ev) => setHeaderTitle(setMockValue())}
        />,
    ];
}

function Main({setMockValue}) {
    return (
        <main>
            <Sidebar setMockValue={setMockValue} />
        </main>
    );
}

function Sidebar({setMockValue}) {
    const setHeaderTitle = useStoreWrite(Root, (data, value) => data.byId['header-title'] = value);
    const setNavList = useStoreWrite(Root, (data, value) => data.byId['nav-list'] = value);

    const navList = useStoreRead(Root, (data) => data.byId['nav-list']);

    return [
        <button
            data-testid="set-multiple-btn"
            onClick={(ev) => {
                setHeaderTitle(setMockValue());
                setNavList(setMockValue());
            }}
        />,
        <Nav
            navList={navList}
            setNavList={setNavList}
            setMockValue={setMockValue}
        />,
    ];
}

function Nav({navList, setNavList, setMockValue}) {
    return [
        <button
            data-testid="nav-list-btn"
            onClick={(ev) => setNavList(setMockValue())}
        />,
        navList >= 2 && <NavItem setMockValue={setMockValue} />,
        <div data-testid="nav-list">Nav List: {navList}</div>,
    ];
}

function NavItem({setMockValue}) {
    const navItem = useStoreRead(Root, (data) => data.byId['nav-item']);
    const setNav = useStoreWrite(Root, (data, value) => data.byId['nav-item'] = value);

    useEffect(() => {
        setNav('active');

        return () => {
            setNav('hidden');
        }
    }, []);

    return [
        <button
            data-testid="nav-list-btn"
            onClick={(ev) => setNav(setMockValue())}
        />,
        <div data-testid="nav-item">Nav Item: {navItem}</div>,
    ];
}

function Footer() {
    const headerTitle = useStoreRead(Root, (data) => data.byId['header-title']);
    const navList = useStoreRead(Root, (data) => data.byId['nav-list']);
    const navItem = useStoreRead(Root, (data) => data.byId['nav-item']);

    const resetById = useStoreWrite(Root, (data, value) => data.byId = value);

    return (
        <footer>
            <div data-testid="footer-title">Footer: {headerTitle}</div>
            <div data-testid="footer-nav-list">Nav list: {navList}</div>
            <div data-testid="footer-nav-item">Nav item: {navItem}</div>
            <button data-testid="reset-btn" onclick={() => {
                resetById({});
            }} />
        </footer>
    );
}
