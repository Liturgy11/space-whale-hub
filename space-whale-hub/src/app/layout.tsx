import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Quicksand } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import MobileNav from "@/components/MobileNav";
import ToastProvider from "@/components/ui/ToastProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Space Whale Portal - a safe(r) space for creative souls",
  description: "A portal where your sensitivity is honoured, your creativity is sacred, and your becoming is witnessed. A sanctuary for space whales navigating by starlight and whale song.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Space Whale",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060a49",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} ${quicksand.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <MobileNav />
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
