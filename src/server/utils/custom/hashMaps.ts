class HashMap<K, V> {
  private buckets: [K, V][][]; // Array of key-value pairs
  private size: number;
  private capacity: number;

  constructor(capacity = 10) {
    this.capacity = capacity;
    this.size = 0;
    this.buckets = new Array(capacity).fill(null).map(() => []);
  }

  private hash(key: K): number {
    return (
      (typeof key === 'string' ? this.stringHash(key) : Number(key)) %
      this.capacity
    );
  }

  private stringHash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) % this.capacity; // Prime number 31 helps reduce collisions
    }
    return hash;
  }

  set(key: K, value: V): void {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let pair of bucket) {
      if (pair[0] === key) {
        pair[1] = value; // Update existing key
        return;
      }
    }

    bucket.push([key, value]);
    this.size++;

    if (this.size / this.capacity > 0.7) this.resize(); // Resize when load factor exceeds 0.7
  }

  get(key: K): V | undefined {
    const index = this.hash(key);
    for (let [k, v] of this.buckets[index]) {
      if (k === key) return v;
    }
    return undefined;
  }

  delete(key: K): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1);
        this.size--;
        return true;
      }
    }
    return false;
  }

  private resize(): void {
    const newCapacity = this.capacity * 2;
    const newBuckets: [K, V][][] = new Array(newCapacity)
      .fill(null)
      .map(() => []);

    for (const bucket of this.buckets) {
      for (const [key, value] of bucket) {
        const newIndex =
          (typeof key === 'string' ? this.stringHash(key) : Number(key)) %
          newCapacity;
        newBuckets[newIndex].push([key, value]);
      }
    }

    this.capacity = newCapacity;
    this.buckets = newBuckets;
  }
}
