import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Zaykaa - Authentic Homemade Food | Traditional Snacks Delivered",
  description: "Discover authentic homemade snacks from talented homemakers. Fresh, traditional recipes delivered to your doorstep. Order from Sarala's Kitchen, Nani's Specials & more.",
  keywords: ["homemade food", "traditional snacks", "Indian sweets", "home delivered food", "authentic recipes", "homemaker chef"],
  authors: [{ name: "Zaykaa" }],
  openGraph: {
    title: "Zaykaa - Authentic Homemade Food Marketplace",
    description: "Connect with talented homemakers. Taste tradition in every bite.",
    type: "website",
    locale: "en_IN",
    siteName: "Zaykaa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zaykaa - Roots of Taste, Routes to Health",
    description: "Authentic homemade snacks from traditional homemaker-chefs",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
