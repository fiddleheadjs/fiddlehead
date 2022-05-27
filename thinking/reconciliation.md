```

reconcileChildren(current)
    if current is a FunctionNode
        reconcileChildOfFunctionNode(current)
    if current is a StaticNode
        reconcileChildrenOfStaticNode(current)

reconcileChildOfFunctionNode(current)
    newChild = current.render();
    oldChild = current.alternative.child;

    current.child = newChild;

    if (newChild === null && oldChild !== null)
        current.deletions = [oldChild]
    if (newChild !== null && oldChild === null)
        //this is creation, do nothing here
    if (newChild !== null && oldChild !== null)
        if is_same(newChild, oldChild)
            newChild.alternative = oldChild
            if newChild is a FunctionNode
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
        Update:
            if newChild is a FunctionNode
                newChild.alternative = oldChild
            if newChild is a StaticNode
                newChild.alternative = oldChild
        Delete:
            current.deletions.push(oldChild)
        Create:
    )

```