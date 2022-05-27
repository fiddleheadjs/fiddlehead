export function Node(name, type, key = null) {
    this.name_ = name;
    this.type_ = type;
    this.key_ = key;
    this.slot_ = null;
    this.parent_ = null;
    this.child_ = null;
    this.sibling_ = null;
    this.alternative_ = null;
    this.deletions_ = null;
}
