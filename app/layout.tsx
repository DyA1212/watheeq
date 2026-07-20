import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationWrapper from "./components/NavigationWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "وثيق | منصة الصفقات الآمنة",
  description:
    "منصة وثيق لحفظ أموال المشتري حتى استلام المنتج ثم تحويل المبلغ للبائع بأمان.",

  verification: {
    google: "j8IvV93Uam2ieAkyjOsMWUbQBnFsl9kxvL9-y6-SWNk",
  },

  openGraph: {
    title: "وثيق",
    description:
      "منصة وثيق للصفقات الآمنة بين البائع والمشتري.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "وثيق",
    description:
      "منصة وثيق للصفقات الآمنة بين البائع والمشتري.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="
          min-h-screen
          overflow-x-hidden
          flex
          flex-col
          bg-gray-100
        "
      >
        <div
          className="
            flex-1
            w-full
            overflow-x-hidden
          "
        >
          {children}
        </div>

        <NavigationWrapper />
      </body>
    </html>
  );
}