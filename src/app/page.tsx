'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  ArrowUpRight,
  Package,
  PackagePlus,
  Layers,
  Store,
  Inbox,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PeriodFilter } from '@/components/ui/PeriodFilter';
import { formatCurrency, calculateMarginPercent } from '@/lib/utils';
import { DateRange, getPresetDateRange, isDateInRange } from '@/lib/dateUtils';

export default function RelatoriosPage() {
  const { salesOrders, products, stockLocations } = useApp();

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

  // Vendas filtradas pelo período selecionado
  const filteredSalesOrders = salesOrders.filter((order) =>
    isDateInRange(order.sale_date || order.created_at, period.startDate, period.endDate)
  );

  // Cálculos do DRE no período selecionado
  const totalGrossRevenue = filteredSalesOrders.reduce((acc, s) => acc + (s.subtotal || 0), 0);
  const totalDiscounts = filteredSalesOrders.reduce((acc, s) => acc + (s.discount || 0), 0);
  const netRevenue = filteredSalesOrders.reduce((acc, s) => acc + (s.total_amount || 0), 0);
  const totalCMV = filteredSalesOrders.reduce((acc, s) => acc + (s.total_cost || 0), 0);
  const grossProfit = netRevenue - totalCMV;
  const profitMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

  // Rentabilidade por Produto no Período
  const productProfitability = products
    .map((prod) => {
      let unitsSold = 0;
      let revenue = 0;
      let cost = 0;

      filteredSalesOrders.forEach((order) => {
        (order.items || []).forEach((item) => {
          if (item.product_id === prod.id) {
            unitsSold += item.quantity;
            revenue += item.subtotal;
            cost += item.quantity * item.unit_cost_price;
          }
        });
      });

      const profit = revenue - cost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : calculateMarginPercent(prod.price, prod.cost_price);

      return {
        product: prod,
        unitsSold,
        revenue,
        cost,
        profit,
        margin,
      };
    })
    .sort((a, b) => b.profit - a.profit);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header com Filtro de Período e Ações Rápidas */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Relatórios & DRE de Margens</h1>
          <p className="text-sm text-zinc-500 mt-1">
            DRE simplificado, custo das mercadorias vendidas (CMV) e rentabilidade por produto no período selecionado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Período */}
          <PeriodFilter value={period} onChange={setPeriod} />

          <div className="h-6 w-px bg-zinc-200 hidden sm:block" />

          <Link href="/entradas/nova">
            <Button variant="outline" size="sm">
              <PackagePlus className="h-4 w-4" />
              <span>Nova Entrada</span>
            </Button>
          </Link>
          <Link href="/saidas/nova">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              <span>Registrar Saída</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* DRE Simplificado */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Painel DRE Operacional */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>DRE Gerencial ({period.label})</CardTitle>
            <CardDescription>Visão contábil e operacional consolidada das operações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-700 font-sans font-medium">(+) Faturamento Bruto de Vendas</span>
                <span className="font-bold text-zinc-900">{formatCurrency(totalGrossRevenue)}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/60 border border-zinc-100">
                <span className="text-zinc-500 font-sans">(-) Descontos Concedidos</span>
                <span className="text-rose-600 font-semibold">
                  {totalDiscounts > 0 ? `-${formatCurrency(totalDiscounts)}` : 'R$ 0,00'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-100/70 border border-zinc-200">
                <span className="text-zinc-900 font-sans font-semibold">(=) Receita Líquida Operacional</span>
                <span className="font-bold text-zinc-950">{formatCurrency(netRevenue)}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-rose-800">
                <span className="font-sans font-medium">(-) CMV (Custo das Mercadorias Vendidas)</span>
                <span className="font-bold">
                  {totalCMV > 0 ? `-${formatCurrency(totalCMV)}` : 'R$ 0,00'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <div>
                  <span className="font-sans font-bold text-base block">(=) Lucro Bruto Operacional</span>
                  <span className="font-sans text-xs text-emerald-700">Resultado após dedução dos custos diretos</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xl block">{formatCurrency(grossProfit)}</span>
                  <Badge variant="success" size="sm">
                    {profitMargin.toFixed(1)}% Margem Bruta
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Eficiência */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Margem & Retorno</CardTitle>
            <CardDescription>Eficiência no período ({period.label})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                <span>Margem de Lucro Média</span>
                <span className="font-bold text-zinc-900">{profitMargin.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(profitMargin, 0), 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                <span>Comprometimento do CMV</span>
                <span className="font-bold text-zinc-900">
                  {netRevenue > 0 ? ((totalCMV / netRevenue) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-zinc-800 h-full rounded-full transition-all duration-500"
                  style={{ width: `${netRevenue > 0 ? Math.min((totalCMV / netRevenue) * 100, 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 p-3.5 border border-zinc-100 text-xs text-zinc-600">
              <strong className="text-zinc-900 block mb-1">Total de Pedidos:</strong>
              {filteredSalesOrders.length} pedido{filteredSalesOrders.length === 1 ? '' : 's'} faturado{filteredSalesOrders.length === 1 ? '' : 's'} no período analisado.
            </div>
          </CardContent>
          <div />
        </Card>
      </div>

      {/* Tabela de Rentabilidade por Produto */}
      <Card>
        <CardHeader>
          <CardTitle>Rentabilidade por Produto ({period.label})</CardTitle>
          <CardDescription>Classificação de produtos por faturamento e lucro acumulado no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase bg-zinc-50/50">
                <tr>
                  <th className="py-3 px-4 font-medium">Produto / SKU</th>
                  <th className="py-3 px-4 font-medium">Preço Venda</th>
                  <th className="py-3 px-4 font-medium">Preço Custo</th>
                  <th className="py-3 px-4 font-medium">Unidades Vendidas</th>
                  <th className="py-3 px-4 font-medium">Faturamento</th>
                  <th className="py-3 px-4 font-medium">Lucro Gerado</th>
                  <th className="py-3 px-4 font-medium">Margem %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {productProfitability.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                ) : (
                  productProfitability.map((item) => (
                    <tr key={item.product.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-semibold text-zinc-900 block">{item.product.name}</span>
                          <span className="font-mono text-[11px] text-zinc-400">{item.product.sku}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-800">{formatCurrency(item.product.price)}</td>
                      <td className="py-3.5 px-4 text-zinc-500">{formatCurrency(item.product.cost_price)}</td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-900">{item.unitsSold} un.</td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900">{formatCurrency(item.revenue)}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-600">
                          {item.profit > 0 ? `+${formatCurrency(item.profit)}` : formatCurrency(item.profit)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={item.margin > 30 ? 'success' : 'default'} size="sm">
                          {item.margin.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
