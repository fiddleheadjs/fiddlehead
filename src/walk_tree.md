```
==== (BEGIN) A1

A1

==== A1.child -> B1

A1
B1

==== B1.child -> C1

A1
B1
C1

==== C1.child -> D1

A1
B1
C1
D1

==== D1.child -> E1

A1
B1
C1
D1
E1

==== E1.child ; E1.sibling -> E2

A1___
B1___
C1___
D1___
E1 E2

==== E2.child ; E2.sibling -> E3

A1______
B1______
C1______
D1______
E1 E2 E3

==== E3.child ; E3.sibling ; E3.parent -> D1
^^^^ D1.sibling -> D2

A1_________
B1_________
C1_________
D1______ D2 
E1 E2 E3

==== D2.child -> E4

A1_________
B1_________
C1_________
D1______ D2 
E1 E2 E3 E4

==== E4.child -> F1

A1_________
B1_________
C1_________
D1______ D2 
E1 E2 E3 E4
         F1

==== F1.child ; F1.sibling -> F2

A1____________
B1____________
C1____________
D1______ D2___
E1 E2 E3 E4___
         F1 F2

==== F2.child ; F2.sibling ; F2.parent -> E4
^^^^ E4.sibling -> E5

A1_______________
B1_______________
C1_______________
D1______ D2______
E1 E2 E3 E4___ E5
         F1 F2

==== E5.child ; E5.sibling ; E5.parent -> D2
^^^^ D2.sibling -> D3

A1__________________
B1__________________
C1__________________
D1______ D2______ D3
E1 E2 E3 E4___ E5
         F1 F2

==== D3.child ; D3.sibling ; D3.parent -> C1
^^^^ C1.sibling ; C1.parent -> B1
^^^^ B1.sibling -> B2

A1_____________________
B1__________________ B2
C1__________________
D1______ D2______ D3
E1 E2 E3 E4___ E5
         F1 F2

==== B2.child ; B2.sibling ; B2.parent -> A1
^^^^ A1.sibling ; A1.parent ; (END)

UPDATE

A1_____________________
B1__________________ B2
C2__________________
D4 D5______ D6___ D7
   E6___ E7 E8 E9
   F3 F4

LOGIC

walk(current, direction)
    if direction is ChildrenDirection
        perform(current)

    if direction is ChildrenDirection
        if current.child
            walk(current.child, ChildrenDirection)
        if current.sibling
            walk(current.sibling, ChildrenDirection)
        if current.parent
            walk(current.parent, UncleDirection)

    if direction is UncleDirection
        if current.sibling
            walk(current.sibling, ChildrenDirection)
        if current.parent
            walk(current.parent, UncleDirection)

```

// {root} -> (old) -> ... -> {old} -> (old) -> ...
// {root} -> (new) -> ... -> {new}
// {root} -> (new) -> ... -> {new} -> (new) -> ...
// 

// {root} -> (old) -> div -> p -> ... -> {old} -> (old) -> ...
//
// {root} -> (new) -> div -> span -> ... -> {new}
// U         U        U      C              C
//                        ~> p -> ... -> {old} -> (old) -> ...
//                           D           D        D
//
// {root} -> (new) -> div -> p -> ... -> {new}
// U         U        U      U           U (reuse old state)
//
// {root} -> (new) -> div -> p -> ... -> div -> {new}
// U         U        U      U           U      
//        ~> (old) ~> div ~> p ~> ... ~> div ~> {old} ~> (old) ~> ...
//           U        U      D           D      D
//                                       |
//                                       same parent -> {old} === {new} ? YES -> reuse old state
//                                                                        NO  -> new node
//
---
A1
B1 B2 __ B4
---
A1
__ B2 B3 C4
---

Update: A1, B2, 
Delete: B1, B4
Create: B3, C4

```

if parent is Update {
    oldChildren = parent.alternative.child->...
    newChildren = parent.child->...

    oldMap, newMap = (
        for each _child of _children
            map.set(_child.key or _child.index, _child)
    )

    compare(oldMap, newMap) => (
        Update: newChild.alternative = oldChild
        Delete: parent.deletions.push(oldChild)
        Create:
    )
}

if parent is Delete {
    each child is Delete
}

if parent is Create {
    each child is Create
}

```