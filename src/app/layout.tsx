import { ToastContainer } from "@/components/ui";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ChatGPT",
  description: "Clone of ChatGPT",
  openGraph: {
    images: [
      {
        url: "/gpticon.webp",
        width: 1200,
        height: 630,
        alt: "ChatGPT Clone Preview",
      },
    ],
  },
  icons: {
    icon: "/gpticon.webp",
    shortcut: "/gpticon.webp",
    apple: "/gpticon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning={true}
        >
          {children}
          <ToastContainer />
        </body>
      </html>
    </ClerkProvider>
  );
}
