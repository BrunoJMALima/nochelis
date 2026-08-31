'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Tag,
  Edit2,
  Trash2,
  Package,
  FolderTree,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Category } from '@/types';

export default function CategoriasPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      // Auto-generate slug
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
        description: description.trim() || undefined,
      });
    } else {
      await addCategory({
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
        description: description.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, catName: string) => {
    const productsInCat = products.filter((p) => p.category_id === id).length;
    if (productsInCat > 0) {
      if (!confirm(`Existem ${productsInCat} produto(s) vinculados a esta categoria. Deseja realmente excluir?`)) {
        return;
      }
    } else {
      if (!confirm(`Deseja realmente excluir a categoria "${catName}"?`)) {
        return;
      }
    }
    await deleteCategory(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Categorias de Produtos</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Organize seu catálogo de e-commerce e facilite a navegação e relatórios por departamento.
          </p>
        </div>

        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4" />
          <span>Nova Categoria</span>
        </Button>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="p-5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total de Categorias</span>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{categories.length}</p>
          <span className="text-xs text-zinc-500 mt-1 block">Departamentos cadastrados</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Produtos Categorizados</span>
          <p className="text-2xl font-bold text-zinc-900 mt-1">
            {products.filter((p) => p.category_id).length} un.
          </p>
          <span className="text-xs text-zinc-500 mt-1 block">de {products.length} produtos totais</span>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-zinc-50/50">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estrutura de Catálogo</span>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="purple" size="sm">
              Sincronizado Multi-Canal
            </Badge>
          </div>
          <span className="text-xs text-zinc-500 mt-1 block">Compatível com ML e Shopee</span>
        </Card>
      </div>

      {/* Barra de Busca */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar por nome, slug ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Tabela de Categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Departamentos e Categorias</CardTitle>
          <CardDescription>Lista completa de categorias cadastradas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase bg-zinc-50/50">
                <tr>
                  <th className="py-3 px-4 font-medium">Categoria</th>
                  <th className="py-3 px-4 font-medium">Slug (URL)</th>
                  <th className="py-3 px-4 font-medium">Descrição</th>
                  <th className="py-3 px-4 font-medium">Qtd. Produtos</th>
                  <th className="py-3 px-4 font-medium">Criado em</th>
                  <th className="py-3 px-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400">
                      Nenhuma categoria encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const count = products.filter((p) => p.category_id === cat.id).length;

                    return (
                      <tr key={cat.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                              <Tag className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-zinc-900">{cat.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-zinc-500">{cat.slug}</td>
                        <td className="py-3.5 px-4 text-xs text-zinc-600 max-w-xs truncate">
                          {cat.description || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="default" size="sm">
                            {count} produto{count === 1 ? '' : 's'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-zinc-400">{formatDate(cat.created_at)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cat)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                              title="Editar categoria"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Excluir categoria"
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
        </CardContent>
      </Card>

      {/* Modal de Criação / Edição de Categoria */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria de Produto'}
        description="Preencha as informações para organizar seu catálogo."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nome da Categoria *"
            placeholder="Ex: Fones de Ouvido, Periféricos, etc."
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <Input
            label="Slug (Identificador na URL) *"
            placeholder="Ex: fones-de-ouvido"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            helperText="Usado para rotas e filtros amigáveis"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Descrição (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Breve descrição dos tipos de produtos pertencentes a esta categoria..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
