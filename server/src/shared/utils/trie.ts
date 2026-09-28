type TrieNode = {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  word: string | null;
};

export class Trie {
  private root: TrieNode;

  constructor() {
    this.root = {
      children: new Map(),
      isEnd: false,
      word: null,
    };
  }

  insert(word: string) {
    const normalizedWord = word.trim().toLowerCase();

    if (!normalizedWord) {
      return;
    }

    let current = this.root;

    for (const character of normalizedWord) {
      if (!current.children.has(character)) {
        current.children.set(character, {
          children: new Map(),
          isEnd: false,
          word: null,
        });
      }

      current = current.children.get(character)!;
    }

    current.isEnd = true;
    current.word = word.trim();
  }

  searchPrefix(prefix: string, limit = 10): string[] {
    const normalizedPrefix = prefix.trim().toLowerCase();

    if (!normalizedPrefix) {
      return [];
    }

    let current = this.root;

    for (const character of normalizedPrefix) {
      const node = current.children.get(character);

      if (!node) {
        return [];
      }

      current = node;
    }

    const results: string[] = [];

    this.collectWords(current, results, limit);

    return results;
  }

  private collectWords(
    node: TrieNode,
    results: string[],
    limit: number,
  ) {
    if (results.length >= limit) {
      return;
    }

    if (node.isEnd && node.word) {
      results.push(node.word);
    }

    for (const child of node.children.values()) {
      if (results.length >= limit) {
        return;
      }

      this.collectWords(child, results, limit);
    }
  }
}