'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, PackagePlus, CheckCircle2, Inbox, ArrowDownToLine, Store } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PeriodFilter } from '@/components/ui/PeriodFilter';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DateRange, getPresetDateRange, isDateInRange } from '@/lib/dateUtils';

export default function EntradasPage() {
  const { purchaseOrders, suppliers, stockLocations, products } = useApp();

  // Estado do Filtro de Período (Padrão: Este Mês)
  const [period, setPeriod] = useState<DateRange>(() => {
    const initial = getPresetDateRange('this_month');
    return {
      startDate: initial.startDate,
      endDate: initial.endDate,
      preset: 'this_month',
      label: initial.label,
    };
  });

  // Filtro de canal/estoque específico
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Filtragem de ordens de entrada pelo período selecionado e pelo estoque de destino
  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    const matchesPeriod = isDateInRange(order.purchase_date || order.created_at, period.startDate, period.endDate);
    const matchesLocation = selectedLocation === 'all' || order.destination_location_id === selectedLocation;
    return matchesPeriod && matchesLocation;
  });

  const totalPurchasesAmount = filteredPurchaseOrders.reduce((acc, po) => acc + (po.total_amount || 0), 0);
  const totalUnitsReceived = filteredPurchaseOrders.reduce(
    (acc, po) => acc + (po.items || []).reduce((itemAcc, i) => itemAcc + i.quantity, 0),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header com Filtro de Período e Ação */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Entradas de Estoque & Produção</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Dê entrada nos lotes de perfumes fabricados, selecionando o estoque ou marketplace de destino (Matriz, ML, Shopee, Loja).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PeriodFilter value={period} onChange={setPeriod} />

          <Link href="/entradas/nova">
            <Button>
              <Plus className="h-4 w-4" />
              <span>Nova Entrada no Estoque</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas do Período */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="p-5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Total Produzido / Envasado ({period.label})
          </span>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{totalUnitsReceived} frascos</p>
          <span className="text-xs text-zinc-500 mt-1 block">
            {filteredPurchaseOrders.length} lote{filteredPurchaseOrders.length === 1 ? '' : 's'} de entrada registrados
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Custo Total de Fabricação
          </span>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{formatCurrency(totalPurchasesAmount)}</p>
          <span className="text-xs text-zinc-500 mt-1 block">
            Média de {totalUnitsReceived > 0 ? formatCurrency(totalPurchasesAmount / totalUnitsReceived) : 'R$ 0,00'} por frasco
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Destino dos Lotes</span>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="success">Saldo Creditado em Tempo Real</Badge>
          </div>
          <span className="text-xs text-zinc-500 mt-1 block">Disponível para venda no canal selecionado</span>
        </Card>
      </div>

      {/* Filtro por Estoque de Destino */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-700">Filtrar por Estoque de Destino:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLocation('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                selectedLocation === 'all'
                  ? 'bg-zinc-900 text-white font-semibold shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Todos os Estoques
            </button>
            {stockLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  selectedLocation === loc.id
                    ? 'bg-zinc-900 text-white font-semibold shadow-2xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabela de Entradas de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Entradas no Estoque ({period.label})</CardTitle>
          <CardDescription>
            Lotes de fragrâncias produzidas, custo unitário e o canal de estoque creditado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPurchaseOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 mb-3">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-700">Nenhuma entrada no período selecionado</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Altere o filtro de datas ou clique em &ldquo;Nova Entrada no Estoque&rdquo; para registrar a produção.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase bg-zinc-50/50">
                  <tr>
                    <th className="py-3 px-4 font-medium">Ordem / Lote</th>
                    <th className="py-3 px-4 font-medium">Data da Entrada</th>
                    <th className="py-3 px-4 font-medium">Estoque de Destino</th>
                    <th className="py-3 px-4 font-medium">Fornecedor / Origem</th>
                    <th className="py-3 px-4 font-medium">Fragrâncias / Quantidade</th>
                    <th className="py-3 px-4 font-medium">Custo Total</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredPurchaseOrders.map((po) => {
                    const supplier = suppliers.find((s) => s.id === po.supplier_id);
                    const location = stockLocations.find((l) => l.id === po.destination_location_id);
                    const totalUnits = (po.items || []).reduce((acc, i) => acc + i.quantity, 0);

                    return (
                      <tr key={po.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-zinc-900 font-mono text-xs">
                          {po.order_number}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 font-medium">
                          {formatDate(po.purchase_date)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-900 font-semibold text-xs border border-zinc-200">
                            <Store className="h-3.5 w-3.5 text-zinc-500" />
                            {location?.name || 'Estoque Matriz'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-semibold text-zinc-800 block text-xs">
                              {supplier?.trade_name || supplier?.corporate_name || 'Produção Interna Nochelis'}
                            </span>
                            {po.notes && (
                              <span className="text-[11px] text-zinc-400 line-clamp-1">{po.notes}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-zinc-900">{totalUnits} frascos</span>
                            <div className="text-[11px] text-zinc-500">
                              {(po.items || []).map((item, idx) => {
                                const prod = products.find((p) => p.id === item.product_id);
                                return (
                                  <span key={idx} className="block text-zinc-500">
                                    • {item.quantity}x {prod?.name || 'Perfume'}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900">
                          {formatCurrency(po.total_amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Creditado no Estoque</span>
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
