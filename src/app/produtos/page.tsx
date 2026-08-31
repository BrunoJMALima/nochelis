'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit2,
  DollarSign,
  TrendingUp,
  Boxes,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency, formatNumber, calculateMarginPercent } from '@/lib/utils';
import { Product } from '@/types';

export default function ProdutosPage() {
  const { products, categories, stockLocations, addCategory, updateProduct, deleteProduct } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal de Edição de Produto
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Modal de Nova Categoria Rápida
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');

  // Form State para Edição de Produto
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [costPrice, setCostPrice] = useState<number | string>(0);
  const [price, setPrice] = useState<number | string>(0);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku);
    setBarcode(prod.barcode || '');
    setCategoryId(prod.category_id || '');
    setCostPrice(prod.cost_price);
    setPrice(prod.price);
    setDescription(prod.description || '');
    setImageUrl(prod.images?.[0]?.image_url || '');
    setIsEditModalOpen(true);
  };

  const handleOpenAddCategory = () => {
    setNewCatName('');
    setNewCatSlug('');
    setNewCatDescription('');
    setIsCategoryModalOpen(true);
  };

  const handleCatNameChange = (val: string) => {
    setNewCatName(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setNewCatSlug(generatedSlug);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const created = await addCategory({
      name: newCatName.trim(),
      slug: newCatSlug.trim() || newCatName.toLowerCase().replace(/\s+/g, '-'),
      description: newCatDescription.trim() || undefined,
    });

    if (isEditModalOpen) {
      setCategoryId(created.id);
    }
    setIsCategoryModalOpen(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !name.trim() || !sku.trim()) return;

    const numCost = typeof costPrice === 'string' ? parseFloat(costPrice) || 0 : costPrice;
    const numPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;

    const images = imageUrl.trim()
      ? [
          {
            id: editingProduct.images?.[0]?.id || `img-${Date.now()}`,
            product_id: editingProduct.id,
            image_url: imageUrl.trim(),
            is_primary: true,
            display_order: 0,
            created_at: editingProduct.images?.[0]?.created_at || new Date().toISOString(),
          },
        ]
      : editingProduct.images || [];

    await updateProduct(editingProduct.id, {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      barcode: barcode.trim() || undefined,
      category_id: categoryId || undefined,
      cost_price: numCost,
      price: numPrice,
      description: description.trim() || undefined,
      images,
    });

    setIsEditModalOpen(false);
  };

  const handleDelete = async (prod: Product) => {
    if (confirm(`Deseja realmente excluir o produto "${prod.name}" (${prod.sku})?`)) {
      await deleteProduct(prod.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Catálogo de Fragrâncias & Perfumes</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Gerencie fragrâncias de fabricação própria, custos de produção, preços de venda e distribuição de estoque por canal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={handleOpenAddCategory}>
            <Tag className="h-4 w-4" />
            <span>Nova Categoria</span>
          </Button>
          <Link href="/produtos/novo">
            <Button>
              <Plus className="h-4 w-4" />
              <span>Cadastrar Produto</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por nome, SKU, código de barras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-700 focus:border-zinc-900 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-100 p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-zinc-900 shadow-2xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Tabela
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-zinc-900 shadow-2xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Grade
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Visualização em Tabela */}
      {viewMode === 'table' ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase bg-zinc-50/50">
                <tr>
                  <th className="py-3 px-4 font-medium">Produto</th>
                  <th className="py-3 px-4 font-medium">SKU</th>
                  <th className="py-3 px-4 font-medium">Preço de Custo</th>
                  <th className="py-3 px-4 font-medium">Preço de Venda</th>
                  <th className="py-3 px-4 font-medium">Margem Unit.</th>
                  <th className="py-3 px-4 font-medium">Saldo por Canal</th>
                  <th className="py-3 px-4 font-medium">Total</th>
                  <th className="py-3 px-4 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-400">
                      Nenhum produto encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const margin = calculateMarginPercent(prod.price, prod.cost_price);
                    const unitProfit = prod.price - prod.cost_price;
                    const totalStock = (prod.inventory || []).reduce((acc, i) => acc + i.quantity, 0);

                    return (
                      <tr key={prod.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {prod.images && prod.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={prod.images[0].image_url}
                                alt={prod.name}
                                className="h-11 w-11 rounded-xl object-cover border border-zinc-200 shrink-0"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 shrink-0">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-zinc-900 line-clamp-1">{prod.name}</p>
                              <span className="text-[11px] text-zinc-400">
                                {categories.find((c) => c.id === prod.category_id)?.name || 'Sem Categoria'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs text-zinc-600 font-medium">
                          {prod.sku}
                        </td>

                        <td className="py-3.5 px-4 text-zinc-600 font-medium">
                          {formatCurrency(prod.cost_price)}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-zinc-900">
                          {formatCurrency(prod.price)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-emerald-600">
                              +{formatCurrency(unitProfit)}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-medium">
                              ({margin}%)
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {(prod.inventory || []).map((inv) => {
                              const loc = stockLocations.find((l) => l.id === inv.stock_location_id);
                              const shortName =
                                loc?.channel_type === 'mercado_livre'
                                  ? 'ML'
                                  : loc?.channel_type === 'shopee'
                                  ? 'Shopee'
                                  : loc?.channel_type === 'physical_store'
                                  ? 'Loja'
                                  : 'Matriz';

                              return (
                                <span
                                  key={inv.stock_location_id}
                                  className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 border border-zinc-200"
                                >
                                  <span className="text-zinc-400">{shortName}:</span>
                                  <strong className="text-zinc-900">{inv.quantity}</strong>
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant={totalStock <= 10 ? 'danger' : 'default'} size="sm">
                            {totalStock} un.
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                              title="Editar produto"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(prod)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Excluir produto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Visualização em Grade / Cards */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((prod) => {
            const margin = calculateMarginPercent(prod.price, prod.cost_price);
            const totalStock = (prod.inventory || []).reduce((acc, i) => acc + i.quantity, 0);

            return (
              <Card key={prod.id} className="overflow-hidden flex flex-col justify-between group">
                <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden">
                  {prod.images && prod.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={prod.images[0].image_url}
                      alt={prod.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">
                      <Package className="h-12 w-12" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <Badge variant={totalStock <= 10 ? 'danger' : 'default'}>
                      {totalStock} un.
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-xl p-1 shadow-sm border border-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition-colors"
                      title="Editar produto"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(prod)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Excluir produto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      {prod.sku}
                    </span>
                    <h3 className="font-semibold text-sm text-zinc-900 mt-1 line-clamp-2">{prod.name}</h3>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Preço de Venda</span>
                      <span className="font-bold text-base text-zinc-900">{formatCurrency(prod.price)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 font-semibold block">{margin}% margem</span>
                      <span className="text-xs text-zinc-400">Custo: {formatCurrency(prod.cost_price)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Edição de Produto */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Fragrância / Perfume"
        description="Atualize preços, notas olfativas, categoria, códigos e detalhes deste produto."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <Input
            label="Nome do Perfume *"
            placeholder="Ex: Perfume Nochelis Amadeirado Intenso EDP 100ml"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="SKU / Código Único *"
              placeholder="Ex: NOCH-WOOD-100"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />

            <Input
              label="Código de Barras (EAN)"
              placeholder="Ex: 7898765430012"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-zinc-700">Família Olfativa / Categoria</label>
                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="text-[11px] text-zinc-900 font-semibold hover:underline cursor-pointer"
                >
                  + Nova
                </button>
              </div>
              <Select
                options={[
                  { value: '', label: 'Selecione uma Família Olfativa' },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Custo de Fabricação (R$) *"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              helperText="Custo de produção (frasco + essência + embalagem) para CMV"
              required
            />

            <Input
              label="Preço de Venda (R$) *"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              helperText="Preço final padrão de venda nos canais"
              required
            />
          </div>

          <Input
            label="URL da Imagem Principal"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            leftIcon={<ImageIcon className="h-4 w-4" />}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Pirâmide Olfativa e Descrição</label>
            <textarea
              rows={3}
              placeholder="Notas de topo, coração e fundo, fixação e detalhes da composição..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Cadastro Rápido de Nova Categoria */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Cadastrar Nova Família Olfativa"
        description="Crie uma nova família ou categoria para catalogação das fragrâncias."
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Nome da Categoria *"
            placeholder="Ex: Perfumes Amadeirados, Cítricos, etc."
            value={newCatName}
            onChange={(e) => handleCatNameChange(e.target.value)}
            required
          />

          <Input
            label="Slug (URL amigável) *"
            placeholder="Ex: amadeirados-nobres"
            value={newCatSlug}
            onChange={(e) => setNewCatSlug(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Descrição (Opcional)</label>
            <textarea
              rows={3}
              placeholder="Breve descrição dos tipos de produtos..."
              value={newCatDescription}
              onChange={(e) => setNewCatDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar Categoria</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
