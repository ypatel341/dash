class MinHeap {
  heap: { node: string; priority: number }[];

  constructor() {
    this.heap = [];
  }

  insert(node: string, priority: number) {
    // This is important because when inserting, we are pushing to the bottom of the array
    this.heap.push({ node, priority });
    // This bubble up method allows us to traverse the length of the array and swap in place for
    // moving the inserted node with edge into its place.
    this.bubbleUp();
  }

  extractMin(): { node: string; priority: number } | undefined {
    // remove the root
    // Move the last element in the heap to the root (i.e., replace the root with the last element).
    // BubbleDown the new root to restore order

    if(this.heap.length === 0){
        return undefined;
    }

    const min = this.heap.shift();
    const lastElement = this.heap.pop(); // Remove the last element

    if (this.heap.length > 0 && lastElement) {
        this.heap[0] = lastElement; // Move the last element to the root
        this.bubbleDown(); // Step 2: Restore heap property
    }

    return min; // Return the minimum element
  }

  private bubbleDown() {
    let index = 0
    
    while(this.heap.length - 1 > index){
        let parentIndex = Math.floor((index + 1) / 2);

        if(this.heap[parentIndex].priority <= this.heap[index].priority){
            break;
        }

        [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]]

        index = parentIndex;
    }
  }

  private bubbleUp() {
    // index = the index of the latest added value
    // since the bubbleUp method is ran after pushing. this is immediately invoked and assigned the last index
    let index = this.heap.length - 1;

    while (index > 0) {
        // binary heap with a binary search
      let parentIndex = Math.floor((index - 1) / 2);

      if (this.heap[parentIndex].priority <= this.heap[index].priority) {
        break;
      }

      [this.heap[parentIndex], this.heap[index]] = [
        this.heap[index],
        this.heap[parentIndex],
      ];

      index = parentIndex; // Move up
    }
  }
}
