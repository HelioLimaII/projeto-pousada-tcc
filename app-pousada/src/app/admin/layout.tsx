// Em: src/app/admin/layout.tsx
'use client'; // Necessário para hooks e interatividade (logout e pathname)

import ProtectedRoute from "@/components/ui/ProtectedRoute";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Importa usePathname
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react"; // Importa o ícone

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname(); // Hook para obter o caminho atual

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  // Define os links de navegação
  const navLinks = [
    { href: '/admin/dashboard', label: 'Mapa de Reservas' },
    { href: '/admin/quartos', label: 'Gerenciar Quartos' },
    { href: '/admin/clientes', label: 'Gerenciar Clientes' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Barra de Navegação Superior */}
        <header className="bg-white shadow-md sticky top-0 z-40"> {/* Torna o header fixo */}
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <span className="font-bold text-lg text-[#2F4F4F]">Admin Pousada</span>
              {/* === LINKS DE NAVEGAÇÃO ADICIONADOS === */}
              <div className="hidden md:flex items-center space-x-1"> {/* Esconde em ecrãs pequenos */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === link.href // Verifica se o link está ativo
                        ? 'bg-[#008080] text-white' // Estilo ativo
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' // Estilo inativo
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            {/* Botão Sair */}
            <Button variant="outline" size="sm" onClick={handleLogout}>
               <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </nav>
           {/* === NAVEGAÇÃO PARA ECRÃS PEQUENOS (OPCIONAL) === */}
           {/* Pode adicionar aqui um menu "hamburger" se quiser suportar melhor telemóveis */}
        </header>

        {/* Conteúdo da Página */}
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

