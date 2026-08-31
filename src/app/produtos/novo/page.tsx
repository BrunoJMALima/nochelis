'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  TrendingUp,
  Package,
  Plus,
  Tag,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, calculateMarginPercent } from '@/lib/utils';
import { ProductImage } from '@/types';

export default function NovoProdutoPage() {
  const router = useRouter();
  const { categories, addProduct, addCategory } = useApp();

  // Estados do Formulário de Produto
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [minPrice, setMinPrice] = useState<number>(0);

  // Modal de Nova Categoria Rápida
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');

  // Imagens
  const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>([
    { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', isPrimary: true },
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // Cálculos em tempo real
  const unitProfit = Math.max(0, price - costPrice);
  const marginPercent = calculateMarginPercent(price, costPrice);

  const handleOpenNewCategoryModal = () => {
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

  const handleSaveNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const created = await addCategory({
      name: newCatName.trim(),
      slug: newCatSlug.trim() || newCatName.toLowerCase().replace(/\s+/g, '-'),
      description: newCatDescription.trim() || undefined,
    });

    setCategoryId(created.id);
    setIsCategoryModalOpen(false);
  };

  const handleAddImageByUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      { url: imageUrlInput.trim(), isPrimary: prev.length === 0 },
    ]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({ ...img, isPrimary: idx === index }))
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [
            ...prev,
            { url: event.target!.result as string, isPrimary: prev.length === 0 },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name || price <= 0) {
      alert('Por favor, preencha o SKU, Nome e Preço de Venda da fragrância.');
      return;
    }

    setIsLoading(true);

    try {
      const formattedImages: ProductImage[] = images.map((img, idx) => ({
        id: `img-${Date.now()}-${idx}`,
        product_id: '',
        image_url: img.url,
        is_primary: img.isPrimary,
        display_order: idx,
        created_at: new Date().toISOString(),
      }));

      await addProduct({
        sku: sku.trim().toUpperCase(),
        barcode: barcode.trim() || undefined,
        name: name.trim(),
        description: description.trim() || undefined,
        category_id: categoryId || undefined,
        cost_price: Number(costPrice) || 0,
        price: Number(price) || 0,
        min_price: Number(minPrice) || 0,
        status: 'active',
        images: formattedImages,
      });

      router.push('/produtos');
    } catch (err) {
      console.error('Erro ao cadastrar produto:', err);
      alert('Erro ao salvar fragrância.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/produtos">
              <Button variant="ghost" size="icon" type="button">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Nova Fragrância / Perfume</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Cadastre a ficha olfativa, precificação de venda e custos de produção do perfume.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={handleOpenNewCategoryModal}
            >
              <Tag className="h-4 w-4" />
              <span>Nova Família Olfativa</span>
            </Button>
            <Link href="/produtos">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading}>
              Salvar Fragrância
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Coluna Esquerda: Identificação e Precificação (2 cols) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Informações Gerais da Fragrância */}
            <Card>
              <CardHeader>
                <CardTitle>Identificação da Fragrância</CardTitle>
                <CardDescription>Dados essenciais para catálogo e ficha técnica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="SKU / Código Único *"
                    placeholder="Ex: NOCH-WOOD-100"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                  />
                  <Input
                    label="Código de Barras (EAN / GTIN)"
                    placeholder="Ex: 7898765430012"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>

                <Input
                  label="Nome do Perfume *"
                  placeholder="Ex: Perfume Nochelis Amadeirado Intenso EDP 100ml"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-zinc-700">Família Olfativa / Categoria</label>
                    <button
                      type="button"
                      onClick={handleOpenNewCategoryModal}
                      className="text-xs text-zinc-900 font-semibold hover:underline cursor-pointer"
                    >
                      + Nova Família
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

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700">Pirâmide Olfativa & Descrição</label>
                  <textarea
                    rows={4}
                    placeholder="Descreva as notas de topo, coração e fundo, tempo de fixação e diferenciais da fabricação própria Nochelis..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Precificação e Margem de Lucro */}
            <Card>
              <CardHeader>
                <CardTitle>Precificação & Lucratividade</CardTitle>
                <CardDescription>Custo de fabricação (frasco, essência, válvula), preço de venda e margens projetadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input
                    label="Custo de Fabricação (R$)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice || ''}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    helperText="Custo base para cálculo do CMV"
                  />
                  <Input
                    label="Preço de Venda (R$) *"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price || ''}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    helperText="Preço padrão de comercialização"
                    required
                  />
                  <Input
                    label="Preço Mínimo / Promocional (R$)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={minPrice || ''}
                    onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    helperText="Limite para cupons e descontos"
                  />
                </div>

                {/* Box de Resumo da Margem */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-700">Lucro Bruto por Frasco</span>
                      <p className="text-lg font-bold text-emerald-700">{formatCurrency(unitProfit)}</p>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-0 text-right">
                    <span className="text-xs text-zinc-500 block">Margem de Lucro Projetada</span>
                    <Badge variant={marginPercent > 30 ? 'success' : marginPercent > 15 ? 'warning' : 'danger'}>
                      {marginPercent}% Margem
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita: Fotos da Fragrância (1 col) */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fotos da Fragrância</CardTitle>
                <CardDescription>Upload do frasco e embalagem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dropzone */}
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-50/50 hover:border-zinc-400 transition-colors">
                  <Upload className="h-6 w-6 text-zinc-400 mb-2" />
                  <span className="text-xs font-semibold text-zinc-700">Clique para enviar fotos</span>
                  <span className="text-[11px] text-zinc-400 mt-0.5">PNG, JPG ou WebP até 5MB</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Inserir URL de imagem externa */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ou cole uma URL de imagem..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="text-xs"
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={handleAddImageByUrl}>
                    Adicionar
                  </Button>
                </div>

                {/* Grid de Imagens Carregadas */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          img.isPrimary ? 'border-zinc-900 shadow-xs' : 'border-zinc-200'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={`Foto ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />

                        {/* Botão de excluir */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 rounded-full bg-zinc-900/80 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>

                        {/* Badge / Ação de Foto Principal */}
                        {img.isPrimary ? (
                          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-zinc-900 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                            Principal
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                          >
                            Definir Capa
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-4 text-xs text-zinc-600">
              <strong className="block text-zinc-900 mb-1">Dica de Estoque:</strong>
              As quantidades deste perfume em cada estoque são alimentadas diretamente pelo módulo de{' '}
              <Link href="/entradas/nova" className="font-semibold text-zinc-900 underline hover:text-zinc-700">
                Entradas de Estoque
              </Link>
              .
            </div>
          </div>
        </div>
      </form>

      {/* Modal: Cadastro Rápido de Nova Categoria */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Cadastrar Nova Família Olfativa"
        description="Crie uma nova família ou categoria para catalogação das fragrâncias."
      >
        <form onSubmit={handleSaveNewCategory} className="space-y-4">
          <Input
            label="Nome da Categoria *"
            placeholder="Ex: Perfumes Amadeirados, Florais, etc."
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
              placeholder="Breve descrição dos tipos de fragrâncias..."
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
    </>
  );
}
