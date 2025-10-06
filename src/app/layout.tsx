import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ezra - Multilingual Poetry",
  description: "A collection of original poems in 33 languages from around the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
        {children}
      </body>
    </html>
  );
}
