import { ThemeProvider } from "@/providers/ThemeProvider";
import Toast from "@/providers/Toast";
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
  // We leave the default HTML classes as dark to avoid flashing,
  // the client-side ThemeProvider will handle swapping if the user prefers light.
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          {children}
          <Toast />
        </ThemeProvider>
      </body>
    </html>
  );
}
