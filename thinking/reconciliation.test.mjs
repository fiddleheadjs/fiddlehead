import {reconcileChildren} from './reconciliation.mjs';
import {Node} from './Node.mjs';

const c1 = new Node('c1', 'div');
const d1 = new Node('d1', 'div');
const d2 = new Node('d2', 'div');
const e1 = new Node('e1', 'div');
const e2 = new Node('e2', 'div');
const e3 = new Node('e3', 'div');
const e4 = new Node('e4', 'div');
const A1 = new Node('A1', () => B1);
const B1 = new Node('B1', () => c1);

/*
A1_________
B1_________
c1_________
d1______ d2
e1 e2 e3 e4
*/

c1.child_ = d1;
d1.child_ = e1;
d2.child_ = e4;

d1.sibling_ = d2;
e1.sibling_ = e2;
e2.sibling_ = e3;

d1.parent_ = c1;
d2.parent_ = c1;
e1.parent_ = d1;
e2.parent_ = d1;
e3.parent_ = d1;
e4.parent_ = d2;

function performUnitOfWork(current) {
    console.log(current.name_);
    reconcileChildren(current);
}

const ChildrenDirection = 1;
const UncleDirection = 2;

function beginWork(current, direction) {
    if (direction === ChildrenDirection) {
        performUnitOfWork(current);

        if (current.child_ !== null) {
            beginWork(current.child_, ChildrenDirection);
            return;
        }

        if (current.sibling_ !== null) {
            beginWork(current.sibling_, ChildrenDirection);
            return;
        }
    } else if (direction === UncleDirection) {
        if (current.sibling_ !== null) {
            beginWork(current.sibling_, ChildrenDirection);
            return;
        }
    }

    if (current.parent_ !== null) {
        beginWork(current.parent_, UncleDirection);
    }
}

beginWork(A1, ChildrenDirection);
