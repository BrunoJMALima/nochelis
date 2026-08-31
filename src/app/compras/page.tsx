'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ComprasRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/entradas');
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
      Redirecionando para Entradas de Estoque...
    </div>
  );
}
