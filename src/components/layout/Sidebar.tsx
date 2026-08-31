'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  PackagePlus,
  PackageMinus,
  ShoppingBag,
  ShoppingCart,
  Users,
  Building2,
  TrendingUp,
  Store,
  Boxes,
  UserCheck,
  Tag,
  ChevronDown,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export function Sidebar() {
  const pathname = usePathname();
  const { metrics } = useApp();

  // Sub-itens do grupo Cadastros
  const cadastroSubItems = [
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Fornecedores', href: '/fornecedores', icon: Building2 },
    { name: 'Usuários', href: '/usuarios', icon: UserCheck },
    {
      name: 'Estoque',
      href: '/estoques',
      icon: Boxes,
      badge: metrics.lowStockCount > 0 ? `${metrics.lowStockCount} alertas` : undefined,
      badgeVariant: 'warning' as const,
    },
    { name: 'Produtos', href: '/produtos', icon: Package, badge: metrics.totalProductsCount },
  ];

  // Verifica se a rota atual pertence ao grupo Cadastros
  const isAnyCadastroActive = cadastroSubItems.some(
    (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
  );

  // Estado de expansão do menu Cadastros
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(true);

  // Garante que o menu permaneça aberto se o usuário navegar para uma rota de cadastro
  useEffect(() => {
    if (isAnyCadastroActive) {
      setIsCadastrosOpen(true);
    }
  }, [isAnyCadastroActive]);

  const isRelatoriosActive = pathname === '/' || pathname.startsWith('/relatorios');

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200/80 bg-white/95 backdrop-blur-md">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-zinc-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs">
          <Store className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-zinc-900">NOCHELIS</span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">
            E-commerce Multi-Canal
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Principal
        </div>

        {/* Relatórios & DRE (Página Inicial Padrão) */}
        <Link
          href="/"
          className={cn(
            'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
            isRelatoriosActive
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
          )}
        >
          <div className="flex items-center gap-3">
            <TrendingUp
              className={cn(
                'h-4 w-4 transition-colors',
                isRelatoriosActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-700'
              )}
            />
            <span>Relatórios & DRE</span>
          </div>
        </Link>

        {/* Aba / Submenu Retrátil: Cadastros */}
        <div className="space-y-1 pt-1">
          <button
            type="button"
            onClick={() => setIsCadastrosOpen((prev) => !prev)}
            className={cn(
              'w-full group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer select-none',
              isAnyCadastroActive
                ? 'text-zinc-900 font-semibold bg-zinc-100/80'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            )}
          >
            <div className="flex items-center gap-3">
              <ClipboardList
                className={cn(
                  'h-4 w-4 transition-colors',
                  isAnyCadastroActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-700'
                )}
              />
              <span>Cadastros</span>
            </div>

            <ChevronDown
              className={cn(
                'h-4 w-4 text-zinc-400 transition-transform duration-200',
                isCadastrosOpen && 'rotate-180 text-zinc-700'
              )}
            />
          </button>

          {/* Sub-itens de Cadastros */}
          {isCadastrosOpen && (
            <div className="pl-3.5 pr-1 space-y-1 border-l-2 border-zinc-100 ml-4 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
              {cadastroSubItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          'h-3.5 w-3.5 transition-colors',
                          isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-700'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold',
                          isActive
                            ? 'bg-zinc-800 text-zinc-200'
                            : item.badgeVariant === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-zinc-100 text-zinc-600'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Módulos Operacionais: Compras & Vendas */}
        <div className="pt-2">
          <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Operações & Gestão
          </div>

          {/* Entradas */}
          <Link
            href="/entradas"
            className={cn(
              'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
              pathname.startsWith('/entradas') || pathname.startsWith('/compras')
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            )}
          >
            <div className="flex items-center gap-3">
              <PackagePlus
                className={cn(
                  'h-4 w-4 transition-colors',
                  pathname.startsWith('/entradas') || pathname.startsWith('/compras')
                    ? 'text-white'
                    : 'text-zinc-400 group-hover:text-zinc-700'
                )}
              />
              <span>Entradas</span>
            </div>
          </Link>

          {/* Saídas */}
          <Link
            href="/saidas"
            className={cn(
              'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
              pathname.startsWith('/saidas') || pathname.startsWith('/vendas')
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            )}
          >
            <div className="flex items-center gap-3">
              <PackageMinus
                className={cn(
                  'h-4 w-4 transition-colors',
                  pathname.startsWith('/saidas') || pathname.startsWith('/vendas')
                    ? 'text-white'
                    : 'text-zinc-400 group-hover:text-zinc-700'
                )}
              />
              <span>Saídas</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-zinc-100 p-4">
        <div className="rounded-2xl bg-zinc-50 p-3 border border-zinc-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-800">Canais Conectados</span>
            </div>
            <span className="text-xs font-bold text-zinc-500">{metrics.channelMetrics.length} canais</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Online e Matriz sincronizados</p>
        </div>
      </div>
    </aside>
  );
}
