import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, LanguageProvider, NotificationProvider } from "@/lib/contexts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WDUPMS - Woldia University Property Management System",
  description: "Web-based Property Management System for Woldia University",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
