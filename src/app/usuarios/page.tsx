'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Calendar,
  Trash2,
  Edit2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatDate } from '@/lib/utils';
import { Profile } from '@/types';

export default function UsuariosPage() {
  const { user, usersList, addUser, updateUser, deleteUser } = useAuth();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'operator'>('operator');

  const filteredUsers = usersList.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setRole('operator');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: Profile) => {
    setEditingUser(u);
    setFullName(u.full_name);
    setEmail(u.email);
    setRole(u.role);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    if (editingUser) {
      await updateUser(editingUser.id, {
        full_name: fullName.trim(),
        email: email.trim(),
        role,
      });
    } else {
      await addUser({
        full_name: fullName.trim(),
        email: email.trim(),
        role,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (u: Profile) => {
    if (confirm(`Remover o acesso do usuário "${u.full_name}"?`)) {
      await deleteUser(u.id);
    }
  };

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return (
          <Badge variant="purple" size="sm">
            <ShieldAlert className="h-3 w-3" />
            <span>Administrador</span>
          </Badge>
        );
      case 'manager':
        return (
          <Badge variant="info" size="sm">
            <ShieldCheck className="h-3 w-3" />
            <span>Gerente</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm">
            <Shield className="h-3 w-3" />
            <span>Operador</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Usuários & Permissões</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Gerenciamento da equipe de operadores, gerentes e administradores da plataforma.
          </p>
        </div>

        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4" />
          <span>Novo Usuário</span>
        </Button>
      </div>

      {/* Busca */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail de usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none transition-all"
          />
        </div>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe ({filteredUsers.length})</CardTitle>
          <CardDescription>Usuários cadastrados e vinculados ao Supabase Auth / Profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase bg-zinc-50/50">
                <tr>
                  <th className="py-3 px-4 font-medium">Usuário</th>
                  <th className="py-3 px-4 font-medium">E-mail</th>
                  <th className="py-3 px-4 font-medium">Nível de Acesso</th>
                  <th className="py-3 px-4 font-medium">Cadastrado em</th>
                  <th className="py-3 px-4 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.map((u) => {
                  const isCurrent = user?.id === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-xs shadow-2xs">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-zinc-900">{u.full_name}</span>
                              {isCurrent && (
                                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                                  Você
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-zinc-400">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600 font-medium">{u.email}</td>

                      <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>

                      <td className="py-3.5 px-4 text-xs text-zinc-500">{formatDate(u.created_at)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                            title="Editar usuário"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleDelete(u)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Remover usuário"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Cadastro / Edição de Usuário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuário da Equipe' : 'Cadastrar Novo Usuário na Equipe'}
        description="Conceda ou altere os dados de acesso e perfil de operadores, gerentes ou administradores."
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <Input
            label="Nome Completo *"
            placeholder="Ex: Amanda Vasconcelos"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="E-mail de Acesso *"
            type="email"
            placeholder="amanda@nochelis.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Permissão / Role *</label>
            <Select
              options={[
                { value: 'operator', label: 'Operador de Estoque (Entradas e Saídas)' },
                { value: 'manager', label: 'Gerente Comercial (Compras e Vendas)' },
                { value: 'admin', label: 'Administrador Completo (Acesso a DRE e Configurações)' },
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingUser ? 'Salvar Alterações' : 'Adicionar Usuário'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
