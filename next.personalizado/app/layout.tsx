import type { ReactNode } from 'react';

export const metadata = { title: 'next.personalizado' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
