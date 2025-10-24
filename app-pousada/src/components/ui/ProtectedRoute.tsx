'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // O estado 'isLoading' é melhor para clareza do que 'isAuthorized'.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Passo 1: Procurar pelo nome do token que padronizamos: 'accessToken'.
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      // Se não houver token, redireciona para a página de login.
      router.push('/login');
    } else {
      // Se houver token, permite a renderização do conteúdo e para de carregar.
      setIsLoading(false);
    }
    // A dependência de 'router' garante que o efeito seja reavaliado se o router mudar.
  }, [router]);

  // Enquanto a verificação do token estiver em andamento, mostramos uma mensagem.
  // Isso evita que o conteúdo protegido "pisque" na tela antes do redirecionamento.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verificando autorização...</p>
      </div>
    );
  }

  // Se o carregamento terminou (e não fomos redirecionados), mostra o conteúdo.
  return <>{children}</>;
}
