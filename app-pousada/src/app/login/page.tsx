'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react'
import Link from 'next/link'
// O useRouter não é mais necessário para o redirecionamento, mas pode ser mantido se usado em outro lugar.
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.username || !formData.password) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    try {
      const loginDetails = new URLSearchParams();
      loginDetails.append('username', formData.username);
      loginDetails.append('password', formData.password);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginDetails,
      });

      if (response.ok) {
        const data = await response.json();
        // Usando 'authToken' para manter consistência com os outros componentes
        localStorage.setItem('authToken', data.access_token);
        
        // --- MODIFICAÇÃO PRINCIPAL AQUI ---
        // Força um recarregamento completo da página ao redirecionar,
        // garantindo que o novo estado de login seja lido por toda a aplicação.
        window.location.href = '/admin/dashboard';
        // --- FIM DA MODIFICAÇÃO ---

      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Credenciais inválidas.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-[#2F4F4F] mb-2">Pousada Zekas</h1>
          </Link>
          <p className="text-[#2F4F4F]/70">Área Administrativa</p>
        </div>

        <Card className="border-[#6B8E23]/20 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-[#2F4F4F]">
              Acesso do Gerente
            </CardTitle>
            <p className="text-center text-[#2F4F4F]/70">
              Entre com suas credenciais para acessar o painel
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#2F4F4F]">
                  Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-[#6B8E23]" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Digite seu usuário"
                    className="pl-10 border-[#6B8E23]/30 focus:border-[#008080] focus:ring-[#008080]"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2F4F4F]">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#6B8E23]" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Digite sua senha"
                    className="pl-10 pr-10 border-[#6B8E23]/30 focus:border-[#008080] focus:ring-[#008080]"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#6B8E23] hover:text-[#008080] transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#008080] hover:bg-[#006666] text-white py-2.5 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/" 
                className="text-sm text-[#6B8E23] hover:text-[#008080] transition-colors"
              >
                ← Voltar ao site
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Teste (remover em produção) */}
        <div className="mt-6 p-4 bg-white/50 rounded-lg border border-[#6B8E23]/20">
          <p className="text-xs text-[#2F4F4F]/70 text-center mb-2">
            <strong>Credenciais de teste:</strong>
          </p>
          <p className="text-xs text-[#2F4F4F]/70 text-center">
            Usuário: <code className="bg-[#6B8E23]/10 px-1 rounded">helio</code> | 
            Senha: <code className="bg-[#6B8E23]/10 px-1 rounded">123</code>
          </p>
        </div>
      </div>
    </div>
  )
}