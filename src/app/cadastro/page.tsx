'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  Mail,
  Lock,
  User,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';

export default function CadastroPage() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'operator'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !password) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    const res = await signUp({
      full_name: fullName,
      email,
      password,
      role,
    });

    if (res.success) {
      router.push('/');
    } else {
      setErrorMessage(res.error || 'Erro ao criar conta de usuário.');
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Cadastro de Usuário</h1>
          <p className="text-sm text-zinc-500 max-w-xs">
            Crie seu perfil de acesso e defina as permissões para a plataforma <strong>Nochelis</strong>.
          </p>
        </div>

        {/* Card de Cadastro */}
        <Card className="p-8 shadow-xl border-zinc-200/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {errorMessage}
              </div>
            )}

            <Input
              label="Nome Completo *"
              placeholder="Ex: Carlos Eduardo Silva"
              leftIcon={<User className="h-4 w-4" />}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="E-mail Corporativo *"
              type="email"
              placeholder="carlos@nochelis.com"
              leftIcon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">Senha de Acesso *</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
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

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">Nível de Permissão / Role *</label>
              <Select
                options={[
                  { value: 'admin', label: 'Administrador (Acesso Total + DRE)' },
                  { value: 'manager', label: 'Gerente (Compras, Vendas e Estoque)' },
                  { value: 'operator', label: 'Operador (Entradas e Saídas de Estoque)' },
                ]}
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              />
            </div>

            <Button type="submit" className="w-full mt-3" size="lg" isLoading={isLoading}>
              <span>Finalizar Cadastro</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        {/* Rodapé */}
        <div className="text-center text-xs text-zinc-500">
          Já possui cadastro?{' '}
          <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
            Acessar conta existente
          </Link>
        </div>
      </div>
    </div>
  );
}
