import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "DevThink Gateway — V1-V5 Multi-Provider",
  description:
    "Multi-provider AI gateway: V1 ZAI passthrough, V2 Babel, V3 NVIDIA NIM, V4 OpenCode Zen + Kilo (free), V5 Unified token bypass.",
  keywords: ["DevThink", "Gateway", "ZAI", "NVIDIA", "Babel", "OpenCode", "Kilo", "Next.js"],
  icons: { icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">{children}</body>
    </html>
  )
}
