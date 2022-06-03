import { mount } from "../mount_vanila";
import {bench} from "../bench";

const root = document.getElementById("root");

const TABLE_ROWS = 10000;
console.log('Rows: ', TABLE_ROWS);

bench([renderFn1, renderFn2], 50);

function renderFn1(onFinish) {
    mount(App1(), root, {onFinish});
}

function renderFn2(onFinish) {
    mount(App2(), root, {onFinish});
}

function App1() {
    const arr = Array(TABLE_ROWS).fill(1);

    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    arr.forEach((_, i) => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');

        td1.textContent = i;
        td2.textContent = arr[i];

        tr.appendChild(td1);
        tr.appendChild(td2);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    
    return table;
}

function App2() {
    return document.createTextNode('ABCD');
}
