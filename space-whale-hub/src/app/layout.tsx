import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Poppins, Quicksand } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import MobileNav from "@/components/MobileNav";
import ToastProvider from "@/components/ui/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Space Whale Portal - A Sanctuary for Creative Becoming",
  description: "A portal where your sensitivity is honoured, your creativity is sacred, and your becoming is witnessed. A sanctuary for space whales navigating by starlight and whale song.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${quicksand.variable} antialiased`}
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
