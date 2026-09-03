import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGS = [
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'en', label: 'English' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('kisan_lang', lang);
  };

  return (
    <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition px-2.5 py-1.5 rounded-full border border-white/20 text-white">
      <Globe size={16} className="text-leaf-200 shrink-0" />
      <select
        value={i18n.language || 'en'}
        onChange={handleChange}
        className="bg-transparent text-xs sm:text-sm font-medium text-white outline-none cursor-pointer pr-1"
        aria-label="Select language"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code} className="text-slate-900 bg-white">
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
