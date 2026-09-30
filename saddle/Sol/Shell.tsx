// Shell — the one root shell of the saddle Sol theme: it renders the
// header/brand/footer chrome internally and exports every shared
// primitive the page folders import from "./Shell" (or "@/Shell"):
// PageShell, SiteHeader, SaddleMark, SectionRail, ThemeProvider,
// useTheme, ErrorBoundary, Button, buttonVariants, the Card family, the
// Tooltip family and the Toaster. Nothing shared lives loose at the
// theme root; page-specific components live in the page folder that
// owns them.
import * as React from "react";
import { createContext, useContext, useEffect, useState, Component, type ReactNode } from "react";
import { Menu, X, AlertTriangle, RotateCcw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Slot } from "@radix-ui/react-slot";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme as useNextTheme } from "next-themes";
import { assetpath } from "@/paths";
import { cn } from "@/utils";

/* ============================ theme context ============================ */

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

/* ============================= error boundary ========================== */

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4">An unexpected error occurred.</h2>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* =============================== brand mark ============================ */

// Signal & Ledger: símbolo modular de sela que conecta storage e compute.
type SaddleMarkProps = {
  className?: string;
  label?: string;
};

export function SaddleMark({ className = "h-9 w-9", label = "Saddle" }: SaddleMarkProps) {
  return (
    <img
      className={className}
      src={assetpath("assets/saddle-mark.webp")}
      alt={label}
      width="40"
      height="40"
    />
  );
}

/* =============================== section rail ========================== */

// Signal & Ledger: trilho vertical que dá sequência operacional e orientação às seções.
type SectionRailProps = {
  number: string;
  label: string;
};

export function SectionRail({ number, label }: SectionRailProps) {
  return (
    <div className="section-rail" role="group" aria-label={`${number} ${label}`}>
      <span className="rail-number">{number}</span>
      <span className="rail-line" />
      <span className="rail-label">{label}</span>
    </div>
  );
}

/* =============================== site header =========================== */

// Signal & Ledger: cabeçalho editorial compacto, com logo visível e navegação contextual.
const navItems = [
  { href: "/architecture", label: "Architecture" },
  { href: "/agent-browser", label: "Agent Browser" },
  { href: "/compute", label: "Compute" },
  { href: "/playground", label: "Playground" },
  { href: "/integrations", label: "Integrations" },
  { href: "/console", label: "Console" },
  { href: "/docs", label: "Docs" },
];

export function SiteHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand-lockup" onClick={() => setOpen(false)}>
          <SaddleMark className="h-10 w-10" />
          <span className="brand-wordmark">SADDLE</span>
        </Link>

        <nav className={`desktop-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
          <Link href="/" className={location === "/" ? "nav-link is-active" : "nav-link"} onClick={() => setOpen(false)}>
            Overview
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={location === item.href ? "nav-link is-active" : "nav-link"}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <a className="header-status" href="https://github.com/wenathlan/saddle" target="_blank" rel="noreferrer">
            <span className="status-dot" />
            Open source
          </a>
          <button className="mobile-menu-button" type="button" aria-expanded={open} aria-label="Open navigation" onClick={() => setOpen((value) => !value)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>        </div>
      </div>
    </header>
  );
}

/* ================================ page shell =========================== */

// Signal & Ledger: moldura comum para páginas internas, preservando contexto e ritmo editorial.
type PageShellProps = {
  section: string;
  label: string;
  title: string;
  intro: string;
  children: ReactNode;
  image?: string;
  imageAlt?: string;
};

export function PageShell({ section, label, title, intro, children, image, imageAlt }: PageShellProps) {
  return (
    <div className="site-frame">
      <SiteHeader />
      <main>
        <section className="page-intro container">
          <SectionRail number={section} label={label} />
          <div className="page-intro-copy">
            <p className="eyebrow">SADDLE / {label}</p>
            <h1 className="page-title">{title}</h1>
            <p className="page-intro-text">{intro}</p>
          </div>
          {image && (
            <div className="page-intro-art">
              <img src={image} alt={imageAlt ?? "Saddle technical illustration"} />
            </div>
          )}
        </section>
        <div className="page-content container">{children}</div>
      </main>
      <footer className="site-footer container">
        <span>© 2026 Saddle / distributed by design</span>
        <span className="mono-label">storage == compute</span>
      </footer>
    </div>
  );
}

/* ================================== button ============================= */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-transparent shadow-xs hover:bg-accent dark:bg-transparent dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

/* =================================== card ============================== */

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

/* ================================= tooltip ============================= */

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

/* ================================== sonner ============================= */

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useNextTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

/* ================================ exports ============================== */

export {
  Button,
  buttonVariants,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Toaster,
};
