export interface TrieMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

interface TrieNode {
  children: Map<string, TrieNode>;
  movies: TrieMovie[];
  isEnd: boolean;
}

function createNode(): TrieNode {
  return {
    children: new Map(),
    movies: [],
    isEnd: false,
  };
}

export class MovieTrie {
  private root: TrieNode;

  constructor() {
    this.root = createNode();
  }

  insert(movie: TrieMovie) {
    const title = movie.title.toLowerCase().trim();

    if (!title) return;

    let node = this.root;

    for (const character of title) {
      if (!node.children.has(character)) {
        node.children.set(character, createNode());
      }

      node = node.children.get(character)!;

      if (
        node.movies.length < 10 &&
        !node.movies.some((item) => item.id === movie.id)
      ) {
        node.movies.push(movie);
      }
    }

    node.isEnd = true;
  }

  insertMany(movies: TrieMovie[]) {
    movies.forEach((movie) => this.insert(movie));
  }

  search(prefix: string, limit = 6): TrieMovie[] {
    const normalizedPrefix = prefix.toLowerCase().trim();

    if (!normalizedPrefix) return [];

    let node = this.root;

    for (const character of normalizedPrefix) {
      const nextNode = node.children.get(character);

      if (!nextNode) {
        return [];
      }

      node = nextNode;
    }

    return node.movies.slice(0, limit);
  }

  clear() {
    this.root = createNode();
  }
}