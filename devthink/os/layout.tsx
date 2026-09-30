import type { Metadata } from "next";
import "./globals.css";
import "@/components/devthink/engine/engine.css";

export const metadata: Metadata = {
  title: "devthink.pro — DevThink OS",
  description:
    "Workbench de IA provider-neutral: gateway local em loopback, CLI com streaming, sandbox engine e a família de produtos — argan, debonair, cadria e stealthhead.",
  keywords: ["DevThink", "gateway", "provider-neutral", "argan", "debonair", "cadria", "stealthhead", "Aura"],
  icons: { icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
};

/* O <Toaster/> (sonner) é montado uma única vez dentro de <DevThinkOS/>. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* O tema sol (fundo #0B0806, texto #FFFBEB) vem do engine.css —
          SEM bg-background/text-foreground aqui: a utilidade Tailwind
          tem especificidade de classe e mataria o tema escuro. */}
      <body className="antialiased">{children}</body>
    </html>
  );
}
