"use client";

import { useReveal } from "../engine/reveal";

/**
 * PageSection — cabeçalho de página canônico: eyebrow + título + descrição
 * (estrutura das páginas dos sites estáticos).
 */
export function PageSection({
  eyebrow,
  title,
  children,
  description,
  reveal = false,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  description?: React.ReactNode;
  reveal?: boolean;
  className?: string;
}) {
  useReveal(reveal ? [title] : []);
  return (
    <header className={className}>
      <p className={reveal ? "eyebrow reveal in" : "eyebrow"}>{eyebrow}</p>
      <h1
        className={reveal ? "reveal in" : undefined}
        style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", margin: "0 0 0.4em" }}
      >
        {title}
      </h1>
      {description ? (
        <p className={reveal ? "reveal in max-640" : "max-640"} style={{ marginBottom: 0 }}>
          {description}
        </p>
      ) : null}
      {children}
    </header>
  );
}
