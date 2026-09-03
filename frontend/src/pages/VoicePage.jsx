import VoiceAssistant from '../components/VoiceAssistant.jsx';
import Disclaimer from '../components/Disclaimer.jsx';
import { useTranslation } from 'react-i18next';
import { Mic } from 'lucide-react';

export default function VoicePage() {
  const { t } = useTranslation();

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold">
          <Mic size={14} className="text-purple-700" />
          <span>Hands-Free Speech AI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          {t('voicePage.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          {t('voicePage.subtitle')}
        </p>
      </div>

      <VoiceAssistant />

      <Disclaimer />
    </div>
  );
}
