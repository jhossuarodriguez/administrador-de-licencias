import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { AuthProvider } from "@/components/providers/AuthProvider";

const arconFont = localFont({
  src: './fonts/Arcon-Regular.woff2',
  display: 'swap',

})


export const metadata: Metadata = {
  title: "Administrador de Licencias",
  description: "Administrador de Licencias creado con NextJS",
  metadataBase: new URL('https://administrador-de-licencias.vercel.app'),
  openGraph: {
    title: "Administrador de Licencias",
    description: "Administrador de Licencias creado con NextJS",
    url: 'https://administrador-de-licencias.vercel.app',
    siteName: 'Administrador de Licencias',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Administrador de Licencias',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Administrador de Licencias",
    description: "Administrador de Licencias creado con NextJS",
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${arconFont.className} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
