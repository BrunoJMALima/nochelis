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
  PackageMinus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface SalesItemRow {
  productId: string;
  quantity: number;
  unitSalePrice: number;
}

export default function NovaSaidaPage() {
  const router = useRouter();
  const { customers, stockLocations, products, createSalesOrder } = useApp();

  const [stockLocationId, setStockLocationId] = useState(stockLocations[1]?.id || stockLocations[0]?.id || '');
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [discount, setDiscount] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<SalesItemRow[]>([
    {
      productId: products[0]?.id || '',
      quantity: 1,
      unitSalePrice: products[0]?.price || 0,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const selectedLocation = stockLocations.find((l) => l.id === stockLocationId);

  const handleAddItem = () => {
    const firstProd = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: firstProd?.id || '',
        quantity: 1,
        unitSalePrice: firstProd?.price || 0,
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
              unitSalePrice: prod?.price || 0,
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

  const handleItemPriceChange = (index: number, price: number) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, unitSalePrice: Math.max(0, price) } : item
      )
    );
  };

  // Cálculos financeiros em tempo real
  let subtotal = 0;
  let totalCost = 0;
  let hasInsufficientStock = false;

  items.forEach((item) => {
    const prod = products.find((p) => p.id === item.productId);
    const cost = prod?.cost_price || 0;
    subtotal += item.quantity * item.unitSalePrice;
    totalCost += item.quantity * cost;

    const channelInv = (prod?.inventory || []).find((i) => i.stock_location_id === stockLocationId);
    const availableInChannel = channelInv?.quantity ?? 0;
    if (item.quantity > availableInChannel) {
      hasInsufficientStock = true;
    }
  });

  const totalAmount = Math.max(0, subtotal - discount + shippingFee);
  const grossProfit = totalAmount - totalCost;
  const marginPercent = totalAmount > 0 ? (grossProfit / totalAmount) * 100 : 0;
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockLocationId) {
      alert('Selecione o estoque de origem de onde os produtos estão saindo.');
      return;
    }

    if (items.length === 0 || totalAmount <= 0) {
      alert('Adicione pelo menos um item válido para registrar a saída de estoque.');
      return;
    }

    if (hasInsufficientStock) {
      if (!confirm('Atenção: Um ou mais itens têm quantidade superior ao saldo atual disponível neste estoque. Deseja prosseguir com a saída mesmo assim?')) {
        return;
      }
    }

    setIsLoading(true);

    try {
      await createSalesOrder(
        {
          customer_id: customerId || undefined,
          stock_location_id: stockLocationId,
          discount: Number(discount) || 0,
          shipping_fee: Number(shippingFee) || 0,
          sale_date: new Date().toISOString(),
          notes: notes.trim() || `Saída de estoque originada de ${selectedLocation?.name || ''}`,
        },
        items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
          unit_sale_price: i.unitSalePrice,
        }))
      );

      router.push('/saidas');
    } catch (err) {
      console.error('Erro ao registrar saída de estoque:', err);
      alert('Erro ao registrar saída de estoque.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/saidas">
            <Button variant="ghost" size="icon" type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Registrar Saída de Estoque</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Selecione o estoque de origem de onde os produtos sairão para dar baixa automática no saldo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/saidas">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" isLoading={isLoading}>
            Baixar {totalUnits} frascos do Estoque
          </Button>
        </div>
      </div>

      {/* Seleção em Destaque do Estoque de Origem */}
      <Card className="border-2 border-zinc-900/10 bg-zinc-50/70 p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-zinc-900" />
              <label className="text-sm font-bold text-zinc-900">
                1. Selecione o Estoque / Canal de Origem de onde os produtos estão saindo:
              </label>
            </div>
            <Badge variant="default">Obrigatório</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {stockLocations.map((loc) => {
              const isSelected = stockLocationId === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setStockLocationId(loc.id)}
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
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{loc.description || 'Estoque e expedição'}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Origem da baixa:</span>
                    <strong className="text-zinc-900">{isSelected ? 'Selecionado' : 'Clique para escolher'}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Formulário do Pedido (1 col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>2. Destinatário & Informações</CardTitle>
              <CardDescription>Cliente, descontos e frete da operação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">Cliente / Destino *</label>
                <Select
                  options={customers.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${c.document || c.email || 'Sem doc'})`,
                  }))}
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Desconto (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />

                <Input
                  label="Frete / Envio (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={shippingFee || ''}
                  onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">Observações / Código do Pedido</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Saída gerada pela venda #4819 na Shopee Oficial..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Box de Resumo e Lucratividade do Pedido */}
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border-zinc-800">
            <CardHeader className="pb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total da Saída</span>
              <div className="text-3xl font-bold text-white mt-1">{formatCurrency(totalAmount)}</div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between text-xs text-zinc-300 border-t border-zinc-800 pt-3">
                <span>Estoque de Origem:</span>
                <span className="font-semibold text-emerald-400">{selectedLocation?.name || 'Não selecionado'}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-300 pt-1">
                <span>Custo de Fabricação (CMV):</span>
                <span className="font-semibold text-zinc-200">{formatCurrency(totalCost)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold border-t border-zinc-800/80 pt-2">
                <span>Lucro Bruto Previsto:</span>
                <span className="text-sm">{formatCurrency(grossProfit)}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-400">Margem Comercial:</span>
                <Badge variant={marginPercent > 35 ? 'success' : marginPercent > 15 ? 'warning' : 'danger'}>
                  {marginPercent.toFixed(1)}% Margem
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Itens da Saída (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>3. Fragrâncias da Saída & Preços</CardTitle>
                <CardDescription>
                  Verifique o saldo disponível no estoque {selectedLocation?.name || ''} e defina o valor de venda
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
                  const prod = products.find((p) => p.id === item.productId);
                  const channelInv = (prod?.inventory || []).find((i) => i.stock_location_id === stockLocationId);
                  const availableInChannel = channelInv?.quantity ?? 0;
                  const isLow = item.quantity > availableInChannel;
                  const itemSubtotal = item.quantity * item.unitSalePrice;
                  const itemProfit = itemSubtotal - item.quantity * (prod?.cost_price || 0);

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl border transition-all ${
                        isLow ? 'border-amber-300 bg-amber-50/40' : 'border-zinc-100 bg-zinc-50/60'
                      }`}
                    >
                      <div className="w-full sm:flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-medium text-zinc-500">Fragrância / Perfume</label>
                          <span className={`text-[10px] ${isLow ? 'text-amber-700 font-bold' : 'text-zinc-500'}`}>
                            Saldo em {selectedLocation?.name?.split('/')[0] || 'estoque'}:{' '}
                            <strong>{availableInChannel} un.</strong>
                          </span>
                        </div>
                        <Select
                          options={products.map((p) => ({
                            value: p.id,
                            label: `${p.name} (${p.sku})`,
                          }))}
                          value={item.productId}
                          onChange={(e) => handleItemProductChange(idx, e.target.value)}
                        />
                      </div>

                      <div className="w-full sm:w-24 space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-500">Qtd Saída</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemQuantityChange(idx, parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="w-full sm:w-36 space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-500">Preço Venda (R$)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitSalePrice}
                          onChange={(e) => handleItemPriceChange(idx, parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="w-full sm:w-32 text-right pt-2 sm:pt-4">
                        <span className="text-[10px] text-zinc-400 block">Subtotal</span>
                        <span className="text-sm font-bold text-zinc-900">{formatCurrency(itemSubtotal)}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold block">
                          +{formatCurrency(itemProfit)}
                        </span>
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
