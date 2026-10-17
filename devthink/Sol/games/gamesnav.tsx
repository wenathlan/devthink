/**
 * gamesnav.tsx — the nav pane of the games app: the Windows 11 settings
 * rail, one 36px row per runner filter with its real count beside it and
 * the 3px accent pill marking the selection. Loose component of the games
 * page.
 */
import { AppGenericRegular, BoardGamesRegular, GridRegular } from "@fluentui/react-icons";

export type GamesFilter = "all" | "game" | "application";

export function GamesNav({
  all,
  games,
  applications,
  active,
  onSelect,
}: {
  all: number;
  games: number;
  applications: number;
  active: GamesFilter;
  onSelect: (filter: GamesFilter) => void;
}) {
  const rows: readonly { id: GamesFilter; label: string; count: number; icon: typeof GridRegular }[] = [
    { id: "all", label: "All binaries", count: all, icon: GridRegular },
    { id: "game", label: "Games", count: games, icon: BoardGamesRegular },
    { id: "application", label: "Applications", count: applications, icon: AppGenericRegular },
  ];
  return (
    <nav className="dtw-nav" aria-label="Runner filters">
      {rows.map((row) => (
        <button
          key={row.id}
          type="button"
          className="dtw-navrow"
          data-active={row.id === active ? "true" : undefined}
          onClick={() => onSelect(row.id)}
          aria-current={row.id === active ? "page" : undefined}
        >
          <row.icon fontSize={16} aria-hidden="true" />
          {row.label}
          <span className="dtw-navrow__count">{row.count}</span>
        </button>
      ))}
    </nav>
  );
}
