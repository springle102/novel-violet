import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novel Violet — Đọc Truyện Tiểu Thuyết Online",
  description:
    "Novel Violet - Nền tảng đọc truyện tiểu thuyết online miễn phí. Kho truyện phong phú, cập nhật liên tục, giao diện đẹp mắt và dễ sử dụng.",
  keywords: ["đọc truyện", "tiểu thuyết", "truyện online", "novel", "light novel"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Saira:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
