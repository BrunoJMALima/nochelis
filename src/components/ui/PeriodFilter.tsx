'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check, Clock, RotateCcw } from 'lucide-react';
import {
  DateRange,
  PeriodPresetKey,
  PRESET_OPTIONS,
  getPresetDateRange,
  formatPeriodDisplay,
} from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

export interface PeriodFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function PeriodFilter({ value, onChange, className }: PeriodFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(value.startDate);
  const [customEnd, setCustomEnd] = useState(value.endDate);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincroniza campos customizados quando o value externo muda
  useEffect(() => {
    setCustomStart(value.startDate);
    setCustomEnd(value.endDate);
  }, [value.startDate, value.endDate]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectPreset = (preset: PeriodPresetKey) => {
    if (preset === 'custom') {
      // Abre a visualização de customização no menu
      return;
    }

    const newRange = getPresetDateRange(preset);
    onChange({
      startDate: newRange.startDate,
      endDate: newRange.endDate,
      preset,
      label: newRange.label,
    });
    setIsOpen(false);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;

    onChange({
      startDate: customStart,
      endDate: customEnd,
      preset: 'custom',
      label: 'Personalizado',
    });
    setIsOpen(false);
  };

  const handleResetToCurrentMonth = () => {
    const range = getPresetDateRange('this_month');
    onChange({
      startDate: range.startDate,
      endDate: range.endDate,
      preset: 'this_month',
      label: range.label,
    });
    setIsOpen(false);
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      {/* Botão Gatilho */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-zinc-200 bg-white text-zinc-800 shadow-xs hover:bg-zinc-50 hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all cursor-pointer select-none',
          isOpen && 'border-zinc-900 ring-2 ring-zinc-900/10'
        )}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
          <CalendarIcon className="h-3.5 w-3.5" />
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider leading-none">
            Período
          </span>
          <span className="text-xs font-semibold text-zinc-900 mt-0.5">
            {formatPeriodDisplay(value)}
          </span>
        </div>

        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-zinc-400 ml-1 transition-transform duration-200',
            isOpen && 'rotate-180 text-zinc-700'
          )}
        />
      </button>

      {/* Popover / Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 z-50 mt-2 w-80 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
          {/* Header do Menu */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-100 px-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              <span>Filtrar por Período</span>
            </div>
            <button
              type="button"
              onClick={handleResetToCurrentMonth}
              title="Voltar para Este Mês"
              className="text-[11px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Este Mês</span>
            </button>
          </div>

          {/* Lista de Atalhos (Presets) */}
          <div className="grid grid-cols-2 gap-1 mb-3">
            {PRESET_OPTIONS.filter((p) => p.key !== 'custom').map((opt) => {
              const isSelected = value.preset === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectPreset(opt.key)}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer',
                    isSelected
                      ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="h-3 w-3 text-white ml-1 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Seção de Período Customizado */}
          <form onSubmit={handleApplyCustom} className="pt-3 border-t border-zinc-100 space-y-2.5">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block px-1">
              Intervalo Personalizado
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">De:</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-2 py-1.5 text-xs text-zinc-800 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Até:</label>
                <input
                  type="date"
                  value={customEnd}
                  min={customStart}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-2 py-1.5 text-xs text-zinc-800 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-8 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Aplicar Intervalo</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
