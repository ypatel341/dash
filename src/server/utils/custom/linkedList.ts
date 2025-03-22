class listNode<T> {
  head: T;
  next: listNode<T> | null;

  constructor(head: T) {
    this.head = head;
    this.next = null;
  }
}

/**
 *const linkedList = new LinkedList();
  linkedList.insertAtHead(1);
  linkedList.insertAtTail(2);
  linkedList.insertAtTail(3);
 */

class LinkedList<T> {
  head: listNode<T> | null = null;

  insertAtHead(value: T) {
    const newNode = new listNode(value);
    newNode.next = this.head;
    this.head = newNode;
  }

  insertAtTail(value: T) {
    if (!this.head) {
      this.insertAtHead(value);
      return;
    }
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = new listNode(value);
  }

  search(value: T): boolean {
    let current = this.head;
    while (current) {
      if (current.head === value) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  delete(value: T): void {
    if (!this.head) return;

    if (this.head.head === value) {
      this.head = this.head.next;
      return;
    }

    let current = this.head;
    while (current.next) {
      if (current.next.head === value) {
        current.next = current.next.next;
        return;
      }
      current = current.next;
    }
  }

  printList(): void {
    let current = this.head;
    let result = '';
    while (current) {
      result += `${current.head} -> `;
      current = current.next;
    }
    result += 'null';
    console.log(result);
  }
}
