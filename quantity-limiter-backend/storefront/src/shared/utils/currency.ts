export interface FormatCurrencyOptions {
  currency: string;
  value: number | string;
  compact?: boolean;
  locale?: string;
}

export function formatCurrency({ currency, value, compact = false, locale = 'en' }: FormatCurrencyOptions): string {
  let finalLocale = locale;
  if (finalLocale.includes('_')) {
    finalLocale = finalLocale.split('_')[0];
  }
  if (finalLocale === 'id') {
    finalLocale = 'id-ID';
  }
  return new Intl.NumberFormat(finalLocale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    notation: compact ? 'compact' : 'standard',
  }).format(Number(parseFloat(String(value)).toFixed(2)));
}
