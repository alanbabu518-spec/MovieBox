import { Link } from "react-router-dom";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Popular", to: "/movies?category=popular" },
      { label: "Trending", to: "/movies?category=trending" },
      { label: "Upcoming", to: "/movies?category=upcoming" },
      { label: "AI Search", to: "/ai/search" },
    ],
  },
  {
    title: "Your space",
    links: [
      { label: "Favorites", to: "/favorites" },
      { label: "Watchlist", to: "/watchlist" },
      { label: "Profile", to: "/profile" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-6 border-t border-line">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-display text-xl font-extrabold">
            Movie<span className="text-brand">Box</span>
          </p>

          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Discover movies, keep a watchlist and find your next favorite
            film.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold">{column.title}</h3>

            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="border-t border-line px-4 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} MovieBox. Movie data provided by TMDB.
      </p>
    </footer>
  );
}