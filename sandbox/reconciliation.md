```

reconcileChildren(current)
    if current is a DynamicNode
        reconcileChildOfDynamicNode(current)
    else
        reconcileChildrenOfStaticNode(current)

reconcileChildOfDynamicNode(current)
    newChild = current.render();
    oldChild = current.alternative ? current.alternative.child : current.child;

    current.child = newChild;

    if (newChild === null && oldChild !== null)
        current.deletions = [oldChild]
    if (newChild !== null && oldChild === null)
        //this is creation, do nothing here
    if (newChild !== null && oldChild !== null)
        if is_same(newChild, oldChild)
            newChild.alternative = oldChild
            if newChild is a DynamicNode
                newChild.state = oldChild.state
        else
            current.deletions = [oldChild]

reconcileChildrenOfStaticNode(current)
    oldChildren = current.alternative.child*
    newChildren = current.child*

    oldMap, newMap = (
        for each _child of _children
            map[_child.key || _child.index] = _child
    )

    compare(oldMap, newMap) => (
        Delete:
            current.deletions.push(oldChild)
        Create:
            // do nothing here
        Update:
            newChild.alternative = oldChild;
            if newChild is a DynamicNode
                newChild.state = oldChild.state
    )

```
```

A1

reconcileChildren(A1)
    reconcileChildOfDynamicnNode(A1)

A1
B1

reconcileChildren(B1)
    reconcileChildOfDynamicNode(B1)

A1_________
B1_________
c1_________
d1______ d2
e1 e2 e3 e4

reconcileChildren(C1)
    reconcileChildrenOfStaticNode(C1)
reconcileChildren(D1)
    reconcileChildrenOfStaticNode(D1)
reconcileChildren(E1)
    reconcileChildrenOfStaticNode(E1)
reconcileChildren(E2)
    reconcileChildrenOfStaticNode(E2)
reconcileChildren(E3)
    reconcileChildrenOfStaticNode(E3)
reconcileChildren(D2)
    reconcileChildrenOfStaticNode(D2)
reconcileChildren(E4)
    reconcileChildrenOfStaticNode(E4)

```