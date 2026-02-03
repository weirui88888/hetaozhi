import type { Metadata } from "next";
import { Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-serif-sc",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "核桃雅集 | 文玩核桃在线展示平台",
    template: "%s | 核桃雅集",
  },
  description:
    "探索精美文玩核桃收藏，沉浸式画廊展示狮子头、官帽、虎头等珍品。每对核桃都承载时光记忆，从青皮到红润，从粗糙到玉化，这不仅是把玩的过程，更是修心的旅程。",
  keywords: [
    "文玩核桃",
    "狮子头",
    "官帽",
    "虎头",
    "核桃收藏",
    "核桃包浆",
    "核桃雅集",
    "文玩收藏",
  ],
  authors: [{ name: "核桃雅集" }],
  creator: "核桃雅集",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://hetaozhi.com",
    siteName: "核桃雅集",
    title: "核桃雅集 | 文玩核桃在线展示平台",
    description:
      "探索精美文玩核桃收藏，沉浸式画廊展示狮子头、官帽、虎头等珍品。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "核桃雅集",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "核桃雅集 | 文玩核桃在线展示平台",
    description:
      "探索精美文玩核桃收藏，沉浸式画廊展示狮子头、官帽、虎头等珍品。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="canonical" href="https://hetaozhi.com" />
      </head>
      <body
        className={`${notoSerifSC.variable} antialiased min-h-screen bg-paper font-serif text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
