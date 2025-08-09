import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pousada Zekas",
  description: "Sua pousada dos sonhos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      {/* MODIFICAÇÃO: Adicionamos a cor de fundo principal aqui */}
      <body className={`${inter.className} bg-[#F5F5DC]`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
