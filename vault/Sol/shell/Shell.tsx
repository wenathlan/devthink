// the vault shell of the theme.
// shared shell component loose at the theme root: frame, dock and toasts wrap every page
import type { ReactNode } from 'react';

export function Shell({ children }: { children: ReactNode }) {
  return <div className="shell">{children}</div>;
}
