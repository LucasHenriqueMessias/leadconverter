import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/contrast-fixes.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadConverter by Yami",
  description: "Sistema LeadConverter simples e eficiente para Microempreendedores Individuais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
