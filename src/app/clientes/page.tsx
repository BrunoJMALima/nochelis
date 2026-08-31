'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  FileText,
  Trash2,
  Edit2,
  Building,
  User,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Customer } from '@/types';

export default function ClientesPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');
  const [documentType, setDocumentType] = useState<'CPF' | 'CNPJ' | 'OTHER'>('CPF');
  const [notes, setNotes] = useState('');

  // Endereço
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.document && c.document.includes(search))
  );

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setEmail('');
    setPhone('');
    setDocument('');
    setDocumentType('CPF');
    setNotes('');
    setZipCode('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('');
    setState('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setEmail(cust.email || '');
    setPhone(cust.phone || '');
    setDocument(cust.document || '');
    setDocumentType((cust.document_type as any) || 'CPF');
    setNotes(cust.notes || '');

    const primaryAddr = cust.addresses?.[0];
    setZipCode(primaryAddr?.zip_code || '');
    setStreet(primaryAddr?.street || '');
    setNumber(primaryAddr?.number || '');
    setNeighborhood(primaryAddr?.neighborhood || '');
    setCity(primaryAddr?.city || '');
    setState(primaryAddr?.state || '');

    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const addresses = zipCode || street || city
      ? [
          {
            id: editingCustomer?.addresses?.[0]?.id || `addr-${Date.now()}`,
            customer_id: editingCustomer?.id || '',
            address_type: 'both' as const,
            zip_code: zipCode,
            street,
            number,
            neighborhood,
            city,
            state,
            is_default: true,
            created_at: editingCustomer?.addresses?.[0]?.created_at || new Date().toISOString(),
          },
        ]
      : editingCustomer?.addresses || [];

    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        document: document.trim() || undefined,
        document_type: documentType,
        notes: notes.trim() || undefined,
        addresses,
      });
    } else {
      await addCustomer({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        document: document.trim() || undefined,
        document_type: documentType,
        status: 'active',
        notes: notes.trim() || undefined,
        addresses,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (cust: Customer) => {
    if (confirm(`Deseja realmente excluir o cliente "${cust.name}"?`)) {
      await deleteCustomer(cust.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Base de Clientes</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Cadastro unificado de clientes pessoa física (CPF) e jurídica (CNPJ) com endereços e histórico de compras.
          </p>
        </div>

        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4" />
          <span>Cadastrar Cliente</span>
        </Button>
      </div>

      {/* Busca */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none transition-all"
          />
        </div>
      </Card>

      {/* Tabela de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados ({filteredCustomers.length})</CardTitle>
          <CardDescription>Visualização completa de contatos e endereços</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase bg-zinc-50/50">
                <tr>
                  <th className="py-3 px-4 font-medium">Cliente</th>
                  <th className="py-3 px-4 font-medium">Tipo / Documento</th>
                  <th className="py-3 px-4 font-medium">Contato</th>
                  <th className="py-3 px-4 font-medium">Endereço Principal</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => {
                    const primaryAddr = cust.addresses?.[0];

                    return (
                      <tr key={cust.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 font-semibold text-xs border border-zinc-200">
                              {cust.document_type === 'CNPJ' ? (
                                <Building className="h-4 w-4 text-zinc-600" />
                              ) : (
                                <User className="h-4 w-4 text-zinc-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-900">{cust.name}</p>
                              {cust.notes && <p className="text-[11px] text-zinc-400 line-clamp-1">{cust.notes}</p>}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant={cust.document_type === 'CNPJ' ? 'purple' : 'default'} size="sm">
                            {cust.document_type || 'CPF'}
                          </Badge>
                          <span className="block font-mono text-xs text-zinc-700 mt-1">
                            {cust.document || 'Não informado'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 text-xs text-zinc-600">
                            {cust.email && (
                              <div className="flex items-center gap-1.5">
                                <Mail className="h-3 w-3 text-zinc-400" />
                                <span>{cust.email}</span>
                              </div>
                            )}
                            {cust.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-zinc-400" />
                                <span>{cust.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-zinc-600">
                          {primaryAddr ? (
                            <div className="flex items-start gap-1.5 max-w-xs">
                              <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                              <span>
                                {primaryAddr.street}, {primaryAddr.number} - {primaryAddr.city}/{primaryAddr.state}
                              </span>
                            </div>
                          ) : (
                            <span className="text-zinc-400">Sem endereço</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="success" size="sm">
                            Ativo
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cust)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                              title="Editar cliente"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cust)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Excluir cliente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Cadastro / Edição de Cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
        description="Adicione ou atualize os dados de contato, documento e endereço para entrega de pedidos."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Input
                label="Nome Completo ou Razão Social *"
                placeholder="Ex: Mariana Silva ou Comercial Delta Ltda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">Tipo de Documento</label>
              <Select
                options={[
                  { value: 'CPF', label: 'Pessoa Física (CPF)' },
                  { value: 'CNPJ', label: 'Pessoa Jurídica (CNPJ)' },
                ]}
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as any)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Número do Documento (CPF/CNPJ)"
              placeholder="Ex: 123.456.789-00"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="cliente@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Telefone / WhatsApp"
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="border-t border-zinc-100 pt-4 mt-2">
            <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-3">
              Endereço Principal
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="CEP"
                placeholder="00000-000"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Logradouro / Rua"
                  placeholder="Avenida Paulista"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-3">
              <Input
                label="Número"
                placeholder="1000"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
              <Input
                label="Bairro"
                placeholder="Bela Vista"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Cidade"
                  placeholder="São Paulo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  label="UF"
                  placeholder="SP"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-medium text-zinc-700">Observações Internas</label>
            <textarea
              rows={2}
              placeholder="Preferências de entrega, condições comerciais, etc."
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
              {editingCustomer ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
