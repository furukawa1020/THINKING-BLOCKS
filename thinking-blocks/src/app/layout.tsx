import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand"
});

export const metadata: Metadata = {
  title: "THINKING BLOCKS - Program your way of thinking",
  description: "思考をプログラムするためのブロック環境。なぜ・どのように・何を の構造を可視化します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${quicksand.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
