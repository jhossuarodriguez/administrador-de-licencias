import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { AuthProvider } from "@/components/providers/AuthProvider";

const arconFont = localFont({
  src: './fonts/Arcon-Regular.woff2',
  display: 'swap',

})


export const metadata: Metadata = {
  title: "Administrador de Licencias - CAID",
  description: "Administrador de Licencias creado con NextJS",
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
