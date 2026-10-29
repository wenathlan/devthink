/**
 * nav.tsx — the nav pane of the games app: the Windows 11 settings
 * rail, one 44px touch-honest row per runner filter with its real count
 * beside it and the 3px accent pill marking the selection. Loose component
 * of the games page.
 */
import {AppGenericRegular, BoardGamesRegular, GridRegular} from "@fluentui/react-icons";
import { osText } from "../../oslabels.ts";

export type GamesFilter = "all" | "game" | "application";

export function GamesNav({
  all,
  games,
  applications,
  active,
  onSelect }: {
  all: number;
  games: number;
  applications: number;
  active: GamesFilter;
  onSelect: (filter: GamesFilter) => void;
}) {
  const rows: readonly { id: GamesFilter; label: string; count: number; icon: typeof GridRegular }[] = [
    { id: "all", label: osText("games.filter.all"), count: all, icon: GridRegular },
    { id: "game", label: osText("games.filter.game"), count: games, icon: BoardGamesRegular },
    { id: "application", label: osText("games.filter.application"), count: applications, icon: AppGenericRegular },
  ];
  return (
    <nav className="dtw-nav" aria-label={osText("games.nav.aria")}>
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
