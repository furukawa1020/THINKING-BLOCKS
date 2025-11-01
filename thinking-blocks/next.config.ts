import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false, // Turbopack無効化のため一時的にfalse
  output: 'standalone',
  
  // Vercel最適化設定
  compress: true,
  poweredByHeader: false,
  
  // 環境変数
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
  },
  
  // 画像最適化
  images: {
    domains: [],
    unoptimized: false,
  },
};

export default nextConfig;

