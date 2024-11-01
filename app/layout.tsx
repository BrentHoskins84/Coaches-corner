import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link";
import Image from "next/image";
import logo from './logo-v1.png';
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Coaches Corner",
  description: "Your Ultimate Practice Planning Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning={true}>
      <body className="bg-background text-foreground" suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <Link href="/" className="flex items-center h-full">
                    <div className="relative h-12 w-32">
                      <Image
                        src={logo}
                        alt="Coaches Corner"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </Link>
                  <div className="flex items-center gap-4">
                    {hasEnvVars ? <HeaderAuth /> : null}
                    <ThemeSwitcher />
                  </div>
                </div>
              </nav>
              {children}
              <Toaster />
              <footer className="w-full border-t">
                <div className="max-w-5xl mx-auto py-8 px-5 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Coaches Corner. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
