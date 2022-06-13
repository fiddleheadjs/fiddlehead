import {render} from "../vanila";
import {bench} from "../bench";

const TABLE_ROWS = 10000;
console.log('Rows: ', TABLE_ROWS);

const root = document.getElementById("root");

bench([renderFn0, renderFn1, renderFn2], 10);

function renderFn0(onFinish) {
    render(App0(), root, {onFinish});
}

function renderFn1(onFinish) {
    render(App1(), root, {onFinish});
}

function renderFn2(onFinish) {
    render(App2(), root, {onFinish});
}

function App0() {
    return document.createTextNode('ABCD');
}

function App1() {
    const arr = Array(TABLE_ROWS).fill(1);

    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    arr.forEach((_, i) => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const text1 = document.createTextNode(i + '-aaa');
        const text2 = document.createTextNode(i + '-bbb');

        td1.appendChild(text1);
        td2.appendChild(text2);

        tr.appendChild(td1);
        tr.appendChild(td2);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    
    return table;
}

function App2() {
    const arr = Array(TABLE_ROWS).fill(1);

    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    arr.forEach((_, i) => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const text1 = document.createTextNode(i + '-aaa');
        const text2 = document.createTextNode(i + '-bbb');
        const i1 = document.createElement('i');
        const i2 = document.createElement('i');

        td1.appendChild(text1);
        td1.appendChild(i1);
        td2.appendChild(text2);
        td2.appendChild(i2);

        tr.appendChild(td1);
        tr.appendChild(td2);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    
    return table;
}
