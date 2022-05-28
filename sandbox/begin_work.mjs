import {reconcileChildren} from './reconciliation.mjs';
import {Node} from './Node.mjs';
import chalk from 'chalk';
import {mountEffects, unmountEffects} from './effects.mjs';
import {deleteView, insertView, updateView} from './commit_view.mjs';

let branch = null;

const Cx = () => branch === B1 ? c1 : c2;
const Fx = () => g1;

const A1 = new Node('A1', () => branch);
const B1 = new Node('B1', Cx);
const B2 = new Node('B2', Cx);
const c1 = new Node('c1', 'div');
const c2 = new Node('c2', 'div');
const d1 = new Node('d1', 'div');
const d2 = new Node('d2', 'div');
const d3 = new Node('d3', 'div');
const d4 = new Node('d4', 'div');
const e1 = new Node('e1', 'b', 'b');
const e2 = new Node('e2', 'div');
const e3 = new Node('e3', 'i', 'i');
const e4 = new Node('e4', 'div');
const e5 = new Node('e5', 'div');
const e6 = new Node('e6', 'i', 'i');
const e7 = new Node('e7', 'b', 'b');
const e8 = new Node('e8', 'div');
const e9 = new Node('e9', 'div');
const F1 = new Node('F1', Fx);
const f2 = new Node('f2', 'div');
const g1 = new Node('g1', 'div');

// Note:
// e1 === e7
// e3 === e6

/*
A1_______________
B1_______________
c1_______________
d1______ d2______
e1 e2 e3 .. e4 e5
*/

c1.child_ = d1;
d1.child_ = e1;
d2.child_ = e4;

d1.sibling_ = d2;
e1.sibling_ = e2;
e2.sibling_ = e3;
e4.sibling_ = e5;

d1.parent_ = c1;
d2.parent_ = c1;
e1.parent_ = d1;
e2.parent_ = d1;
e3.parent_ = d1;
e4.parent_ = d2;
e5.parent_ = d2;

d1.slot_ = 0;
d2.slot_ = 1;
e1.slot_ = 0;
e2.slot_ = 1;
e3.slot_ = 2;
e4.slot_ = 1;
e5.slot_ = 2;

/*
A1__________________
B2__________________
c2__________________
d3_________ d4______
e6 .. e7___ e8 e9 ..
      F1 f2
      g1
*/

c2.child_ = d3;
d3.child_ = e6;
d4.child_ = e8;
e7.child_ = F1;

d3.sibling_ = d4;
e6.sibling_ = e7;
e8.sibling_ = e9;
F1.sibling_ = f2;

d3.parent_ = c2;
d4.parent_ = c2;
e6.parent_ = d3;
e7.parent_ = d3;
e8.parent_ = d4;
e9.parent_ = d4;
F1.parent_ = e7;
f2.parent_ = e7;

d3.slot_ = 0;
d4.slot_ = 1;
e6.slot_ = 0;
e7.slot_ = 2;
e8.slot_ = 0;
e9.slot_ = 1;
F1.slot_ = 0;
f2.slot_ = 1;

const SubtreeRoot = 0;
const ChildrenDirection = 1;
const UncleDirection = 2;

function performUnitOfWork(current, direction) {
    reconcileChildren(current);

    if (direction === SubtreeRoot) {
        console.log(current.name_, 'root_node');
    } else {
        if (current.alternative_ !== null) {
            console.log(chalk.blue('update_node'), current.name_ + ' ← ' + current.alternative_.name_);

            const lastNativeNode = updateView(current, current.alternative_);
            if (current.sibling_ !== null) {
                current.sibling_.previousSiblingNativeNode_ = lastNativeNode;
            }

            current.alternative_ = null;
        } else {
            console.log(chalk.green('create_node'), current.name_);
            
            const lastNativeNode = insertView(current, current.previousSiblingNativeNode_);
            if (current.sibling_ !== null) {
                current.sibling_.previousSiblingNativeNode_ = lastNativeNode;
            }

            current.previousSiblingNativeNode_ = null;

            mountEffects(current);
        }
    }
    
    if (current.deletions_ !== null) {
        console.log('  ', chalk.red('delete_subtrees'), current.deletions_.map(d => d.name_).join(' '));

        current.deletions_.forEach(subtree => {
            unmountEffects(subtree);
            deleteView(subtree);
        });
        current.deletions_ = null;
    }
}

function beginWork(current, direction) {
    if (direction === SubtreeRoot || direction === ChildrenDirection) {
        performUnitOfWork(current, direction);

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

console.log('---- B1');
branch = B1;
beginWork(A1, SubtreeRoot);

console.log('---- B2');
branch = B2;
beginWork(A1, SubtreeRoot);

console.log('---- B1');
branch = B1;
beginWork(A1, SubtreeRoot);

console.log('---- B2');
branch = B2;
beginWork(A1, SubtreeRoot);

console.log('---- B1');
branch = B1;
beginWork(A1, SubtreeRoot);

console.log('---- null');
branch = null;
beginWork(A1, SubtreeRoot);

B1.child_ = null;
B2.child_ = null;
F1.child_ = null;

console.log('---- B2');
branch = B2;
beginWork(A1, SubtreeRoot);
