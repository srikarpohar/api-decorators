export class Node<T> {
    data: T;
    next?: Node<T>;

    constructor(data: T) {
        this.data = data;
    }
}

export class LinkedList<T> {
    head?: Node<T>;

    appendNode(data: T) {
        if(!this.head) {
            this.head = new Node(data);
            return;
        }

        let temp = this.head;
        while(temp.next) {
            temp = temp.next;
        }

        temp.next = new Node(data);
        return;
    }

    appendNodes(data: T[]) {
        for(let row of data) {
            this.appendNode(row);
        }
    }
}