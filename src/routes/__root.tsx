import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import "../styles.css";

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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

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

      // SEO DASAR & BRADING UTAMA VIBESHOT
      { title: "VibeShot AI — AI Production Brief & Storyboard Generator" },
      {
        name: "description",
        content:
          "Turn messy script ideas into crystal-clear production briefs, moodboards, and interactive storyboards in 60 seconds. Built for creative agencies & content creators.",
      },
      { name: "author", content: "Zaky Jundana" },

      // PREVIEW LINKEDIN / WHATSAPP / FACEBOOK
      { property: "og:title", content: "VibeShot AI — AI Production Brief & Storyboard Generator" },
      {
        property: "og:description",
        content:
          "Turn messy script ideas into crystal-clear production briefs, moodboards, and interactive storyboards in 60 seconds.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://vibeshot-creative-hub.zakyjundana.workers.dev/" },
      {
        property: "og:image",
        content:
          "https://images.pollinations.ai/p/cinematic%20minimalist%20saas%20dashboard%20mockup%20on%20tablet%20screen%2C%20dark%20ui%2C%20creative%20agency%20vibe?width=1200&height=630&seed=12345",
      },

      // PREVIEW TWITTER / X CARD (Format Banner Gede Premium)
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "VibeShot AI — AI Production Brief & Storyboard Generator",
      },
      {
        name: "twitter:description",
        content:
          "Turn messy script ideas into crystal-clear production briefs, moodboards, and interactive storyboards in 60 seconds.",
      },
      {
        name: "twitter:image",
        content:
          "https://images.pollinations.ai/p/cinematic%20minimalist%20saas%20dashboard%20mockup%20on%20tablet%20screen%2C%20dark%20ui%2C%20creative%20agency%20vibe?width=1200&height=630&seed=12345",
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap",
      },
    ],
    scripts: [
      {
        children: `
          (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||[];o._q=o._q||[];
          v=e.createElement(n);v.async=true;v.src='https://cdn.pendo.io/agent/static/a7b1b369-pendo-vibeshot/pendo.js';
          w=e.getElementsByTagName(n)[0];w.parentNode.insertBefore(v,w);
          pendo.initialize = function(c){o._q.push(['initialize',c])};
          })(window,document,'script','pendo');
        `,
      },
      {
        children: `
          (function(n,o,v,u,s){
            n[s]=n[s]||function(){(n[s].q=n[s].q||[]).push(arguments)};
            var a=o.createElement(v);a.async=true;a.src=u;
            var b=o.getElementsByTagName(v)[0];b.parentNode.insertBefore(a,b);
          })(window,document,'script','https://cdn.novus.ai/sdk/novus.js','novus');
          novus('init', 'pilotxis-workspace-vibeshot');
          novus('track', 'pageview');
        `,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <div id="vibeshot-root">
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster />
      </QueryClientProvider>
    </div>
  );
}
