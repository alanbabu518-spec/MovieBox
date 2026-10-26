import {
  Drama,
  Eye,
  Ghost,
  Laugh,
  Rocket,
  Swords,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import SectionHeader from "../ui/Sectionheader";
import { useAuth } from "../../context/AuthContext";

const GENRES: {
  id: string;
  label: string;
  icon: LucideIcon;
  tint: string;
}[] = [
  { id: "28", label: "Action", icon: Swords, tint: "from-orange-500/35 to-red-900/50" },
  { id: "18", label: "Drama", icon: Drama, tint: "from-violet-500/35 to-indigo-900/50" },
  { id: "35", label: "Comedy", icon: Laugh, tint: "from-sky-500/35 to-blue-900/50" },
  { id: "878", label: "Sci-Fi", icon: Rocket, tint: "from-cyan-400/30 to-sky-900/50" },
  { id: "27", label: "Horror", icon: Ghost, tint: "from-red-500/40 to-rose-950/60" },
  { id: "53", label: "Thriller", icon: Eye, tint: "from-zinc-400/30 to-zinc-800/60" },
];

export default function GenreTiles() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const gate = (event: React.MouseEvent) => {
    if (loading) {
      event.preventDefault();
      return;
    }

    if (!user) {
      event.preventDefault();
      navigate("/signin");
    }
  };

  return (
    <section className="mb-10 sm:mb-14" aria-label="Browse by genre">
      <SectionHeader title="Browse by Genre" />

      <ul
        role="list"
        className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0"
      >
        {GENRES.map(({ id, label, icon: Icon, tint }) => (
          <li key={id} className="w-[27vw] max-w-[150px] min-w-[96px] flex-none snap-start lg:w-auto lg:max-w-none">
            <Link
              to={`/movies?category=popular&genre=${id}`}
              onClick={gate}
              className={`relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-line bg-linear-to-br ${tint} transition-transform duration-200 active:scale-95 motion-safe:hover:-translate-y-0.5 lg:aspect-[4/3]`}
            >
              <Icon size={26} strokeWidth={1.7} className="text-white" />
              <span className="text-sm font-semibold text-white">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}