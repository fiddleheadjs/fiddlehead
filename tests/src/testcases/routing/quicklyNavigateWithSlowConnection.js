import {jsx, useEffect, useState} from 'core.pkg';
import {createBrowserHistory} from 'history';

export let history = createBrowserHistory();

export let useLocation = () => {
    let [, setKey] = useState(history.location.key);

    useEffect(() => {
        return history.listen(() => {
            setKey(history.location.key);
        });
    }, []);

    return history.location;
};

let routes = {
    '/': {
        data: 'Homepage',
        timeout: 100,
    },
    '/getting-started': {
        data: 'Getting Started',
        timeout: 120,
    },
    '/api': {
        data: 'API',
        timeout: 10,
    },
    '/download': {
        data: 'Download',
        timeout: 500,
    }
};

let NotFound = {
    data: 'Not found',
    timeout: 0,
};

export function App() {
    let location = useLocation();

    return (
        <div-app>
            <Layout
                // Uncomment this line to avoid this kind of error
                // key={location.pathname}
            >
                <Article path={location.pathname}/>
            </Layout>
        </div-app>
    );
}

function Layout({children}) {
    let location = useLocation();

    return (
        <div-layout key={location.pathname}>
            {children}
        </div-layout>
    );
}

function Article({path}) {
    let [data, setData] = useState(null);

    useEffect(() => {
        let {data, timeout} = routes[path] ?? NotFound;

        setTimeout(() => {
            setData(data);
        }, timeout);
    }, [path]);

    if (data === null) {
        return null;
    }

    return (
        <article role="article">
            {data}
        </article>
    );
}
