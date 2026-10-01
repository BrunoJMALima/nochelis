'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isAuthPage = pathname === '/login' || pathname === '/cadastro';

  useEffect(() => {
    if (!isLoading) {
      if (!user && !isAuthPage) {
        router.push('/login');
      } else if (user && isAuthPage) {
        router.push('/');
      }
    }
  }, [user, isLoading, isAuthPage, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
          <span className="text-xs text-zinc-500 font-medium">Carregando Nochelis...</span>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar Fixa */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className="flex flex-1 flex-col pl-64">
        <Navbar />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
