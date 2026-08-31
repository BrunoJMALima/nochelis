'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  User,
  PackagePlus,
  ShoppingCart,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Supplier } from '@/types';

export default function FornecedoresPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [corporateName, setCorporateName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.corporate_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.trade_name && s.trade_name.toLowerCase().includes(search.toLowerCase())) ||
      (s.document && s.document.includes(search))
  );

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setCorporateName('');
    setTradeName('');
    setDocument('');
    setEmail('');
    setPhone('');
    setContactPerson('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setCorporateName(sup.corporate_name);
    setTradeName(sup.trade_name || '');
    setDocument(sup.document || '');
    setEmail(sup.email || '');
    setPhone(sup.phone || '');
    setContactPerson(sup.contact_person || '');
    setNotes(sup.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!corporateName.trim()) return;

    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, {
        corporate_name: corporateName.trim(),
        trade_name: tradeName.trim() || undefined,
        document: document.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        contact_person: contactPerson.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      await addSupplier({
        corporate_name: corporateName.trim(),
        trade_name: tradeName.trim() || undefined,
        document: document.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        contact_person: contactPerson.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (sup: Supplier) => {
    if (confirm(`Deseja realmente excluir o fornecedor "${sup.trade_name || sup.corporate_name}"?`)) {
      await deleteSupplier(sup.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Fornecedores de Insumos & Frascaria</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Gestão de parceiros de essências, óleos, vidrarias, válvulas spray e embalagens para fabricação.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/entradas/nova">
            <Button variant="outline">
              <PackagePlus className="h-4 w-4" />
              <span>Nova Entrada</span>
            </Button>
          </Link>
          <Button onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" />
            <span>Cadastrar Fornecedor</span>
          </Button>
        </div>
      </div>

      {/* Busca */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por Razão Social, Fantasia ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none transition-all"
          />
        </div>
      </Card>

      {/* Grid de Fornecedores */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <Card className="p-12 text-center text-zinc-400">
              Nenhum fornecedor cadastrado ou encontrado.
            </Card>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 border border-zinc-200">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(supplier)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                      title="Editar fornecedor"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(supplier)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Excluir fornecedor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-base text-zinc-900 line-clamp-1">
                    {supplier.trade_name || supplier.corporate_name}
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-1">{supplier.corporate_name}</p>
                  <span className="inline-block font-mono text-[11px] text-zinc-400 mt-1">
                    CNPJ: {supplier.document || 'Não informado'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
                  {supplier.contact_person && (
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{supplier.contact_person}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                </div>

                {supplier.notes && (
                  <p className="mt-3 text-[11px] text-zinc-400 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 line-clamp-2">
                    {supplier.notes}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <Badge variant="purple" size="sm">
                  Ativo
                </Badge>
                <Link href={`/entradas/nova`}>
                  <Button size="sm" variant="ghost" className="text-xs">
                    <PackagePlus className="h-3.5 w-3.5" />
                    <span>Dar Entrada</span>
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal: Cadastro / Edição de Fornecedor */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
        description="Adicione ou atualize os dados da empresa distribuidora para compras e custos."
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <Input
            label="Razão Social *"
            placeholder="Ex: TechDistribuidora Brasil Ltda"
            value={corporateName}
            onChange={(e) => setCorporateName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome Fantasia"
              placeholder="Ex: TechBrasil"
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
            />
            <Input
              label="CNPJ"
              placeholder="00.000.000/0001-00"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Pessoa de Contato"
              placeholder="Ex: Carlos Eduardo"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
            <Input
              label="Telefone Comercial"
              placeholder="(11) 4002-8922"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="E-mail Comercial"
            type="email"
            placeholder="contato@fornecedor.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Observações / Prazos</label>
            <textarea
              rows={2}
              placeholder="Ex: Prazo de entrega 5 dias úteis, faturamento 30/60 dias..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingSupplier ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
