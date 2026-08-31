export type PeriodPresetKey =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'all'
  | 'custom';

export interface DateRange {
  startDate: string; // Formato YYYY-MM-DD
  endDate: string;   // Formato YYYY-MM-DD
  preset: PeriodPresetKey;
  label: string;
}

export interface PresetOption {
  key: PeriodPresetKey;
  label: string;
}

export const PRESET_OPTIONS: PresetOption[] = [
  { key: 'today', label: 'Hoje' },
  { key: 'yesterday', label: 'Ontem' },
  { key: 'last_7_days', label: 'Últimos 7 dias' },
  { key: 'last_30_days', label: 'Últimos 30 dias' },
  { key: 'this_month', label: 'Este Mês' },
  { key: 'last_month', label: 'Mês Anterior' },
  { key: 'this_year', label: 'Este Ano' },
  { key: 'all', label: 'Todo o Período' },
  { key: 'custom', label: 'Personalizado' },
];

function formatDateToISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPresetDateRange(preset: PeriodPresetKey): { startDate: string; endDate: string; label: string } {
  const now = new Date();
  const todayStr = formatDateToISOString(now);

  switch (preset) {
    case 'today':
      return {
        startDate: todayStr,
        endDate: todayStr,
        label: 'Hoje',
      };

    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = formatDateToISOString(yesterday);
      return {
        startDate: yStr,
        endDate: yStr,
        label: 'Ontem',
      };
    }

    case 'last_7_days': {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 6);
      return {
        startDate: formatDateToISOString(past7),
        endDate: todayStr,
        label: 'Últimos 7 dias',
      };
    }

    case 'last_30_days': {
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 29);
      return {
        startDate: formatDateToISOString(past30),
        endDate: todayStr,
        label: 'Últimos 30 dias',
      };
    }

    case 'this_month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        startDate: formatDateToISOString(startOfMonth),
        endDate: formatDateToISOString(endOfMonth),
        label: 'Este Mês',
      };
    }

    case 'last_month': {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: formatDateToISOString(startOfLastMonth),
        endDate: formatDateToISOString(endOfLastMonth),
        label: 'Mês Anterior',
      };
    }

    case 'this_year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      return {
        startDate: formatDateToISOString(startOfYear),
        endDate: formatDateToISOString(endOfYear),
        label: 'Este Ano',
      };
    }

    case 'all':
      return {
        startDate: '1970-01-01',
        endDate: '2099-12-31',
        label: 'Todo o Período',
      };

    case 'custom':
    default:
      return {
        startDate: formatDateToISOString(new Date(now.getFullYear(), now.getMonth(), 1)),
        endDate: todayStr,
        label: 'Personalizado',
      };
  }
}

export function isDateInRange(
  dateValue: string | Date | null | undefined,
  startDate: string,
  endDate: string
): boolean {
  if (!dateValue) return false;
  
  try {
    const targetDate = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(targetDate.getTime())) return false;

    // Normalizar a data alvo para YYYY-MM-DD em string local
    const targetStr = formatDateToISOString(targetDate);

    // Se início e fim estiverem definidos
    if (startDate && targetStr < startDate) return false;
    if (endDate && targetStr > endDate) return false;

    return true;
  } catch {
    return false;
  }
}

export function formatPeriodDisplay(range: DateRange): string {
  if (range.preset !== 'custom' && range.preset !== 'all') {
    return range.label;
  }

  if (range.preset === 'all') {
    return 'Histórico Completo';
  }

  if (!range.startDate && !range.endDate) return 'Todo o período';

  const formatPtBR = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return `${formatPtBR(range.startDate)} até ${formatPtBR(range.endDate)}`;
}
