export function getPathBetweenElements(ancestor: HTMLElement, descendant: HTMLElement): Array<HTMLElement> {
    if (!ancestor || !descendant || !ancestor.contains(descendant)) {
        return null;
    }

    if (ancestor === descendant) {
        return [ancestor];
    }

    const path: Array<HTMLElement> = [descendant];
    let currentNode = descendant;

    while (currentNode.parentNode && currentNode.parentNode !== ancestor) {
        currentNode = currentNode.parentNode as HTMLElement;
        path.unshift(currentNode);
    }

    path.unshift(ancestor);
    
    return path;
}