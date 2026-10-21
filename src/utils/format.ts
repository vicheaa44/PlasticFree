import type { Lang } from '../i18n/translations'

const LOCALES: Record<Lang, string> = { en: 'en-GB', ro: 'ro-RO', ru: 'ru-RU' }

/** 0.45 kg -> "450 g", 3.2 kg -> "3.2 kg", localised. */
export function formatWeight(kg: number, lang: Lang): string {
  const locale = LOCALES[lang]
  if (kg >= 1000) return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(kg / 1000))} t`
  if (kg < 1) return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(kg * 1000))} g`
  const digits = kg >= 100 ? 0 : 1
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(kg)} kg`
}

/** 1 234 567 -> "1.2M"; tonnes, people and similar large counts. */
export function formatCompact(value: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALES[lang], { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatNumber(value: number, lang: Lang, digits = 0): string {
  return new Intl.NumberFormat(LOCALES[lang], { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value)
}

export function formatMoney(eur: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALES[lang], { style: 'currency', currency: 'EUR', maximumFractionDigits: Math.abs(eur) < 10 ? 2 : 0 }).format(eur)
}

export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: 'medium' }).format(date)
}
