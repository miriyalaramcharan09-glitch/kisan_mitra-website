import { useState, useEffect } from 'react';
import { Bug, ShieldCheck, Sparkles, Filter, Search, ArrowRight, Leaf, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Disclaimer from '../components/Disclaimer.jsx';

export default function PestID() {
  const { t, i18n } = useTranslation();
  const [pests, setPests] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePest, setActivePest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pests')
      .then((res) => res.json())
      .then((data) => {
        setPests(data.pests || []);
        if (data.pests && data.pests.length > 0) {
          setActivePest(data.pests[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Pests fetch failed:', err);
        setLoading(false);
      });
  }, []);

  const getPestName = (p) => {
    if (!p) return '';
    if (i18n.language === 'te' && p.name_te) return p.name_te;
    if (i18n.language === 'hi' && p.name_hi) return p.name_hi;
    return p.name;
  };

  const cropFilters = ['All', 'Cotton', 'Chilli', 'Rice', 'Maize', 'Tomato', 'Brinjal', 'Pulses', 'Coconut'];

  const filteredPests = pests.filter((p) => {
    const matchesCrop =
      selectedCrop === 'All' ||
      (p.target_crops && p.target_crops.some((c) => c.toLowerCase().includes(selectedCrop.toLowerCase())));
    const matchesQuery =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.name_te && p.name_te.includes(searchQuery)) ||
      (p.name_hi && p.name_hi.includes(searchQuery)) ||
      (p.symptoms && p.symptoms.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCrop && matchesQuery;
  });

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
          <Bug size={14} className="text-amber-700" />
          <span>Integrated Pest Management (IPM)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          {t('pestPage.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          {t('pestPage.subtitle')}
        </p>
      </div>

      {/* Filters & Search */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Crop Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 mr-1 shrink-0 flex items-center gap-1">
            <Filter size={14} />
            {t('pestPage.filterByCrop')}
          </span>
          {cropFilters.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCrop === crop
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {crop === 'All' ? t('pestPage.allCrops') : crop}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pest or symptoms..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Pest Catalog & Details Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Pest List Sidebar */}
        <div className="lg:col-span-4 space-y-3 max-h-[700px] overflow-y-auto pr-1">
          {filteredPests.map((p) => {
            const isSelected = activePest?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setActivePest(p)}
                className={`p-4 rounded-2xl cursor-pointer transition border text-left group ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-400 shadow-md ring-2 ring-amber-300/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Bug size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition">
                        {getPestName(p)}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {p.target_crops?.join(', ')}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className={`text-slate-300 group-hover:text-amber-600 transition ${
                      isSelected ? 'text-amber-600 translate-x-1' : ''
                    }`}
                  />
                </div>
              </div>
            );
          })}

          {filteredPests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-4">
              <Bug size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-semibold">No pests match your filter</p>
            </div>
          )}
        </div>

        {/* Detailed Pest Inspector */}
        <div className="lg:col-span-8">
          {activePest ? (
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    {t('pestPage.identified')}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-2">
                    {getPestName(activePest)}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Bug size={24} />
                </div>
              </div>

              {/* Attacking Crops */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t('pestPage.targetCrops')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {activePest.target_crops?.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1 rounded-xl bg-leaf-100 text-leaf-900 font-semibold text-xs border border-leaf-200"
                    >
                      🌾 {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Identification Characteristics */}
              {activePest.identification && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>{t('pestPage.identification')}</span>
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {activePest.identification}
                  </p>
                </div>
              )}

              {/* Damage Symptoms */}
              <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldAlert size={16} className="text-rose-600" />
                  <span>Damage Symptoms on Crop</span>
                </h3>
                <p className="text-sm text-rose-950 leading-relaxed font-medium">
                  {activePest.symptoms}
                </p>
              </div>

              {/* Biological Control */}
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Leaf size={16} className="text-emerald-700" />
                  <span>{t('pestPage.biological')}</span>
                </h3>
                <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                  {activePest.biological_control}
                </p>
              </div>

              {/* Chemical Insecticides */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-amber-700" />
                  <span>{t('pestPage.chemical')}</span>
                </h3>
                <p className="text-sm text-amber-950 leading-relaxed font-medium">
                  {activePest.chemical_control}
                </p>
              </div>

              {/* Prevention Practices */}
              {activePest.prevention && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('pestPage.prevention')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {activePest.prevention}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <p className="text-slate-500 font-semibold">Select a pest from the left to view details</p>
            </div>
          )}
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
