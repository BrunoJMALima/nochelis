'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NovaCompraRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/entradas/nova');
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
      Redirecionando para Nova Entrada de Estoque...
    </div>
  );
}
