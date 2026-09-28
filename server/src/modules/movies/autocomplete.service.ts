import { Trie } from "../../shared/utils/trie.js";

const movieTrie = new Trie();

export const addMovieTitles = (titles: string[]) => {
  for (const title of titles) {
    movieTrie.insert(title);
  }
};

export const getMovieSuggestions = (
  query: string,
  limit = 10,
) => {
  return movieTrie.searchPrefix(query, limit);
};