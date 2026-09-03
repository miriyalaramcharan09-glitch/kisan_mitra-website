import { useState, useEffect } from 'react';
import { FlaskConical, Calculator, Sparkles, CheckCircle2, Leaf, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Disclaimer from '../components/Disclaimer.jsx';

export default function Fertilizer() {
  const { t, i18n } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState(1);
  const [area, setArea] = useState(2);
  const [unit, setUnit] = useState('acres');
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/crops')
      .then((res) => res.json())
      .then((data) => {
        setCrops(data.crops || []);
        if (data.crops && data.crops.length > 0) {
          setSelectedCropId(data.crops[0].id);
        }
      })
      .catch((err) => console.error('Crops fetch failed:', err));
  }, []);

  const getCropName = (c) => {
    if (!c) return '';
    if (i18n.language === 'te' && c.name_te) return c.name_te;
    if (i18n.language === 'hi' && c.name_hi) return c.name_hi;
    return c.name;
  };

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/crops/calculate-fertilizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropId: Number(selectedCropId), area: Number(area), unit }),
      });
      const data = await res.json();
      setCalculation(data);
    } catch (err) {
      console.error('Fertilizer calculation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial calculation when crops load
  useEffect(() => {
    if (crops.length > 0) {
      handleCalculate();
    }
  }, [crops, selectedCropId, area, unit]);

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100 text-cyan-900 text-xs font-semibold">
          <FlaskConical size={14} className="text-cyan-700" />
          <span>Precision Soil Nutrient Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          {t('fertilizerPage.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          {t('fertilizerPage.subtitle')}
        </p>
      </div>

      {/* Input Parameters Box */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-md">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('fertilizerPage.selectCrop')}
            </label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-cyan-500 shadow-2xs"
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {getCropName(c)}
                </option>
              ))}
            </select>
          </div>

          {/* Farm Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('fertilizerPage.farmArea')}
            </label>
            <div className="flex items-center">
              <input
                type="number"
                min="0.25"
                step="0.25"
                value={area}
                onChange={(e) => setArea(parseFloat(e.target.value) || 1)}
                className="w-full bg-white border border-r-0 border-slate-300 rounded-l-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-cyan-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="bg-slate-100 border border-slate-300 rounded-r-2xl px-3 py-3 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="acres">{t('fertilizerPage.acres')}</option>
                <option value="hectares">{t('fertilizerPage.hectares')}</option>
              </select>
            </div>
          </div>

          {/* Calculate Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Calculator size={18} />
              <span>{t('fertilizerPage.calculate')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Calculated Results */}
      {calculation && (
        <div className="space-y-6 animate-fade-in">
          {/* Pure Nutrient Requirement Metrics */}
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-600" />
              <span>{t('fertilizerPage.npkTitle')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-emerald-800 uppercase">Nitrogen (N)</p>
                <p className="text-2xl font-extrabold text-emerald-950 mt-1">
                  {calculation.npkRequirement.nitrogen}
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">For vigorous foliage and tillering</p>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <p className="text-xs font-bold text-amber-800 uppercase">Phosphorus (P₂O₅)</p>
                <p className="text-2xl font-extrabold text-amber-950 mt-1">
                  {calculation.npkRequirement.phosphorus}
                </p>
                <p className="text-[11px] text-amber-700 mt-1">For root development & early vigor</p>
              </div>

              <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-200">
                <p className="text-xs font-bold text-cyan-800 uppercase">Potassium (K₂O)</p>
                <p className="text-2xl font-extrabold text-cyan-950 mt-1">
                  {calculation.npkRequirement.potassium}
                </p>
                <p className="text-[11px] text-cyan-700 mt-1">For grain weight & disease resistance</p>
              </div>
            </div>
          </div>

          {/* Commercial Fertilizer Bags Calculation */}
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FlaskConical size={16} className="text-blue-600" />
              <span>{t('fertilizerPage.commercialBags')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Urea */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Urea (46% N)
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">50kg bags</span>
                </div>
                <div className="pt-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {calculation.commercialFertilizers.urea.bags50kg}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1.5">Bags ({calculation.commercialFertilizers.urea.totalKg} kg)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  <Clock size={12} className="inline mr-1 text-slate-400" />
                  {calculation.commercialFertilizers.urea.applicationSchedule}
                </p>
              </div>

              {/* DAP */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    DAP (18:46:0)
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">50kg bags</span>
                </div>
                <div className="pt-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {calculation.commercialFertilizers.dap.bags50kg}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1.5">Bags ({calculation.commercialFertilizers.dap.totalKg} kg)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  <Clock size={12} className="inline mr-1 text-slate-400" />
                  {calculation.commercialFertilizers.dap.applicationSchedule}
                </p>
              </div>

              {/* MOP Potash */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded-full">
                    MOP Potash (60% K)
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">50kg bags</span>
                </div>
                <div className="pt-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {calculation.commercialFertilizers.mop.bags50kg}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1.5">Bags ({calculation.commercialFertilizers.mop.totalKg} kg)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  <Clock size={12} className="inline mr-1 text-slate-400" />
                  {calculation.commercialFertilizers.mop.applicationSchedule}
                </p>
              </div>
            </div>
          </div>

          {/* Organic & Biological Alternatives */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-leaf-50 rounded-3xl p-6 sm:p-8 border border-emerald-200">
            <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Leaf size={18} className="text-emerald-700" />
              <span>{t('fertilizerPage.organicTitle')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-900 uppercase">Farmyard Manure (FYM)</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {calculation.organicAlternatives.fym}
                </p>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-900 uppercase">Vermicompost</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {calculation.organicAlternatives.vermicompost}
                </p>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-900 uppercase">Neem Cake</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {calculation.organicAlternatives.neemCake}
                </p>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-900 uppercase">Jeevamrutham Liquid</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {calculation.organicAlternatives.jeevamrutham}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
