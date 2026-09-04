import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lihi-squishy.vercel.app"),
  title: "עולם הסקווישים של ליהי וארי",
  description: "חנות סקווישים כיפית של ליהי וארי — מוצרים, סרטונים ועוד",
  applicationName: "עולם הסקווישים של ליהי וארי",
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "https://lihi-squishy.vercel.app",
    siteName: "עולם הסקווישים של ליהי וארי",
    title: "עולם הסקווישים של ליהי וארי",
    description: "חנות סקווישים צבעונית וכיפית — בואו לבחור סקווישי!",
    images: [
      {
        url: "/og-share.png",
        width: 1536,
        height: 1024,
        alt: "עולם הסקווישים של ליהי וארי",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "עולם הסקווישים של ליהי וארי",
    description: "חנות סקווישים צבעונית וכיפית — בואו לבחור סקווישי!",
    images: ["/og-share.png"],
  },
  appleWebApp: {
    capable: true,
    title: "סקווישים",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFEB3B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
