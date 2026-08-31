'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('admin@nochelis.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      router.push('/');
    } else {
      setErrorMessage(res.error || 'Credenciais inválidas.');
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword('123456');
    const res = await login(userEmail, '123456');
    if (res.success) {
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50/80 p-4 sm:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-md">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Acesse sua Conta</h1>
          <p className="text-sm text-zinc-500 max-w-xs">
            Entre na plataforma <strong>Nochelis</strong> para gerenciar seus estoques, produtos e vendas.
          </p>
        </div>

        {/* Card de Login */}
        <Card className="p-8 shadow-xl border-zinc-200/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {errorMessage}
              </div>
            )}

            <Input
              label="E-mail de Acesso"
              type="email"
              placeholder="seu.email@empresa.com"
              leftIcon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-zinc-700">Senha</label>
                <a href="#" className="text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 pl-9 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
                  required
                />
                <Lock className="absolute left-3 h-4 w-4 text-zinc-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
              <span>Entrar no Sistema</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Acesso Rápido para Demonstração */}
          <div className="mt-6 pt-5 border-t border-zinc-100">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block text-center mb-3">
              Acesso Rápido de Teste
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@nochelis.com')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/70 text-xs font-semibold text-zinc-800 transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-600" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('carolina.mendes@nochelis.com')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/70 text-xs font-semibold text-zinc-800 transition-colors"
              >
                <UserCheck className="h-3.5 w-3.5 text-zinc-600" />
                <span>Gerente</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Rodapé com Link de Cadastro */}
        <div className="text-center text-xs text-zinc-500">
          Não tem uma conta ainda?{' '}
          <Link href="/cadastro" className="font-semibold text-zinc-900 hover:underline">
            Criar conta de usuário
          </Link>
        </div>
      </div>
    </div>
  );
}
