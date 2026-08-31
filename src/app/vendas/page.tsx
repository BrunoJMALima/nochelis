'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendasRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/saidas');
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
      Redirecionando para Saídas de Estoque...
    </div>
  );
}
