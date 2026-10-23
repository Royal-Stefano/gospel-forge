import type { Metadata } from "next";
import { Space_Grotesk, Inter, Cinzel, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PodcastStoreProvider } from "@/context/PodcastStoreContext";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import { PersistentPlayer } from "@/components/player/PersistentPlayer";
import { AppShell } from "@/components/layout/AppShell";
import { ContextualAuthModal } from "@/components/auth/ContextualAuthModal";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://gospelforge.com"
  ),
  title: "Gospel Forge — The Forged Frequency | Christian Audio Universe",
  description:
    "Faith has a frequency. The Word. Amplified. Stream powerful Christian podcasts, biblical series, and faith conversations.",
  icons: {
    icon: "/images/gospel-forge-emblem.jpg",
  },
  openGraph: {
    title: "Gospel Forge — The Forged Frequency",
    description: "Faith has a frequency. The Word. Amplified.",
    images: ["/images/gospel-forge-emblem.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${cinzel.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-[#080706] text-[#F5F0EA] antialiased selection:bg-[#FF4500] selection:text-white flex flex-col font-sans">
        <AuthProvider>
          <PodcastStoreProvider>
            <AudioPlayerProvider>
              <AppShell>{children}</AppShell>
              <PersistentPlayer />
              <ContextualAuthModal />
            </AudioPlayerProvider>
          </PodcastStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
