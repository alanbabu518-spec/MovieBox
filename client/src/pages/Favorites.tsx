import { Heart } from "lucide-react";

import CollectionPage from "../shared/components/movie/CollectionPage";
import {
  getFavorites,
  removeFromFavorites,
} from "../shared/services/favorites.api";

export default function Favorites() {
  return (
    <CollectionPage
      kind="favorites"
      title="My Favorites"
      icon={Heart}
      countLabel={(count) =>
        `${count} ${count === 1 ? "movie" : "movies"} you love`
      }
      emptyTitle="No favorites yet"
      emptyText="Tap the heart on any movie to save it here."
      signedOutTitle="Sign in to see your favorites"
      load={getFavorites}
      remove={removeFromFavorites}
    />
  );
}