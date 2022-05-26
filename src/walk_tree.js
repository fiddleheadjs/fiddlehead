const TAG_CREATE = 'create';
const TAG_UPDATE = 'update';
const TAG_DELETE = 'delete';

function Fiber(name, type) {
    this.name_ = name;
    this.type_ = type;
    this.parent_ = null;
    this.child_ = null;
    this.sibling_ = null;
    this.tag_ = null;
}

let branch = null;

const A1 = new Fiber('A1', 'div');
const B1 = new Fiber('B1', () => branch);
const B2 = new Fiber('B2', 'div');
const C1 = new Fiber('C1', 'div');
const C2 = new Fiber('C2', 'div');
const D1 = new Fiber('D1', 'div');
const D2 = new Fiber('D2', 'div');
const D3 = new Fiber('D3', 'div');
const D4 = new Fiber('D4', 'div');
const D5 = new Fiber('D5', 'div');
const D6 = new Fiber('D6', 'div');
const D7 = new Fiber('D7', 'div');
const E1 = new Fiber('E1', 'div');
const E2 = new Fiber('E2', 'div');
const E3 = new Fiber('E3', 'div');
const E4 = new Fiber('E4', 'div');
const E5 = new Fiber('E5', 'div');
const E6 = new Fiber('E6', 'div');
const E7 = new Fiber('E7', 'div');
const E8 = new Fiber('E8', 'div');
const E9 = new Fiber('E9', 'div');
const F1 = new Fiber('F1', 'div');
const F2 = new Fiber('F2', 'div');
const F3 = new Fiber('F3', 'div');
const F4 = new Fiber('F4', 'div');

A1.child_ = B1;
B1.parent_ = A1;

B1.sibling_ = B2;
B2.parent_ = A1;

C1.child_ = D1;
D1.parent_ = C1;

D1.sibling_ = D2;
D2.parent_ = C1;

D2.sibling_ = D3;
D3.parent_ = C1;

D1.child_ = E1;
E1.parent_ = D1;

E1.sibling_ = E2;
E2.parent_ = D1;

E2.sibling_ = E3;
E3.parent_ = D1;

D2.child_ = E4;
E4.parent_ = D2;

E4.sibling_ = E5;
E5.parent_ = D2;

E4.child_ = F1;
F1.parent_ = E4;

F1.sibling_ = F2;
F2.parent_ = E4;

C2.child_ = D4;
D4.parent_ = C2;

D4.sibling_ = D5;
D5.parent_ = C2;

D5.sibling_ = D6;
D6.parent_ = C2;

D6.sibling_ = D7;
D7.parent_ = C2;

D5.child_ = E6;
E6.parent_ = D5;

E6.sibling_ = E7;
E7.parent_ = D5;

D6.child_ = E8;
E8.parent_ = D6;

E8.sibling_ = E9;
E9.parent_ = D6;

E6.child_ = F3;
F3.parent_ = E6;

F3.sibling_ = F4;
F4.parent_ = E6;

const ChildrenDirection = 1;
const UncleDirection = 2;

function render(fiber) {
    console.log(fiber.name_ + ' | ' + fiber.tag_);
    
    if (typeof fiber.type_ === 'function') {
        const newChild = fiber.type_();
        fiber.child_ = newChild;
        if (newChild !== null) {
            newChild.parent_ = fiber;
        }
    }
}

function beginWork(current, direction) {
    if (direction === ChildrenDirection) {
        render(current);

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

// branch = null;
// console.log('------------ Null');
// beginWork(A1, ChildrenDirection);

branch = C1;
console.log('------------ C1');
beginWork(A1, ChildrenDirection);

branch = C2;
console.log('------------ C2');
beginWork(A1, ChildrenDirection);
