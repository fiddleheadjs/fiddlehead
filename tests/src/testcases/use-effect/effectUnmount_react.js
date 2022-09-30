import {createElement as jsx, useEffect, useState} from 'react';

export function Root({onUnmount}) {
    let [checked, setChecked] = useState(true);

    let [count, setCount] = useState(0);

    useEffect(() => {
        if (checked === false) {
            console.log('--remove unmount');
            return;
        }

        console.log('--add unmount');
        return () => {
            onUnmount();
        };
    }, [checked, count]);

    return (
        <div>
            <label title="Toggle calling unmount callback">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setChecked(y => !y)}
                />
                <span>Toggle calling unmount callback</span>
            </label>
            <br/>
            <button
                type="button"
                title="re-render button"
                onClick={() => setCount(c => c + 1)}
            >
                Re-render ({count})
            </button>
        </div>
    );
}
