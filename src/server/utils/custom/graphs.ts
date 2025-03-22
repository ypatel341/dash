class Graph {
  adjacencyList: Map<string, [string, number][]>;

  constructor() {
    this.adjacencyList = new Map();
  }

  addEdge(node1: string, node2: string, weight: number) {
    if (!this.adjacencyList.has(node1)) {
      this.adjacencyList.set(node1, []);
    }
    if (!this.adjacencyList.has(node2)) {
      this.adjacencyList.set(node2, []);
    }

    this.adjacencyList.get(node1)!.push([node2, weight]);
    this.adjacencyList.get(node2)!.push([node1, weight]);
  }
}
