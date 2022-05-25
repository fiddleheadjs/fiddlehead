function Fiber(name, type) {
    this.name_ = name;
    this.type_ = type;
    this.parent_ = null;
    this.child_ = null;
    this.sibling_ = null;
}

const A1 = new Fiber('A1', 'div');
const B1 = new Fiber('B1', () => C1);
const B2 = new Fiber('B2', 'div');
const C1 = new Fiber('C1', 'div');
const D1 = new Fiber('D1', 'div');
const D2 = new Fiber('D2', 'div');
const D3 = new Fiber('D3', 'div');
const E1 = new Fiber('E1', 'div');
const E2 = new Fiber('E2', 'div');
const E3 = new Fiber('E3', 'div');
const E4 = new Fiber('E4', 'div');
const E5 = new Fiber('E5', 'div');
const F1 = new Fiber('F1', 'div');
const F2 = new Fiber('F2', 'div');

A1.child_ = B1;
B1.parent_ = A1;

B1.sibling_ = B2;
B2.parent_ = A1;

// B1 is a functional node
// C1 will be created when running B1.type_

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

const ChildrenDirection = 1;
const UncleDirection = 2;

function render(fiber) {
    console.log(fiber.name_);
    
    if (typeof fiber.type_ === 'function') {
        const newChild = fiber.type_();
        newChild.parent_ = fiber;
        fiber.child_ = newChild;
    }
}

function performUnitOfWork(current, direction) {
    if (direction === ChildrenDirection) {
        render(current);

        if (current.child_ !== null) {
            performUnitOfWork(current.child_, ChildrenDirection);
            return;
        }

        if (current.sibling_ !== null) {
            performUnitOfWork(current.sibling_, ChildrenDirection);
            return;
        }
    } else if (direction === UncleDirection) {
        if (current.sibling_ !== null) {
            performUnitOfWork(current.sibling_, ChildrenDirection);
            return;
        }
    }

    if (current.parent_ !== null) {
        performUnitOfWork(current.parent_, UncleDirection);
    }
}

performUnitOfWork(A1, ChildrenDirection);
