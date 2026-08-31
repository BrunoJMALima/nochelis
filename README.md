# 📦 Nochelis ERP & Gestão Comercial

> Sistema completo de gestão comercial, controle de estoque, vendas, compras e fornecedores desenvolvido com **Next.js 16**, **Tailwind CSS v4** e **Supabase**.

---

## 🚀 Tecnologias Utilizadas

- **Front-end**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)
- **Back-end & Banco de Dados**: [Supabase (PostgreSQL)](https://supabase.com/)
- **Autenticação e RLS**: Supabase Auth com Row Level Security (RLS)
- **SSR & Sessões**: `@supabase/ssr`

---

## ✨ Funcionalidades Principais

- 🔐 **Autenticação e Controle de Acesso**: Login e gestão de permissões de usuários.
- 📊 **Dashboard & Relatórios**: Visão geral de métricas, vendas e estoques em tempo real.
- 📦 **Gestão de Produtos e Categorias**: Cadastro completo com categorias e movimentação.
- 🏭 **Fornecedores e Compras**: Registro de fornecedores e controle de entradas de mercadorias.
- 🛒 **Vendas e Clientes**: Gestão de clientes, registro de vendas e emissão de movimentações.
- 📈 **Controle de Estoque**: Entradas, saídas e histórico auditável de saldo.

---

## 🛠️ Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/nochelis.git
cd nochelis
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 4. Rodar o servidor de desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para acessar a aplicação.

---

## 📂 Estrutura do Projeto

```
nochelis/
├── src/
│   ├── app/           # Rotas do Next.js (App Router)
│   ├── components/    # Componentes React reutilizáveis
│   ├── context/       # Provedores de contexto do React
│   ├── lib/           # Clientes do Supabase e utilitários
│   └── types/         # Definições de tipos TypeScript
├── supabase/          # Migrations e scripts SQL do Supabase
└── public/            # Arquivos estáticos
```

---

## 📄 Licença

Este projeto é de uso privado / restrito. Todos os direitos reservados.
