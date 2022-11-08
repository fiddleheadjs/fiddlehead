import {jsx, useState} from 'core.pkg';

export let App = () => {
    let [count, setCount] = useState(0);
    if (count < 10) {
        setCount(count + 1);
    }
    return <main>{count}</main>;
};
