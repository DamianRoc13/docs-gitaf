import { RootProvider } from 'fumadocs-ui/provider/next'; 
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from "next";

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Gitaf',
    template: '%s | Gitaf',
  },
  description: 'Sistema de Orientación Audible Inalámbrico para el Entrenamiento de Fútbol Adaptado.',
  metadataBase: new URL('https://gitaf.pro'),
  icons: {
    icon: '/icon.svg',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}