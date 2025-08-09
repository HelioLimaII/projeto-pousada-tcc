// Em: src/components/Footer.tsx

import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#2F4F4F] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4">Pousada Zekas</h4>
            <p className="text-white/80 mb-4">
              Sua experiência de tranquilidade e conexão com a natureza.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-2 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Rua da Natureza, 123 - Serra da Mantiqueira</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contato@pousadazekas.com.br</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <div className="space-y-2">
              <Link href="/quartos" className="block text-white/80 hover:text-white transition-colors">
                Nossos Quartos
              </Link>
              <Link href="/contato" className="block text-white/80 hover:text-white transition-colors">
                Contato
              </Link>
              <Link href="/login" className="block text-white/80 hover:text-white transition-colors text-sm">
                Área do Gerente
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>&copy; 2025 Pousada Zekas. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}