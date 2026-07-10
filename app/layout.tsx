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
  title: "وثيق",
  description: "منصة وثيق لإدارة الصفقات بأمان",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (

    <html
      lang="ar"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >


      <body className="
      min-h-screen
      overflow-x-hidden
      flex
      flex-col
      bg-gray-100
      ">


        <div className="
        flex-1
        w-full
        overflow-x-hidden
        ">

          {children}

        </div>



        <NavigationWrapper />


      </body>


    </html>

  );

}