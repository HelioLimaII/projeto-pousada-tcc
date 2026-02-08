// Em: src/components/Header.tsx
'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { Button } from "@/components/ui/button";
import { Menu, X, ExternalLink, LayoutDashboard } from 'lucide-react'; // [NOVO] Ícones adicionais
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // [ESTRATÉGIA] Verifica se estamos na área administrativa
  const isAdmin = pathname?.startsWith('/admin');

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
          {/* 1. Logótipo/Nome - Com comportamento dinâmico */}
          <div className="flex-shrink-0">
            <Link 
              href={isAdmin ? "/admin/dashboard" : "/"} 
              className="flex items-center gap-2 group"
            >
              <div className="relative h-10 w-10"> 
                <Image
                  src="https://res.cloudinary.com/dd2qpbedy/image/upload/v1762082168/WhatsApp_Image_2025-11-01_at_08.55.59_gcqhxg.jpg" 
                  alt="Logótipo Pousada Zekas"
                  fill
                  className="object-contain" 
                  sizes="40px" 
                />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#2F4F4F] group-hover:text-[#008080] transition-colors">
                  Pousada Zekas
                </h1>
                {/* Etiqueta Visual para o Gerente */}
                {isAdmin && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    ADMIN
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* 2. Navegação Desktop - Condicional */}
          <nav className="hidden md:flex items-center space-x-6">
             {!isAdmin ? (
               // --- MENU TURISTA ---
               navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[#2F4F4F] hover:text-[#008080] px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.href) ? 'bg-gray-100 text-[#008080]' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))
             ) : (
               // --- MENU GERENTE (Simples e Seguro) ---
               <Link 
                 href="/" 
                 target="_blank" 
                 className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#008080] border px-4 py-2 rounded-md hover:bg-gray-50 transition-all"
               >
                 <ExternalLink className="w-4 h-4" />
                 Ver Site Público
               </Link>
             )}
          </nav>

          {/* 3. Botão Solicitar Reserva (Apenas para turistas) */}
          <div className="hidden md:block ml-4">
             {!isAdmin && (
               <Link href="/contato">
                <Button className="bg-[#008080] hover:bg-[#006666] text-white">
                  Solicitar Reserva
                </Button>
              </Link>
             )}
          </div>

          {/* Botão Hamburger (Mobile) */}
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

      {/* Menu Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg z-40">
           <nav className="px-2 pt-2 pb-4 space-y-1">
            
            {!isAdmin ? (
              // --- MOBILE TURISTA ---
              <>
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
              </>
            ) : (
              // --- MOBILE GERENTE ---
              <div className="p-4 space-y-3">
                 <p className="text-sm text-gray-500 font-medium px-2">Modo Administrador</p>
                 <Link 
                    href="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[#2F4F4F] hover:bg-gray-100 rounded-md"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Voltar ao Dashboard
                 </Link>
                 <Link 
                    href="/"
                    target="_blank"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[#008080] hover:bg-[#008080]/10 rounded-md font-medium"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Abrir Site Público
                 </Link>
              </div>
            )}

          </nav>
        </div>
      )}
    </header>
  );
}