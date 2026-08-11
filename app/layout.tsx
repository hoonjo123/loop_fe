import type { Metadata } from "next";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "loop — 동네의 대화가 시작되는 곳",
  description: "지도를 둘러보며 지금 살아 있는 동네 커뮤니티를 만나보세요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
