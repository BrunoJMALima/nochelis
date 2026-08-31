'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NovaVendaRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/saidas/nova');
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
      Redirecionando para Registrar Nova Saída de Estoque...
    </div>
  );
}
