class Queue<T> {
  private items: T[] = [];

  enqueue(item: T) {
    return this.items.push(item);
  }

  dequeue(): T | undefined {
    // shifts all values to the left by 1 and decrements the length by 1, resulting in the first element being removed.
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
