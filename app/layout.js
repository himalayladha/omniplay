import { AppWrapper } from '@/lib/AppContext';
import Navbar from '@/components/Navbar';
import MenuDrawer from '@/components/MenuDrawer';
import SearchDrawer from '@/components/SearchDrawer';
import Footer from '@/components/Footer';
import "./globals.css";

export const metadata = {
  title: "OmniPlay - Play Free Online HTML5 Games",
  description: "Play the best free online HTML5 games directly in your browser. instant play without downloads or logins.",
  keywords: "OmniPlay, Game Portal, Online Playing Games, HTML5 Games, Arcade Games",
  robots: "index, follow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="shortcut icon" href="/static/img/logo/favicon.png" type="image/x-icon" />
        {/* Core Layout CSS from the PHP Arcade template */}
        <link rel="stylesheet" href="/css/animate.css" />
        <link rel="stylesheet" href="/themes/poko/css/style.css" />
        <style>{`
          /* Custom theme variables matching Zontal's PHP configuration */
          :root {
            --theme-color: #1583f9;
          }
          html, body {
            width: 100%;
            margin: 0;
            padding: 0;
          }
          body {
            background-image: url('/static/img/bg.png');
            background-attachment: fixed;
            background-size: cover;
          }
          .animate-slide-in-right {
            animation: slideInRight 0.3s forwards ease-out;
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </head>
      <body className="min-h-full w-full flex flex-col font-sans antialiased text-[#002b50]">
        <AppWrapper>
          <div className="flex-1 w-full flex flex-col items-center">
            <Navbar />
            <SearchDrawer />
            <MenuDrawer />
            
            <main className="flex-1 w-full max-w-[1200px] px-4 md:px-8 py-6">
              {children}
            </main>

            <Footer />
          </div>
        </AppWrapper>
      </body>
    </html>
  );
}
