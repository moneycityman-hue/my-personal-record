import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Memo Dashboard",
  description: "Google 로그인 기반 개인 메모 대시보드"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
