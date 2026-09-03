import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Disclaimer() {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3 bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 max-w-4xl mx-auto my-6 text-amber-900 shadow-sm">
      <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
      <p className="text-xs sm:text-sm leading-relaxed font-medium">
        {t('disclaimer')}
      </p>
    </div>
  );
}
