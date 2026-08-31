'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Store, CheckCircle2, Inbox, PackageMinus, ArrowUpRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PeriodFilter } from '@/components/ui/PeriodFilter';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DateRange, getPresetDateRange, isDateInRange } from '@/lib/dateUtils';

export default function SaidasPage() {
  const { salesOrders, customers, stockLocations, products } = useApp();

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

  // Filtro por Estoque de Origem
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Filtragem de pedidos pelo período selecionado e estoque de origem
  const filteredSalesOrders = salesOrders.filter((order) => {
    const matchesPeriod = isDateInRange(order.sale_date || order.created_at, period.startDate, period.endDate);
    const matchesLocation = selectedLocation === 'all' || order.stock_location_id === selectedLocation;
    return matchesPeriod && matchesLocation;
  });

  const totalRevenue = filteredSalesOrders.reduce((acc, so) => acc + (so.total_amount || 0), 0);
  const totalProfit = filteredSalesOrders.reduce((acc, so) => acc + (so.gross_profit || 0), 0);
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const totalUnitsDispatched = filteredSalesOrders.reduce(
    (acc, so) => acc + (so.items || []).reduce((itemAcc, i) => itemAcc + i.quantity, 0),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header com Filtro de Período */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Saídas de Estoque & Expedição</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Controle de saídas de mercadorias por estoque de origem (Mercado Livre, Shopee, Matriz, Loja) e baixa automática de inventário.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PeriodFilter value={period} onChange={setPeriod} />

          <Link href="/saidas/nova">
            <Button>
              <Plus className="h-4 w-4" />
              <span>Registrar Nova Saída</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas do Período */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="p-5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Total Despachado ({period.label})
          </span>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{totalUnitsDispatched} frascos</p>
          <span className="text-xs text-zinc-500 mt-1 block">
            {filteredSalesOrders.length} pedido{filteredSalesOrders.length === 1 ? '' : 's'} / saídas faturadas
          </span>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-emerald-50/20 border-emerald-200/60">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Faturamento & Lucro Realizado
          </span>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{formatCurrency(totalRevenue)}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-emerald-700">
              +{formatCurrency(totalProfit)} lucro
            </span>
            <Badge variant="success" size="sm">
              {averageMargin.toFixed(1)}% Margem
            </Badge>
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status das Baixas</span>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="success">100% Baixa Automática</Badge>
          </div>
          <span className="text-xs text-zinc-500 mt-1 block">Saldos deduzidos no estoque de origem</span>
        </Card>
      </div>

      {/* Filtro por Estoque de Origem */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-700">Filtrar por Estoque de Origem:</span>
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

      {/* Tabela de Saídas de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Saídas & Expedição ({period.label})</CardTitle>
          <CardDescription>Acompanhamento de baixas de estoque, canal de saída, cliente e rentabilidade</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSalesOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 mb-3">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-700">Nenhuma saída de estoque no período selecionado</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Altere os filtros acima ou clique em &ldquo;Registrar Nova Saída&rdquo; para dar baixa no estoque.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase bg-zinc-50/50">
                  <tr>
                    <th className="py-3 px-4 font-medium">Pedido / Saída</th>
                    <th className="py-3 px-4 font-medium">Data</th>
                    <th className="py-3 px-4 font-medium">Estoque de Origem</th>
                    <th className="py-3 px-4 font-medium">Cliente / Destino</th>
                    <th className="py-3 px-4 font-medium">Itens / Quantidade</th>
                    <th className="py-3 px-4 font-medium">Valor Total</th>
                    <th className="py-3 px-4 font-medium">Lucro Bruto</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredSalesOrders.map((so) => {
                    const customer = customers.find((c) => c.id === so.customer_id);
                    const location = stockLocations.find((l) => l.id === so.stock_location_id);
                    const margin = so.total_amount > 0 ? (so.gross_profit / so.total_amount) * 100 : 0;
                    const totalUnits = (so.items || []).reduce((acc, i) => acc + i.quantity, 0);

                    return (
                      <tr key={so.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-zinc-900 font-mono text-xs">
                          {so.order_number}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 font-medium">
                          {formatDate(so.sale_date)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-900 font-semibold text-xs border border-zinc-200">
                            <Store className="h-3.5 w-3.5 text-zinc-500" />
                            {location?.name || 'Canal Geral'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-semibold text-zinc-800 block text-xs">
                              {customer?.name || 'Venda Balcão / Avulsa'}
                            </span>
                            <span className="text-[11px] text-zinc-400">{customer?.document || customer?.email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-bold text-zinc-900 block">{totalUnits} frascos</span>
                          <span className="text-[11px] text-zinc-400">
                            {so.items?.length || 0} fragrância{(so.items?.length || 0) > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900">
                          {formatCurrency(so.total_amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-emerald-600">
                              +{formatCurrency(so.gross_profit)}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-medium">
                              ({margin.toFixed(0)}% margem)
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Baixa Efetuada</span>
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
