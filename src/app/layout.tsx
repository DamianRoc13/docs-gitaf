import { RootProvider } from 'fumadocs-ui/provider/next'; 
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from "next";

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Gitaf Docs',
    template: '%s | Gitaf Docs',
  },
  description: 'Documentación oficial de GITAF: Sistema de Orientación Audible Inalámbrico para el Entrenamiento de Fútbol Adaptado.',
  metadataBase: new URL('https://docs.gitafpro.com'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}