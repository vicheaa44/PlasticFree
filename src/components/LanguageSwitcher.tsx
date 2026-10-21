import { useLanguage } from '../i18n/LanguageContext'
import { LANGS } from '../i18n/translations'

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLanguage()
  return (
    <div className={`flex gap-1 ${className}`} role="group" aria-label="Language">
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`flex-1 rounded-[4px] px-2 py-1.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.06em] transition-colors ${
            lang === code ? 'bg-white text-black' : 'text-white/55 hover:bg-white/10 hover:text-white'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
