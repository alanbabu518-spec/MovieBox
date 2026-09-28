import { describe, expect, it } from "vitest";
import { Trie } from "../shared/utils/trie";

describe("Trie", () => {
  it("returns words matching a prefix", () => {
    const trie = new Trie();

    trie.insert("Batman");
    trie.insert("Batman Begins");
    trie.insert("Batman Returns");
    trie.insert("Superman");

    expect(trie.searchPrefix("bat")).toEqual([
      "Batman",
      "Batman Begins",
      "Batman Returns",
    ]);
  });

  it("is case insensitive", () => {
    const trie = new Trie();

    trie.insert("Batman");

    expect(trie.searchPrefix("BAT")).toEqual([
      "Batman",
    ]);
  });

  it("returns an empty array when prefix does not exist", () => {
    const trie = new Trie();

    trie.insert("Batman");

    expect(trie.searchPrefix("spider")).toEqual([]);
  });

  it("respects the result limit", () => {
    const trie = new Trie();

    trie.insert("Batman");
    trie.insert("Batman Begins");
    trie.insert("Batman Returns");

    expect(trie.searchPrefix("bat", 2)).toHaveLength(2);
  });

  it("ignores empty words", () => {
    const trie = new Trie();

    trie.insert("");

    expect(trie.searchPrefix("a")).toEqual([]);
  });
});