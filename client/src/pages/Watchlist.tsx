import { Bookmark } from "lucide-react";

import CollectionPage from "../shared/components/movie/CollectionPage";
import {
  getWatchlist,
  removeFromWatchlist,
} from "../shared/services/watchlist.api";

export default function Watchlist() {
  return (
    <CollectionPage
      kind="watchlist"
      title="My Watchlist"
      icon={Bookmark}
      countLabel={(count) =>
        `${count} ${count === 1 ? "movie" : "movies"} to watch later`
      }
      emptyTitle="Your watchlist is empty"
      emptyText="Add movies you want to watch and they’ll wait for you here."
      signedOutTitle="Sign in to view your watchlist"
      load={getWatchlist}
      remove={removeFromWatchlist}
    />
  );
}