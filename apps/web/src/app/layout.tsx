import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'भदोही ग्रामीण क्रिकेट प्लेटफ़ॉर्म | आयोजक डैशबोर्ड',
  description: 'ग्रामीण क्रिकेट टूर्नामेंट आयोजन एवं टीम प्रबंधन - भदोही, उत्तर प्रदेश',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F6F8F3] text-[#172019] antialiased">
        {children}
      </body>
    </html>
  );
}
