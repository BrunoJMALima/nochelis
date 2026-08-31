import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { Shell } from '@/components/layout/Shell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nochelis | E-commerce & Multi-Estoque Inteligente',
  description: 'Gestão integrada de estoques (Shopee, Mercado Livre), produtos, compras, vendas e margens de lucro.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full bg-zinc-50/70">
      <body className={`${inter.className} min-h-full flex antialiased text-zinc-900 selection:bg-zinc-900 selection:text-white`}>
        <AuthProvider>
          <AppProvider>
            <Shell>{children}</Shell>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
