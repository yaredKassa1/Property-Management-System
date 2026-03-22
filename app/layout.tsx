import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: '--font-manrope',
});

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
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}