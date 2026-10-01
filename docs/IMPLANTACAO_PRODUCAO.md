# 📘 Documentação de Implantação e Arquitetura - Nochelis ERP

**Projeto:** Nochelis ERP & Gestão Comercial  
**Domínio:** [https://nochelis.pjbal.com.br](https://nochelis.pjbal.com.br)  
**Data da Implantação:** 01 de Outubro de 2026  
**Status do Ambiente:** Em Produção (100% Operacional & Seguro com HTTPS)  

---

## 📌 Visão Geral do Que Foi Realizado

Nesta sessão, realizamos a implantação completa de ponta a ponta do sistema **Nochelis ERP**, desde a infraestrutura do banco de dados em nuvem até a publicação em servidor próprio (VPS Locaweb) com domínio personalizado e certificado digital.

```mermaid
flowchart TD
    subgraph Cliente["Navegador do Usuário"]
        UserBrowser["Usuário (https://nochelis.pjbal.com.br)"]
    end

    subgraph DNS["Resolução de Nomes"]
        RegistroBR["Registro.br (pjbal.com.br)"] -->|Nameservers| LocawebDNS["Locaweb DNS (ns1/ns2/ns3)"]
        LocawebDNS -->|Entrada A| VPS_IP["IP: 201.76.56.31"]
    end

    subgraph ServidorVPS["VPS Locaweb (Ubuntu 20.04 LTS - 2GB RAM / 2 vCPUs)"]
        Firewall["Firewall / Portas 80 e 443"] --> Nginx["Nginx Reverse Proxy + SSL Let's Encrypt"]
        Nginx -->|Porta 80| HTTPS_Redirect["Redirecionamento HTTPS"]
        Nginx -->|Porta 443 (nochelis.pjbal.com.br)| NextApp["Next.js 16 (Porta 3001) - PM2"]
        Nginx -->|Porta 80/443 (exatadelivery.com.br)| DeliveryApp["Delivery API (Porta 3000) - PM2"]
        Swap["Swap 2GB (Estabilidade de Memória)"] -.-> NextApp
    end

    subgraph CloudDatabase["Supabase Cloud"]
        NextApp -->|REST / RPC / RLS| SupabaseDB["PostgreSQL + Supabase Auth + RLS"]
    end

    UserBrowser --> DNS
    DNS --> ServidorVPS
```

---

## 1. 🗄️ Banco de Dados (Supabase)

### 1.1. Execução dos Scripts SQL
Foram executadas duas camadas essenciais no SQL Editor do Supabase:

1. **`supabase/schema.sql`**:
   - **Tabelas Criadas**: `profiles`, `stock_locations`, `customers`, `customer_addresses`, `suppliers`, `categories`, `products`, `product_images`, `product_inventory`, `inventory_movements`, `purchase_orders`, `purchase_order_items`, `sales_orders`, `sales_order_items`.
   - **Segurança (Row Level Security - RLS)**: Ativado em 100% das tabelas para restringir operações de dados conforme os perfis autenticados.
   - **Trigger de Autenticação Automática**: Implementação da função `handle_new_user()` vinculada à tabela `auth.users`, criando automaticamente o perfil na tabela `public.profiles` quando um usuário se cadastra.
   - **Dados Iniciais (Seeds)**:
     - Canais de estoque: *Estoque Central (EST-MATRIZ)*, *Mercado Livre Full (ML-CANAL)*, *Shopee Oficial (SHOPEE-CANAL)* e *Loja Física / Balcão (LOJA-BALCAO)*.
     - Categorias: *Eletrônicos & Acessórios*, *Moda & Vestuário*, *Casa & Decoração*, *Beleza & Cuidados*.

2. **`supabase/functions.sql`**:
   - `receive_purchase_order`: Stored procedure transacional que processa a entrada de mercadorias, alimenta o saldo no canal de estoque selecionado, atualiza o custo médio do produto e cria o log de auditoria.
   - `process_sales_order`: Stored procedure transacional que finaliza a venda, abate o estoque do canal correto, congela o CMV (Custo das Mercadorias Vendidas) no momento da venda e calcula o lucro bruto da operação.

### 1.2. Configuração das Chaves de API
- **Correção da URL**: A URL original continha `/rest/v1/` no final. No padrão do Supabase JS SDK, a URL base deve ser limpa (`https://karoxgyfnbwwibpshpii.supabase.co`), pois os endpoints são adicionados dinamicamente pela biblioteca.
- **Isolamento de Segurança**: As chaves reais foram gravadas exclusivamente no arquivo `.env.local` (protegido contra commits pelo `.gitignore`), enquanto o arquivo `.env.example` permaneceu com placeholders para segurança no GitHub.

---

## 2. 🖥️ Infraestrutura da VPS (Locaweb)

### 2.1. Otimização do Sistema Operacional (Ubuntu 20.04 LTS)
A VPS possui 2 GB de memória RAM física e 2 vCPUs. Em aplicações Next.js modernas, o processo de compilação (`next build`) pode ter picos de consumo de memória que causariam travamento (*Out Of Memory - OOM*).

- **Criação do Arquivo de SWAP (2GB)**:
  ```bash
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  ```

### 2.2. Instalação do Pacote de Produção
Instalamos as versões de suporte de longo prazo:
- **Node.js**: v20 LTS (via repositório oficial NodeSource)
- **Gerenciador de Processos**: PM2 global (`npm install -g pm2`)
- **Servidor Web / Proxy Reverso**: Nginx
- **Utilitário de Certificado SSL**: Certbot e plugin `python3-certbot-nginx`

### 2.3. Resolução de Conflito de Portas (Multi-Aplicação)
O servidor já possuía outra aplicação em execução (`delivery-api`) escutando na porta padrão `3000`.

- **Solução Arquitetural**:
  Configuramos o Nochelis para rodar na porta **`3001`**, mantendo os dois sistemas operando simultaneamente sem interferências:
  ```bash
  PORT=3001 pm2 start npm --name "nochelis" -- start -- -p 3001
  pm2 save
  pm2 startup
  ```

---

## 3. 🌐 DNS, Nginx e Certificado SSL

### 3.1. Diagnóstico e Correção da Delegação de DNS
Identificamos que o domínio `pjbal.com.br` no **Registro.br** estava apontando para nameservers antigos da Scriptcase (`ns1.scriptcase.host`), impedindo a resolução das entradas criadas no painel da Locaweb.

- **Ação**: Ativação da chave *"Usar nameservers da Locaweb"* no painel da Locaweb.
- **Resultado no Registro.br**: A delegação foi atualizada para os servidores autoritativos da Locaweb (`ns1.locaweb.com.br`, `ns2.locaweb.com.br`, `ns3.locaweb.com.br`), propagando o subdomínio `nochelis.pjbal.com.br` para o IP `201.76.56.31`.

### 3.2. Configuração do Nginx
Criamos o bloco de configuração em `/etc/nginx/sites-available/nochelis`:
```nginx
server {
    server_name nochelis.pjbal.com.br;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
*(Também corrigimos uma duplicação da diretiva `location /` presente no arquivo `/etc/nginx/sites-available/default` da outra aplicação, garantindo que o comando `nginx -t` passasse com 100% de sucesso).*

### 3.3. Emissão do Certificado HTTPS (Let's Encrypt)
Executado o Certbot para geração de certificado SSL e configuração de redirecionamento automático:
```bash
certbot --nginx -d nochelis.pjbal.com.br
# Selecionada Opção 2: Redirect HTTP -> HTTPS
```

---

## 4. 🔐 Ajustes de Segurança e Fluxo de Autenticação

Identificamos que, ao acessar a raiz do sistema, o aplicativo caía direto no Dashboard por conta de configurações de desenvolvimento.

### 4.1. Remoção do Auto-Login Padrão (`AuthContext.tsx`)
- **Antes**: Quando o usuário não possuía sessão no `localStorage`, o código injetava automaticamente o usuário mock `Bruno Lima (Administrador)`.
- **Depois**: Se não houver sessão válida armazenada ou autenticação no Supabase, o estado inicial do usuário é `null`.

### 4.2. Implementação do Auth Guard (`Shell.tsx`)
- Foi criado um efeito de proteção de rota:
  - Se o usuário **não estiver autenticado** e tentar acessar qualquer rota privada (como a home `/`), é imediatamente redirecionado para a tela de **`/login`**.
  - Se o usuário **já estiver autenticado** e tentar acessar a página de login/cadastro, é redirecionado para a tela principal (`/`).
  - Enquanto o estado de autenticação está sendo resolvido (`isLoading`), exibe uma tela de carregamento suave, prevenindo que o dashboard apareça antes da validação.

---

## 5. 🛠️ Guia Rápido de Operação e Manutenção

### Como atualizar a aplicação em produção após novos commits:
Sempre que fizer alterações no seu código local e der `git push origin main`, acesse a VPS pelo PowerShell e execute apenas:

```bash
cd /var/www/nochelis
git pull origin main
npm run build
pm2 restart nochelis
```

### Comandos úteis do dia a dia:

| Objetivo | Comando |
|---|---|
| **Ver status dos processos** | `pm2 status` |
| **Ver logs em tempo real do Nochelis** | `pm2 logs nochelis` |
| **Reiniciar o Nochelis** | `pm2 restart nochelis` |
| **Testar sintaxe do Nginx** | `nginx -t` |
| **Reiniciar o servidor web Nginx** | `systemctl restart nginx` |
| **Verificar uso de memória e SWAP** | `free -h` |
| **Renovação automática do SSL** | `certbot renew --dry-run` |

---
**Ambiente entregue com sucesso e pronto para uso contínuo!**
