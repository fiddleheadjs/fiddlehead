import {jsx, render, useState, useEffect} from '../../../packages/core/index';
import {createStore, useReadableStore, useWritableStore} from '../../../packages/store/index';

const store = createStore({
    ids: [],
    byId: {}
});

function App() {
    console.log('render App');

    return [<List/>, <A/>, <B/>];
}

function List() {
    console.log('render List');

    const productA1 = useReadableStore(store, data => data.byId['A1']);
    const productB1 = useReadableStore(store, data => data.byId['B1']);

    return (
        <div class="List">
            <p>Product A1: {productA1}</p>
            <p>Product B1: {productB1}</p>
        </div>
    );
}

function A() {
    console.log('render A');

    const productA1 = useReadableStore(store, data => data.byId['A1']);
    const setProductA1 = useWritableStore(store, (data, value) => data.byId['A1'] = value);

    return (
        <div class="A">
            <input value={productA1} onInput={ev => setProductA1(ev.target.value)}/>
        </div>
    );
}

function B() {
    console.log('render B');
    
    const productB1 = useReadableStore(store, data => data.byId['B1']);
    const setProductB1 = useWritableStore(store, (data, value) => data.byId['B1'] = value);

    return (
        <div class="B">
            <input value={productB1} onInput={ev => setProductB1(ev.target.value)}/>
        </div>
    );
}

render(<App/>, document.getElementById('sandbox-container'));
