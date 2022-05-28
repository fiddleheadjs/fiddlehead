import chalk from 'chalk';

export const updateView = (node, alternative) => {
    // Return last native node
    return node.name_;
}

export const insertView = (node, prevNativeNode) => {
    if (prevNativeNode !== null) {
        console.log('  ', chalk.yellow('after'), prevNativeNode);
    }

    // Return last native node
    return node.name_;
}

export const deleteView = (subtree) => {

}
