import SiteShell from '@/components/SiteShell';
import "./globals.css";

export const metadata = {
  title: "OmniPlay - Play Free Online HTML5 Games",
  description: "Play the best free online HTML5 games directly in your browser. Instant play without downloads or logins.",
  keywords: "OmniPlay, Game Portal, Online Playing Games, HTML5 Games, Arcade Games",
  robots: "index, follow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="shortcut icon" href="/static/img/logo/favicon.png" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root { --theme-color: #1583f9; }
        `}</style>
      </head>
      <body className="min-h-full w-full flex flex-col font-sans antialiased bg-[#02040a] text-slate-100 selection:bg-blue-500 selection:text-white">
        {/*
          SiteShell is a client component that reads the pathname:
          - /admin  → renders children directly (admin has its own sidebar layout)
          - /install → renders children directly (wizard has its own centered layout)
          - everything else → wraps with Navbar, SearchDrawer, MenuDrawer, Footer
        */}
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
