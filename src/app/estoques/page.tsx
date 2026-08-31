'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowRightLeft,
  Store,
  CheckCircle,
  AlertTriangle,
  Search,
  Package,
  Layers,
  Edit2,
  Trash2,
  Tag,
  Settings2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatNumber } from '@/lib/utils';
import { ChannelType, StockChannelType, StockLocation } from '@/types';

export default function EstoquesPage() {
  const {
    stockLocations,
    channelTypes,
    products,
    addStockLocation,
    updateStockLocation,
    deleteStockLocation,
    addChannelType,
    updateChannelType,
    deleteChannelType,
    updateStockQuantity,
    transferStock,
  } = useApp();

  const [search, setSearch] = useState('');

  // Modais de Controle
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTypesManagerOpen, setIsTypesManagerOpen] = useState(false);
  const [isTypeFormModalOpen, setIsTypeFormModalOpen] = useState(false);

  // Edição de Canal / Local
  const [editingLocation, setEditingLocation] = useState<StockLocation | null>(null);
  const [channelName, setChannelName] = useState('');
  const [channelCode, setChannelCode] = useState('');
  const [channelType, setChannelType] = useState<StockChannelType>('online');
  const [channelDescription, setChannelDescription] = useState('');

  // Edição de Tipo de Canal
  const [editingChannelType, setEditingChannelType] = useState<ChannelType | null>(null);
  const [typeName, setTypeName] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [typeBadgeVariant, setTypeBadgeVariant] = useState<'default' | 'warning' | 'purple' | 'info' | 'success' | 'danger'>('info');
  const [typeDescription, setTypeDescription] = useState('');

  // Form Transferência
  const [transferProductId, setTransferProductId] = useState(products[0]?.id || '');
  const [fromLocId, setFromLocId] = useState(stockLocations[0]?.id || '');
  const [toLocId, setToLocId] = useState(stockLocations[1]?.id || '');
  const [transferQty, setTransferQty] = useState(1);

  // Manipulação de ajuste rápido de saldo celular
  const [editingStock, setEditingStock] = useState<{
    productId: string;
    locationId: string;
    value: number;
  } | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  // Ações de Canal / Depósito
  const handleOpenAddChannel = () => {
    setEditingLocation(null);
    setChannelName('');
    setChannelCode('');
    setChannelType(channelTypes[0]?.code || 'online');
    setChannelDescription('');
    setIsChannelModalOpen(true);
  };

  const handleOpenEditChannel = (loc: StockLocation) => {
    setEditingLocation(loc);
    setChannelName(loc.name);
    setChannelCode(loc.code);
    setChannelType(loc.channel_type);
    setChannelDescription(loc.description || '');
    setIsChannelModalOpen(true);
  };

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !channelCode.trim()) return;

    if (editingLocation) {
      await updateStockLocation(editingLocation.id, {
        name: channelName.trim(),
        code: channelCode.toUpperCase().replace(/\s+/g, '-'),
        channel_type: channelType,
        description: channelDescription.trim() || undefined,
      });
    } else {
      await addStockLocation({
        name: channelName.trim(),
        code: channelCode.toUpperCase().replace(/\s+/g, '-'),
        channel_type: channelType,
        description: channelDescription.trim() || undefined,
        is_active: true,
      });
    }

    setIsChannelModalOpen(false);
  };

  const handleDeleteLocation = async (loc: StockLocation) => {
    if (stockLocations.length <= 1) {
      alert('Você precisa ter pelo menos um depósito ou canal ativo no sistema.');
      return;
    }
    if (confirm(`Deseja realmente excluir o canal/depósito "${loc.name}" (${loc.code})? Os saldos vinculados serão removidos.`)) {
      await deleteStockLocation(loc.id);
    }
  };

  // Ações de Tipo de Canal
  const handleOpenAddType = () => {
    setEditingChannelType(null);
    setTypeName('');
    setTypeCode('');
    setTypeBadgeVariant('purple');
    setTypeDescription('');
    setIsTypeFormModalOpen(true);
  };

  const handleOpenEditType = (ct: ChannelType) => {
    setEditingChannelType(ct);
    setTypeName(ct.name);
    setTypeCode(ct.code);
    setTypeBadgeVariant(ct.badge_variant || 'default');
    setTypeDescription(ct.description || '');
    setIsTypeFormModalOpen(true);
  };

  const handleTypeNameChange = (val: string) => {
    setTypeName(val);
    if (!editingChannelType) {
      const generatedCode = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)+/g, '');
      setTypeCode(generatedCode);
    }
  };

  const handleSaveChannelType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    const formattedCode = typeCode.trim() || typeName.toLowerCase().replace(/\s+/g, '_');

    if (editingChannelType) {
      await updateChannelType(editingChannelType.id, {
        name: typeName.trim(),
        code: formattedCode,
        badge_variant: typeBadgeVariant,
        description: typeDescription.trim() || undefined,
      });
    } else {
      await addChannelType({
        name: typeName.trim(),
        code: formattedCode,
        badge_variant: typeBadgeVariant,
        description: typeDescription.trim() || undefined,
      });
    }

    setIsTypeFormModalOpen(false);
  };

  const handleDeleteChannelType = async (ct: ChannelType) => {
    const linkedLocations = stockLocations.filter((l) => l.channel_type === ct.code);
    if (linkedLocations.length > 0) {
      alert(`Não é possível excluir o tipo "${ct.name}", pois existem ${linkedLocations.length} canal(is) utilizando este tipo.`);
      return;
    }
    if (confirm(`Deseja realmente excluir o tipo de canal "${ct.name}"?`)) {
      await deleteChannelType(ct.id);
    }
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProductId || !fromLocId || !toLocId || transferQty <= 0) return;
    if (fromLocId === toLocId) {
      alert('Selecione locais de origem e destino diferentes.');
      return;
    }

    await transferStock(transferProductId, fromLocId, toLocId, transferQty);
    setIsTransferOpen(false);
  };

  const getChannelTypeBadge = (channelTypeCode: string) => {
    const found = channelTypes.find((t) => t.code === channelTypeCode);
    if (found) {
      return (
        <Badge variant={found.badge_variant || 'default'} size="sm">
          {found.name}
        </Badge>
      );
    }

    switch (channelTypeCode) {
      case 'online':
        return <Badge variant="info" size="sm">Online</Badge>;
      case 'internal':
        return <Badge variant="default" size="sm">Depósito Interno / Matriz</Badge>;
      default:
        return <Badge variant="default" size="sm">Estoque</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header com Ações */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Multi-Estoque & Canais</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Controle integrado de saldos por canal (Online e Depósito Interno / Matriz) e transferências.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" onClick={() => setIsTypesManagerOpen(true)}>
            <Tag className="h-4 w-4" />
            <span>Tipos de Canal</span>
          </Button>
          <Button variant="outline" onClick={() => setIsTransferOpen(true)}>
            <ArrowRightLeft className="h-4 w-4" />
            <span>Transferir Estoque</span>
          </Button>
          <Button onClick={handleOpenAddChannel}>
            <Plus className="h-4 w-4" />
            <span>Novo Canal / Depósito</span>
          </Button>
        </div>
      </div>

      {/* Cards com Resumo dos Canais de Estoque */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stockLocations.map((loc) => {
          let channelUnits = 0;
          products.forEach((prod) => {
            const inv = (prod.inventory || []).find((i) => i.stock_location_id === loc.id);
            if (inv) channelUnits += inv.quantity;
          });

          return (
            <Card key={loc.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {loc.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getChannelTypeBadge(loc.channel_type)}
                    <button
                      type="button"
                      onClick={() => handleOpenEditChannel(loc)}
                      className="p-1 rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                      title="Editar canal"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLocation(loc)}
                      className="p-1 rounded-md text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Excluir canal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-base text-zinc-900 mt-2">{loc.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{loc.description || 'Sem descrição'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">Unidades Alocadas:</span>
                <span className="text-base font-bold text-zinc-900">{formatNumber(channelUnits)} un.</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Matriz Geral de Estoque: Produto x Canais */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle>Matriz de Saldos por Produto</CardTitle>
            <CardDescription>
              Visualize e ajuste rapidamente as quantidades de cada produto por canal de marketplace
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar SKU ou Produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none transition-all"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase bg-zinc-50/50">
                <tr>
                  <th className="py-3 px-4 font-medium">Produto / SKU</th>
                  {stockLocations.map((loc) => (
                    <th key={loc.id} className="py-3 px-4 font-medium text-center">
                      <span className="block text-zinc-900">{loc.name}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">({loc.code})</span>
                    </th>
                  ))}
                  <th className="py-3 px-4 font-medium text-center">Total Consolidado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProducts.map((prod) => {
                  const totalStock = (prod.inventory || []).reduce((acc, i) => acc + i.quantity, 0);

                  return (
                    <tr key={prod.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {prod.images && prod.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={prod.images[0].image_url}
                              alt={prod.name}
                              className="h-9 w-9 rounded-lg object-cover border border-zinc-200 shrink-0"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400 shrink-0">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-zinc-900 line-clamp-1">{prod.name}</p>
                            <span className="font-mono text-[11px] text-zinc-400">{prod.sku}</span>
                          </div>
                        </div>
                      </td>

                      {/* Células de Estoque por Canal */}
                      {stockLocations.map((loc) => {
                        const inv = (prod.inventory || []).find((i) => i.stock_location_id === loc.id);
                        const qty = inv ? inv.quantity : 0;
                        const isEditing =
                          editingStock?.productId === prod.id &&
                          editingStock?.locationId === loc.id;

                        return (
                          <td key={loc.id} className="py-3.5 px-4 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  autoFocus
                                  value={editingStock.value}
                                  onChange={(e) =>
                                    setEditingStock({
                                      ...editingStock,
                                      value: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-16 h-8 rounded-lg border border-zinc-900 text-center text-xs font-bold"
                                />
                                <button
                                  onClick={() => {
                                    updateStockQuantity(prod.id, loc.id, editingStock.value);
                                    setEditingStock(null);
                                  }}
                                  className="p-1 rounded-md bg-zinc-900 text-white hover:bg-zinc-800"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setEditingStock({
                                    productId: prod.id,
                                    locationId: loc.id,
                                    value: qty,
                                  })
                                }
                                className="group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold hover:bg-zinc-100 transition-colors"
                              >
                                <span className={qty === 0 ? 'text-zinc-300' : 'text-zinc-800'}>
                                  {qty} un.
                                </span>
                                <Edit2 className="h-3 w-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {/* Total Consolidado */}
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={totalStock <= 10 ? 'danger' : 'default'} size="sm">
                          {totalStock} un.
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal 1: Gerenciar Tipos de Canal (Lista com Edição e Exclusão) */}
      <Modal
        isOpen={isTypesManagerOpen}
        onClose={() => setIsTypesManagerOpen(false)}
        title="Tipos de Canal de Estoque & Marketplaces"
        description="Cadastre e gerencie plataformas de vendas (Ex: Magalu, TikTok Shop, AliExpress, Amazon, Mercado Livre)."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {channelTypes.length} tipos cadastrados
            </span>
            <Button size="sm" onClick={handleOpenAddType}>
              <Plus className="h-3.5 w-3.5" />
              <span>Novo Tipo de Canal</span>
            </Button>
          </div>

          <div className="divide-y divide-zinc-100 max-h-80 overflow-y-auto pr-1">
            {channelTypes.map((ct) => {
              const countUsing = stockLocations.filter((l) => l.channel_type === ct.code).length;

              return (
                <div key={ct.id} className="py-3 flex items-center justify-between hover:bg-zinc-50/60 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant={ct.badge_variant || 'default'} size="sm">
                      {ct.name}
                    </Badge>
                    <div>
                      <span className="font-mono text-[11px] text-zinc-400 block">Código: {ct.code}</span>
                      {ct.description && (
                        <p className="text-xs text-zinc-500 line-clamp-1">{ct.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400 mr-1">
                      {countUsing} canal(is)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditType(ct)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                      title="Editar tipo"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteChannelType(ct)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Excluir tipo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-zinc-100">
            <Button variant="outline" onClick={() => setIsTypesManagerOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Formulário de Criar/Editar Tipo de Canal */}
      <Modal
        isOpen={isTypeFormModalOpen}
        onClose={() => setIsTypeFormModalOpen(false)}
        title={editingChannelType ? 'Editar Tipo de Canal' : 'Cadastrar Novo Tipo de Canal'}
        description="Defina o nome da plataforma, código identificador e estilo de exibição."
      >
        <form onSubmit={handleSaveChannelType} className="space-y-4">
          <Input
            label="Nome do Tipo de Canal *"
            placeholder="Ex: Magazine Luiza (Magalu), TikTok Shop, etc."
            value={typeName}
            onChange={(e) => handleTypeNameChange(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Código Identificador (Slug) *"
              placeholder="Ex: magalu, tiktok_shop"
              value={typeCode}
              onChange={(e) => setTypeCode(e.target.value)}
              helperText="Identificador interno do canal"
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">Cor da Etiqueta (Badge)</label>
              <Select
                options={[
                  { value: 'default', label: 'Cinza (Padrão)' },
                  { value: 'warning', label: 'Amarelo / Laranja (ML)' },
                  { value: 'purple', label: 'Roxo / Magenta (Shopee)' },
                  { value: 'info', label: 'Azul (Amazon / Loja)' },
                  { value: 'success', label: 'Verde' },
                  { value: 'danger', label: 'Vermelho' },
                ]}
                value={typeBadgeVariant}
                onChange={(e) => setTypeBadgeVariant(e.target.value as any)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Descrição (Opcional)</label>
            <textarea
              rows={2}
              placeholder="Breve descrição da plataforma de marketplace ou canal..."
              value={typeDescription}
              onChange={(e) => setTypeDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => setIsTypeFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingChannelType ? 'Salvar Tipo' : 'Cadastrar Tipo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Cadastro / Edição de Canal ou Depósito */}
      <Modal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        title={editingLocation ? 'Editar Canal / Depósito' : 'Cadastrar Novo Canal / Depósito'}
        description="Adicione ou atualize os parâmetros do marketplace ou armazém físico."
      >
        <form onSubmit={handleSaveChannel} className="space-y-4">
          <Input
            label="Nome do Local / Canal *"
            placeholder="Ex: Mercado Livre Full - Barueri"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Código Identificador (Único) *"
              placeholder="Ex: ML-BARUERI"
              value={channelCode}
              onChange={(e) => setChannelCode(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-zinc-700">Tipo de Canal *</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsChannelModalOpen(false);
                    handleOpenAddType();
                  }}
                  className="text-[11px] text-zinc-900 font-semibold hover:underline"
                >
                  + Novo tipo
                </button>
              </div>
              <Select
                options={channelTypes.map((ct) => ({
                  value: ct.code,
                  label: ct.name,
                }))}
                value={channelType}
                onChange={(e) => setChannelType(e.target.value as StockChannelType)}
              />
            </div>
          </div>

          <Input
            label="Descrição / Observações"
            placeholder="Ex: Centro de distribuição para envios no mesmo dia"
            value={channelDescription}
            onChange={(e) => setChannelDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => setIsChannelModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingLocation ? 'Salvar Alterações' : 'Cadastrar Canal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Transferência de Estoque */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Transferir Mercadoria entre Canais"
        description="Mova unidades de estoque entre canais de marketplace e depósitos sem perder rastreabilidade."
      >
        <form onSubmit={handleExecuteTransfer} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Produto a Transferir *</label>
            <Select
              options={products.map((p) => ({
                value: p.id,
                label: `${p.sku} - ${p.name}`,
              }))}
              value={transferProductId}
              onChange={(e) => setTransferProductId(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">Canal de Origem *</label>
              <Select
                options={stockLocations.map((l) => ({ value: l.id, label: l.name }))}
                value={fromLocId}
                onChange={(e) => setFromLocId(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">Canal de Destino *</label>
              <Select
                options={stockLocations.map((l) => ({ value: l.id, label: l.name }))}
                value={toLocId}
                onChange={(e) => setToLocId(e.target.value)}
              />
            </div>
          </div>

          <Input
            label="Quantidade de Unidades *"
            type="number"
            min="1"
            value={transferQty}
            onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => setIsTransferOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Efetuar Transferência</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
