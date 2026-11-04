import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CLASSIFY.AI — Autonomous Waste Intelligence System',
  description: 'Next-generation computer vision and circular material recovery intelligence platform powered by YOLOv8.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#080808] text-[#F5F5F0]">
        {children}
      </body>
    </html>
  );
}
