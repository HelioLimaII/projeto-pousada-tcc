// Em: src/components/Header.tsx
'use client'; // Necessário para useState e interatividade

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Importado
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/quartos', label: 'Quartos' },
    { href: '/contato', label: 'Contato' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="bg-white shadow-sm border-b border-[#6B8E23]/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logótipo/Nome */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-10 w-10"> {/* Container para a imagem */}
                <Image
                  // **** ALTERAÇÃO AQUI ****
                  src="https://res.cloudinary.com/dd2qpbedy/image/upload/v1761336530/Captura_de_Tela_2025-10-24_a%CC%80s_17.08.12_x0az5n.png" // <-- SUBSTITUA PELA SUA URL CLOUDINARY
                  // Exemplo: src="https://res.cloudinary.com/seu-nome/image/upload/v123/logo-zekas.png"

                  alt="Logótipo Pousada Zekas"
                  fill
                  className="object-contain" // Garante que a imagem caiba
                  sizes="40px" // Informa o tamanho para otimização
                />
              </div>
              <h1 className="text-2xl font-bold text-[#2F4F4F] group-hover:text-[#008080] transition-colors">
                Pousada Zekas
              </h1>
            </Link>
          </div>

          {/* Navegação Desktop (mantida) */}
          <nav className="hidden md:flex items-center space-x-6">
             {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[#2F4F4F] hover:text-[#008080] px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href) ? 'bg-gray-100 text-[#008080]' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Botão Solicitar Reserva (desktop - mantido) */}
          <div className="hidden md:block ml-4">
             <Link href="/contato">
              <Button className="bg-[#008080] hover:bg-[#006666] text-white">
                Solicitar Reserva
              </Button>
            </Link>
          </div>

          {/* Botão Hamburger (mobile - mantido) */}
          <div className="md:hidden flex items-center">
             <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menu"
              className="text-[#2F4F4F] hover:text-[#008080] hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Dropdown (mantido) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg z-40">
           <nav className="px-2 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-[#008080]/10 text-[#008080]'
                    : 'text-[#2F4F4F] hover:bg-gray-100 hover:text-[#008080]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
             <div className="pt-4 px-3">
               <Link href="/contato">
                  <Button
                    className="w-full bg-[#008080] hover:bg-[#006666] text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Solicitar Reserva
                  </Button>
               </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

