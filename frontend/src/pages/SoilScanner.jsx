import { useState } from 'react';
import { ScanLine, Upload, Sparkles, CheckCircle2, Sprout, AlertCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Disclaimer from '../components/Disclaimer.jsx';

export default function SoilScanner() {
  const { t, i18n } = useTranslation();
  const [soilColor, setSoilColor] = useState('black');
  const [soilTexture, setSoilTexture] = useState('clayey');
  const [soilResult, setSoilResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/soil/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soilColor, soilTexture }),
      });
      const data = await res.json();
      setSoilResult(data);
    } catch (err) {
      console.error('Soil analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSoilTypeName = () => {
    if (!soilResult) return '';
    if (i18n.language === 'te' && soilResult.soilType_te) return soilResult.soilType_te;
    if (i18n.language === 'hi' && soilResult.soilType_hi) return soilResult.soilType_hi;
    return soilResult.soilType;
  };

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
          <ScanLine size={14} className="text-amber-700" />
          <span>Soil Morphology & Nutrient Estimator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          {t('soilPage.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          {t('soilPage.subtitle')}
        </p>
      </div>

      {/* Soil Parameter Selector Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-md">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Color Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('soilPage.soilColor')}
              </label>
              <select
                value={soilColor}
                onChange={(e) => setSoilColor(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-amber-500 shadow-2xs"
              >
                <option value="black">{t('soilPage.black')}</option>
                <option value="red">{t('soilPage.red')}</option>
                <option value="alluvial">{t('soilPage.alluvial')}</option>
                <option value="sandy">{t('soilPage.sandy')}</option>
              </select>
            </div>

            {/* Texture Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('soilPage.soilTexture')}
              </label>
              <select
                value={soilTexture}
                onChange={(e) => setSoilTexture(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-amber-500 shadow-2xs"
              >
                <option value="clayey">{t('soilPage.clayey')}</option>
                <option value="loamy">{t('soilPage.loamy')}</option>
                <option value="porous">{t('soilPage.porous')}</option>
                <option value="coarse">{t('soilPage.coarse')}</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <ScanLine size={18} />
            <span>{t('soilPage.analyzeSoil')}</span>
          </button>
        </form>
      </div>

      {/* Soil Health Result Report */}
      {soilResult && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-leaf-500" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Soil Profile Diagnosis
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-2">
                {getSoilTypeName()}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {soilResult.texture} • {soilResult.colorDescription}
              </p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-left sm:text-right">
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                {t('soilPage.estimatedPh')}
              </p>
              <p className="text-xl font-extrabold text-amber-950 mt-0.5">
                {soilResult.phEstimated}
              </p>
            </div>
          </div>

          {/* Key Nutrient Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <p className="text-xs font-bold text-slate-400 uppercase">{t('soilPage.organicCarbon')}</p>
              <p className="text-base font-extrabold text-slate-900 mt-1">{soilResult.organicCarbon}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <p className="text-xs font-bold text-slate-400 uppercase">Available N-P-K Status</p>
              <p className="text-xs font-bold text-slate-800 mt-1">
                N: {soilResult.npkStatus?.nitrogen} | P: {soilResult.npkStatus?.phosphorus} | K: {soilResult.npkStatus?.potassium}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <p className="text-xs font-bold text-slate-400 uppercase">{t('soilPage.waterRetention')}</p>
              <p className="text-xs font-bold text-slate-800 mt-1">{soilResult.waterHoldingCapacity}</p>
            </div>
          </div>

          {/* Suitable Crops */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sprout size={16} className="text-leaf-600" />
              <span>{t('soilPage.recommendedCrops')}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {soilResult.recommendedCrops?.map((crop) => (
                <span
                  key={crop}
                  className="px-3 py-1.5 rounded-xl bg-leaf-100 text-leaf-900 font-bold text-xs border border-leaf-200"
                >
                  🌾 {crop}
                </span>
              ))}
            </div>
          </div>

          {/* Improvement Tips */}
          <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200">
            <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-amber-700" />
              <span>{t('soilPage.improvementTips')}</span>
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-amber-900 font-medium">
              {soilResult.managementTips?.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
