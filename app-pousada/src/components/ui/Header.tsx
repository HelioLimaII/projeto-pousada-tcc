// Em: src/components/Header.tsx
'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button" // Supondo que o botão venha de shadcn/ui

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-[#6B8E23]/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-[#2F4F4F]">Pousada Zekas</h1>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-[#2F4F4F] hover:text-[#008080] transition-colors">
              Início
            </Link>
            <Link href="/quartos" className="text-[#2F4F4F] hover:text-[#008080] transition-colors">
              Quartos
            </Link>
            <Link href="/contato" className="text-[#2F4F4F] hover:text-[#008080] transition-colors">
              Contato
            </Link>
          </nav>
          <div className="hidden md:block">
            <Link href="/contato">
              <Button className="bg-[#008080] hover:bg-[#006666] text-white">
                Solicitar Reserva
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}