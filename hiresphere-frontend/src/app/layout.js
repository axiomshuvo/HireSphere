import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "HireSphere — AI-Native Career Platform",
  description:
    "HireSphere is an AI-native career platform that connects job seekers with their dream positions and empowers companies to find top talent efficiently.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col  ">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
