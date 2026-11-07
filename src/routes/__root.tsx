import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { setupPwa, keepDataPersistent } from "../lib/pwa";
import { UpdatePrompt } from "../components/UpdatePrompt";

// After a new deploy, old chunk hashes 404 → reload once to fetch the fresh build.
if (typeof window !== "undefined") {
  const isChunkErr = (m: string) =>
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(m);
  const reloadOnce = () => {
    const k = "jaib-chunk-reload";
    const last = Number(sessionStorage.getItem(k) || 0);
    if (Date.now() - last < 10000) return;
    sessionStorage.setItem(k, String(Date.now()));
    window.location.reload();
  };
  window.addEventListener("vite:preloadError", (e) => {
    e.preventDefault();
    reloadOnce();
  });
  window.addEventListener("unhandledrejection", (e) => {
    if (isChunkErr(String((e.reason as Error)?.message ?? e.reason))) reloadOnce();
  });
  window.addEventListener("error", (e) => {
    if (isChunkErr(String(e.message))) reloadOnce();
  });
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    if (/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(String((error as Error)?.message))) {
      const k = "jaib-chunk-reload";
      const last = Number(sessionStorage.getItem(k) || 0);
      if (Date.now() - last > 10000) {
        sessionStorage.setItem(k, String(Date.now()));
        window.location.reload();
        return;
      }
    }
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#ffffff" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "جيب" },
      { title: "جيب - الرئيسية" },
      { name: "description", content: "محفظة جيب الإلكترونية" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "جيب - الرئيسية" },
      { property: "og:description", content: "محفظة جيب الإلكترونية" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const allImgs = import.meta.glob("@/assets/jaib/*.webp", { eager: true, import: "default" }) as Record<string, string>;

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    void setupPwa();
    void keepDataPersistent();
    localStorage.removeItem("jaib-auth");
    let hiddenAt = 0;
    const onVis = () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > 30000 && sessionStorage.getItem("jaib-auth")) {
        sessionStorage.removeItem("jaib-auth");
        location.href = "/login";
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  useEffect(() => {
    // Warm the cache so every screen's icons appear instantly.
    const t = setTimeout(() => Object.values(allImgs).forEach((src) => { const i = new Image(); i.decoding = "async"; i.src = src; }), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <UpdatePrompt />
    </QueryClientProvider>
  );
}
