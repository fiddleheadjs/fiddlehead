// It is required to use the same source with store
import {jsx, render} from 'core.pkg';
import {useStoreInit, useStoreRead, useStoreWrite} from 'store.pkg';

function App() {
    console.log('render App');

    useStoreInit(App, {
        ids: [],
        byId: {}
    });

    return [<List/>, <A/>, <B/>];
}

function List() {
    console.log('render List');

    const productA1 = useStoreRead(App, data => data.byId['A1']);
    const productB1 = useStoreRead(App, data => data.byId['B1']);

    return (
        <div class="List">
            <p>Product A1: {productA1}</p>
            <p>Product B1: {productB1}</p>
        </div>
    );
}

function A() {
    console.log('render A');

    const productA1 = useStoreRead(App, data => data.byId['A1']);
    const setProductA1 = useStoreWrite(App, (data, value) => data.byId['A1'] = value);

    return (
        <div class="A">
            <input value={productA1} onInput={ev => setProductA1(ev.target.value)}/>
        </div>
    );
}

function B() {
    console.log('render B');
    
    const productB1 = useStoreRead(App, data => data.byId['B1']);
    const setProductB1 = useStoreWrite(App, (data, value) => data.byId['B1'] = value);

    return (
        <div class="B">
            <input value={productB1} onInput={ev => setProductB1(ev.target.value)}/>
        </div>
    );
}

render(<App/>, document.getElementById('root'));
