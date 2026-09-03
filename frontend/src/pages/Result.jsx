import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Volume2, VolumeX, ShieldCheck, AlertTriangle, Sparkles,
  Sprout, Leaf, FlaskConical, ArrowLeft, RotateCcw, Share2, Printer
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Disclaimer from '../components/Disclaimer.jsx';

export default function Result() {
  const { t, i18n } = useTranslation();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('remedies');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fallback default crop diagnosis if directly navigated
  const defaultData = {
    crop: 'Tomato',
    crop_te: 'టమోటా',
    crop_hi: 'टमाटर',
    disease: 'Early Blight',
    disease_te: 'ముందస్తు తెగులు (ఎర్లీ బ్లైట్)',
    disease_hi: 'अगेती झुलसा',
    severity: 'Moderate',
    confidence: 94,
    symptoms: 'Dark brown to black concentric rings on lower leaves, resembling a bullseye. Yellowing halos around spots, stem lesions, and fruit rot near the stem end.',
    causes: 'Fungal pathogen (Alternaria solani), favored by warm temperatures (24-29°C) and alternating wet and dry weather with high humidity.',
    organic_remedies: 'Spray Neem oil (5ml/L) or Trichoderma viride (10g/L). Remove and bury infected bottom leaves. Apply copper oxychloride bio-formulation.',
    chemical_remedies: 'Spray Mancozeb 75% WP @ 2g/L or Chlorothalonil 75% WP @ 2g/L or Azoxystrobin 23% SC @ 1ml/L at 10-day intervals.',
    precautions: 'Practice 3-year crop rotation; avoid overhead sprinkler irrigation; maintain 60cm plant spacing for adequate airflow; stake plants to keep leaves off soil.',
    suggestions: 'Apply organic mulch (straw/plastic) to prevent soil splash during rain. Monitor lower foliage weekly.',
    soil_type: 'Well-drained sandy loam or clay loam, pH 6.0 - 6.8',
    fertilizer: 'Apply FYM 25 t/ha at field prep. Basal: 50% N, 100% P & K. Top-dress remaining 50% N in two splits at 30 and 50 days after transplanting.',
    audioText: {
      en: 'Tomato Early Blight identified with 94 percent confidence. Apply organic Neem oil at 5ml per liter or Mancozeb 2g per liter. Avoid overhead irrigation.',
      te: 'టమోటా ముందస్తు తెగులు 94 శాతం ఖచ్చితత్వంతో గుర్తించబడింది. వేపనూనె 5 మి.లీ లేదా మాంకోజెబ్ 2 గ్రాములు లీటరు నీటికి కలిపి పిచికారీ చేయండి.',
      hi: 'टमाटर का अगेती झुलसा रोग 94 प्रतिशत सटीकता के साथ पहचाना गया। रोकथाम के लिए नीम तेल 5 मिली या मैंकोजेब 2 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।'
    }
  };

  const data = state || defaultData;

  const getCropName = () => {
    if (i18n.language === 'te' && data.crop_te) return data.crop_te;
    if (i18n.language === 'hi' && data.crop_hi) return data.crop_hi;
    return data.crop;
  };

  const getDiseaseName = () => {
    if (i18n.language === 'te' && data.disease_te) return data.disease_te;
    if (i18n.language === 'hi' && data.disease_hi) return data.disease_hi;
    return data.disease;
  };

  const getAudioText = () => {
    if (data.audioText) {
      if (i18n.language === 'te' && data.audioText.te) return data.audioText.te;
      if (i18n.language === 'hi' && data.audioText.hi) return data.audioText.hi;
      if (data.audioText.en) return data.audioText.en;
    }
    return `${getCropName()}. ${getDiseaseName()}. ${data.symptoms}. Remedies: ${data.organic_remedies || data.remedies}`;
  };

  const handleListen = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(getAudioText());
    utterance.lang = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-leaf-800 hover:text-leaf-900 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-leaf-200"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-slate-200 hover:bg-slate-50"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-leaf-700 bg-leaf-100 hover:bg-leaf-200 px-3 py-1.5 rounded-xl"
          >
            <RotateCcw size={14} />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Main Diagnostic Summary Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-leaf-500 via-amber-400 to-rose-500" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-leaf-100 text-leaf-800 text-xs font-bold flex items-center gap-1">
                <ShieldCheck size={14} className="text-leaf-600" />
                <span>{t('result.title')}</span>
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  data.severity === 'High'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                Severity: {data.severity || 'Moderate'}
              </span>
            </div>

            <div className="pt-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                {t('result.crop')}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {getCropName()}
              </h1>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                {t('result.disease')}
              </p>
              <p className="text-lg sm:text-xl font-bold text-rose-700">
                {getDiseaseName()}
              </p>
            </div>
          </div>

          {/* Right Metrics: Confidence Gauge & Voice Button */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="text-left md:text-right">
              <p className="text-xs text-slate-500 font-semibold">{t('result.confidence')}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-leaf-700">
                  {data.confidence || 92}%
                </span>
                <span className="text-xs text-leaf-600 font-bold">Accuracy</span>
              </div>
            </div>

            {/* Listen Audio Button */}
            <button
              onClick={handleListen}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition transform active:scale-95 ${
                isSpeaking
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-leaf-600 hover:bg-leaf-700 text-white shadow-leaf-600/20'
              }`}
            >
              {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span>{isSpeaking ? t('result.stopListen') : t('result.listen')}</span>
            </button>
          </div>
        </div>

        {/* Optional preview thumbnail if user uploaded an image */}
        {data.imagePreview && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-4">
            <img
              src={data.imagePreview}
              alt="Diagnosed Crop"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-leaf-300 shadow-sm"
            />
            <div>
              <p className="text-xs font-bold text-slate-700">Scanned Leaf Sample</p>
              <p className="text-xs text-slate-500">Processed through Kisan Mitra Vision Analyzer</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'remedies', labelKey: 'result.tabs.remedies', icon: Leaf },
          { id: 'symptoms', labelKey: 'result.tabs.symptoms', icon: AlertTriangle },
          { id: 'precautions', labelKey: 'result.tabs.precautions', icon: ShieldCheck },
          { id: 'fertilizer', labelKey: 'result.tabs.fertilizer', icon: FlaskConical },
        ].map(({ id, labelKey, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition ${
                isActive
                  ? 'bg-leaf-700 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-leaf-50 hover:text-leaf-800 border border-slate-200/80'
              }`}
            >
              <Icon size={16} />
              <span>{t(labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Remedies & Control */}
      {activeTab === 'remedies' && (
        <div className="space-y-4 animate-fade-in">
          {/* Organic Remedies */}
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                🌱
              </div>
              <h3 className="font-bold text-base text-emerald-950">
                {t('result.organic')}
              </h3>
            </div>
            <p className="text-sm text-emerald-900 leading-relaxed font-medium">
              {data.organic_remedies || data.remedies}
            </p>
          </div>

          {/* Chemical Remedies */}
          {data.chemical_remedies && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center font-bold">
                  🧪
                </div>
                <h3 className="font-bold text-base text-amber-950">
                  {t('result.chemical')}
                </h3>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed font-medium">
                {data.chemical_remedies}
              </p>
            </div>
          )}

          {/* Quick Fertilizer Link */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FlaskConical size={24} className="text-cyan-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">Calculate Recovery Fertilizer Doses</p>
                <p className="text-xs text-slate-500">Compute Urea, DAP, and MOP for your acreage</p>
              </div>
            </div>
            <Link
              to="/fertilizer"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-sm"
            >
              Open Calculator
            </Link>
          </div>
        </div>
      )}

      {/* Tab 2: Symptoms & Causes */}
      {activeTab === 'symptoms' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <span>{t('result.symptoms')}</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {data.symptoms}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-leaf-600" />
              <span>{t('result.causes')}</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {data.causes}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Precautions */}
      {activeTab === 'precautions' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              <span>{t('result.precautions')}</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {data.precautions}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
              <Sprout size={18} className="text-leaf-600" />
              <span>{t('result.suggestions')}</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {data.suggestions}
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Soil & Fertilizer */}
      {activeTab === 'fertilizer' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
              <FlaskConical size={18} className="text-cyan-600" />
              <span>{t('result.fertilizer')}</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {data.fertilizer}
            </p>
          </div>

          {data.soil_type && (
            <div className="glass-card rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
                <Sprout size={18} className="text-amber-700" />
                <span>{t('result.soil')}</span>
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {data.soil_type}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
}
