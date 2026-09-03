import { useState, useEffect } from 'react';
import { BookOpen, Sprout, Calendar, FlaskConical, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Disclaimer from '../components/Disclaimer.jsx';

export default function CropAdvisory() {
  const { t, i18n } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/crops')
      .then((res) => res.json())
      .then((data) => {
        setCrops(data.crops || []);
        if (data.crops && data.crops.length > 0) {
          setSelectedCrop(data.crops[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Crops advisory fetch failed:', err);
        setLoading(false);
      });
  }, []);

  const getCropName = (c) => {
    if (!c) return '';
    if (i18n.language === 'te' && c.name_te) return c.name_te;
    if (i18n.language === 'hi' && c.name_hi) return c.name_hi;
    return c.name;
  };

  const getDiseaseName = (c) => {
    if (!c) return '';
    if (i18n.language === 'te' && c.disease_te) return c.disease_te;
    if (i18n.language === 'hi' && c.disease_hi) return c.disease_hi;
    return c.disease;
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-leaf-100 text-leaf-800 text-xs font-semibold">
          <BookOpen size={14} className="text-leaf-600" />
          <span>16 Major Crops Agronomic Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          {t('advisoryPage.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          {t('advisoryPage.subtitle')}
        </p>
      </div>

      {/* 16 Crops Grid Selector */}
      <div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
          {t('advisoryPage.selectCrop')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {crops.map((crop) => {
            const isSelected = selectedCrop?.id === crop.id;
            return (
              <button
                key={crop.id}
                onClick={() => setSelectedCrop(crop)}
                className={`p-3 rounded-2xl text-center transition border flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-leaf-700 text-white font-bold shadow-md border-leaf-700 ring-2 ring-leaf-400/30'
                    : 'bg-white hover:bg-leaf-50 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-xl">🌾</span>
                <span className="text-xs truncate w-full">{getCropName(crop)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Crop Advisory Content */}
      {selectedCrop && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-8 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-leaf-500 via-emerald-400 to-teal-500" />

          {/* Title row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-bold text-leaf-800 bg-leaf-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Full Cultivation Package
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-2">
                {getCropName(selectedCrop)}
              </h2>
            </div>
            <div className="bg-leaf-50 rounded-2xl p-4 border border-leaf-200 text-left sm:text-right">
              <p className="text-[11px] font-bold text-leaf-800 uppercase tracking-wider">
                Standard NPK Dosage
              </p>
              <p className="text-base font-extrabold text-leaf-900 mt-0.5">
                {selectedCrop.npk_ratio || '120:60:40 kg/ha'}
              </p>
            </div>
          </div>

          {/* Growth Stages Timeline */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-leaf-600" />
              <span>{t('advisoryPage.lifecycle')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {selectedCrop.growth_stages?.map((stage, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs relative"
                >
                  <div className="w-7 h-7 rounded-xl bg-leaf-100 text-leaf-800 flex items-center justify-center text-xs font-bold mb-2">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-bold text-slate-800">{stage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Soil & Nutrient Schedules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Soil Requirements */}
            <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sprout size={16} className="text-amber-700" />
                <span>{t('advisoryPage.soilRequirements')}</span>
              </h3>
              <p className="text-sm text-amber-900 leading-relaxed font-medium">
                {selectedCrop.soil_type || 'Well drained loamy fertile soil with pH 6.0 - 7.5.'}
              </p>
            </div>

            {/* Fertilizer Application */}
            <div className="bg-cyan-50/80 rounded-2xl p-5 border border-cyan-200">
              <h3 className="text-sm font-bold text-cyan-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FlaskConical size={16} className="text-cyan-700" />
                <span>{t('advisoryPage.fertilizerSchedule')}</span>
              </h3>
              <p className="text-sm text-cyan-900 leading-relaxed font-medium">
                {selectedCrop.fertilizer}
              </p>
            </div>
          </div>

          {/* Key Pest & Disease Risk */}
          <div className="bg-rose-50/80 rounded-2xl p-5 border border-rose-200">
            <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-700" />
              <span>{t('advisoryPage.keyRisks')}</span>
            </h3>
            <p className="text-base font-bold text-rose-800 mb-1">
              {getDiseaseName(selectedCrop)}
            </p>
            <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-medium mb-3">
              {selectedCrop.symptoms}
            </p>
            <div className="bg-white/80 p-3 rounded-xl text-xs font-semibold text-rose-950">
              <span className="font-bold">Recommended Organic Care: </span>
              {selectedCrop.organic_remedies}
            </div>
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
