'use client';

import React from 'react';
import { Bell, Search, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200/80 bg-white/80 px-8 backdrop-blur-md">
      {/* Busca Global */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar produto, pedido, cliente, SKU..."
            className="h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Notificações, Perfil & Logout */}
      <div className="flex items-center gap-3">
        <button className="relative rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors cursor-pointer">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
        </button>

        <div className="h-4 w-px bg-zinc-200 mx-1" />

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3 pl-1">
          <Link href="/usuarios" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-xs shadow-xs">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-800 line-clamp-1">
                {user?.full_name || 'Usuário'}
              </span>
              <span className="text-[10px] text-zinc-400 capitalize">{user?.role || 'operador'}</span>
            </div>
          </Link>

          <button
            onClick={() => logout()}
            className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            title="Sair do sistema"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
