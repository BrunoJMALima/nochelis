'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Boxes,
  Store,
  DollarSign,
  Package,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface OrderItemRow {
  productId: string;
  quantity: number;
  unitCostPrice: number;
}

export default function NovaEntradaPage() {
  const router = useRouter();
  const { suppliers, stockLocations, products, createPurchaseOrder } = useApp();

  const [destinationLocationId, setDestinationLocationId] = useState(stockLocations[0]?.id || '');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<OrderItemRow[]>([
    {
      productId: products[0]?.id || '',
      quantity: 50,
      unitCostPrice: products[0]?.cost_price || 0,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const selectedLocation = stockLocations.find((l) => l.id === destinationLocationId);

  const handleAddItem = () => {
    const firstProd = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: firstProd?.id || '',
        quantity: 10,
        unitCostPrice: firstProd?.cost_price || 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemProductChange = (index: number, newProductId: string) => {
    const prod = products.find((p) => p.id === newProductId);
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              productId: newProductId,
              unitCostPrice: prod?.cost_price || 0,
            }
          : item
      )
    );
  };

  const handleItemQuantityChange = (index: number, qty: number) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  };

  const handleItemCostChange = (index: number, cost: number) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, unitCostPrice: Math.max(0, cost) } : item
      )
    );
  };

  const totalAmount = items.reduce((acc, item) => acc + item.quantity * item.unitCostPrice, 0);
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationLocationId) {
      alert('Por favor, selecione o estoque de destino para onde os perfumes serão enviados.');
      return;
    }

    if (items.length === 0 || totalAmount <= 0) {
      alert('Adicione pelo menos um perfume com quantidade e custo de produção válidos.');
      return;
    }

    setIsLoading(true);

    try {
      await createPurchaseOrder(
        {
          supplier_id: supplierId || undefined,
          destination_location_id: destinationLocationId,
          purchase_date: purchaseDate,
          notes: notes.trim() || `Entrada de produção no estoque ${selectedLocation?.name || ''}`,
        },
        items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
          unit_cost_price: i.unitCostPrice,
        }))
      );

      router.push('/entradas');
    } catch (err) {
      console.error('Erro ao registrar entrada de estoque:', err);
      alert('Erro ao registrar entrada de estoque.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/entradas">
            <Button variant="ghost" size="icon" type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Nova Entrada de Perfumes no Estoque</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Selecione o estoque de destino e informe as fragrâncias e quantidades produzidas para alimentar o saldo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/entradas">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" isLoading={isLoading}>
            Creditar {totalUnits} frascos no Estoque
          </Button>
        </div>
      </div>

      {/* Seleção em Destaque do Estoque de Destino */}
      <Card className="border-2 border-zinc-900/10 bg-zinc-50/70 p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-zinc-900" />
              <label className="text-sm font-bold text-zinc-900">
                1. Selecione o Estoque / Canal de Destino onde os perfumes entrarão:
              </label>
            </div>
            <Badge variant="default">Obrigatório</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {stockLocations.map((loc) => {
              const isSelected = destinationLocationId === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setDestinationLocationId(loc.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-zinc-900 bg-white shadow-sm ring-1 ring-zinc-900'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                        {loc.code}
                      </span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-zinc-900" />}
                    </div>
                    <p className="font-bold text-sm text-zinc-900">{loc.name}</p>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{loc.description || 'Depósito de estoque'}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Destino da carga:</span>
                    <strong className="text-zinc-900">{isSelected ? 'Selecionado' : 'Clique para escolher'}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Formulário de Cabeçalho / Lote (1 col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>2. Dados do Lote & Origem</CardTitle>
              <CardDescription>Informações de fabricação e insumos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Data da Produção / Entrada *"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">Fornecedor de Insumos / Frascaria</label>
                <Select
                  options={[
                    { value: '', label: 'Produção Própria / Laboratório Interno' },
                    ...suppliers.map((s) => ({
                      value: s.id,
                      label: `${s.trade_name || s.corporate_name}`,
                    })),
                  ]}
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">Identificação do Lote / Observações</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Lote 2026-L08 envasado e rotulado para distribuição no Mercado Livre Full..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumo Financeiro da Entrada */}
          <Card className="bg-zinc-900 text-white border-zinc-800">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Custo Total do Lote
              </span>
              <div className="text-3xl font-bold text-white mt-1">{formatCurrency(totalAmount)}</div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-300 border-t border-zinc-800 pt-3">
                <span>Total de Perfumes Envasados:</span>
                <span className="font-semibold text-white">{totalUnits} frascos</span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-300 pt-1.5">
                <span>Estoque de Destino:</span>
                <span className="font-semibold text-emerald-400">{selectedLocation?.name || 'Não selecionado'}</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-3 pt-3 border-t border-zinc-800/80">
                Ao finalizar, o saldo deste estoque será incrementado instantaneamente e o custo unitário base será atualizado.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Perfumes da Entrada (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>3. Perfumes & Quantidades Produzidas</CardTitle>
                <CardDescription>
                  Selecione os perfumes cadastrados e informe os frascos fabricados e custo unitário
                </CardDescription>
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={handleAddItem}>
                <Plus className="h-4 w-4" />
                <span>Adicionar Perfume</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const subtotal = item.quantity * item.unitCostPrice;
                  const currentProd = products.find((p) => p.id === item.productId);

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl border border-zinc-100 bg-zinc-50/60"
                    >
                      <div className="w-full sm:flex-1 space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-500">Fragrância / Perfume</label>
                        <Select
                          options={products.map((p) => ({
                            value: p.id,
                            label: `${p.name} (${p.sku})`,
                          }))}
                          value={item.productId}
                          onChange={(e) => handleItemProductChange(idx, e.target.value)}
                        />
                      </div>

                      <div className="w-full sm:w-28 space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-500">Qtd (Frascos)</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemQuantityChange(idx, parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="w-full sm:w-36 space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-500">Custo Fabr. (R$)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitCostPrice}
                          onChange={(e) => handleItemCostChange(idx, parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="w-full sm:w-32 text-right pt-2 sm:pt-4">
                        <span className="text-[10px] text-zinc-400 block">Subtotal</span>
                        <span className="text-sm font-bold text-zinc-900">{formatCurrency(subtotal)}</span>
                      </div>

                      <div className="pt-2 sm:pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length === 1}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 transition-colors"
                          title="Remover item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
