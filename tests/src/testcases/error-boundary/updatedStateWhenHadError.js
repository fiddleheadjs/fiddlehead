import {jsx, useCatch, useState} from "core.pkg";

export default function Root() {
    const [clicks, setClicks] = useState(0);

    return (
        <>
            <div data-testid="click-message">Clicks: {clicks}</div>
            <button data-testid="click-btn" onClick={() => setClicks(clicks + 1)}></button>
            <ErrorBoundary>
                <Contents setClicks={setClicks} />
            </ErrorBoundary>
        </>
    );
}

function ErrorBoundary({children}) {
    const [error, clearError] = useCatch();

    if (error === null) {
        return children;
    }

    return (
        <nav>
            {error !== null && (
                <>
                    <div data-testid="error-message">Oops: {error.message}</div>
                    <button onClick={() => clearError(null)}>
                        Clear error
                    </button>
                </>
            )}
        </nav>
    );
}

function Contents({setClicks}) {
    const [shows, setShows] = useState(0);

    return (
        <>
            <div data-testid="show-message">Shows: {shows}</div>
            <Content2 setClicks={setClicks} setShows={setShows} />
        </>
    );
}

function Content2({setClicks, setShows}) {
    const [count, setCount] = useState(0);

    return (
        <>
            <div data-testid="count-message">Counts: {count}</div>
            <button
                data-testid="error-btn"
                onClick={() => {
                    setCount((t) => count >= 1 ? (bug_count += 1) : count + 1);
                    setShows((t) => t + 1);
                    setClicks((t) => t + 1);
                }}
            ></button>
        </>
    );
}
