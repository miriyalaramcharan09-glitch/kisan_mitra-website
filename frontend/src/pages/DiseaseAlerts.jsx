import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CloudRain, MapPin, Calendar, CheckCircle2, Filter, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Disclaimer from '../components/Disclaimer.jsx';

export default function DiseaseAlerts() {
  const { t, i18n } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alerts')
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data.alerts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Alerts fetch failed:', err);
        setLoading(false);
      });
  }, []);

  const getAlertTitle = (a) => {
    if (i18n.language === 'te' && a.title_te) return a.title_te;
    if (i18n.language === 'hi' && a.title_hi) return a.title_hi;
    return a.title;
  };

  const getAlertMessage = (a) => {
    if (i18n.language === 'te' && a.message_te) return a.message_te;
    if (i18n.language === 'hi' && a.message_hi) return a.message_hi;
    return a.message;
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'All') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
          <ShieldAlert size={14} className="text-rose-600 animate-pulse" />
          <span>Early Outbreak Warning System</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          {t('alertsPage.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          {t('alertsPage.subtitle')}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-600">{t('alertsPage.filterSeverity')}</span>
        </div>
        <div className="flex gap-2">
          {['All', 'High', 'Moderate'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                severityFilter === sev
                  ? sev === 'High'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : sev === 'Moderate'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-leaf-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev === 'All' ? t('alertsPage.all') : sev === 'High' ? t('alertsPage.high') : t('alertsPage.moderate')}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Cards Stack */}
      <div className="space-y-5">
        {filteredAlerts.map((a) => {
          const isHigh = a.severity === 'High';
          return (
            <div
              key={a.id}
              className={`glass-card rounded-3xl p-6 sm:p-7 border transition shadow-md relative overflow-hidden ${
                isHigh ? 'border-rose-300 bg-rose-50/20' : 'border-amber-300 bg-amber-50/20'
              }`}
            >
              {/* Accent Left Bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-2 ${
                  isHigh ? 'bg-rose-600' : 'bg-amber-500'
                }`}
              />

              <div className="space-y-4">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isHigh ? '🚨 High Alert' : '⚠️ Warning Advisory'}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                      🌾 {a.crop}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Calendar size={14} />
                    <span>{a.date || 'Active Today'}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                    {getAlertTitle(a)}
                  </h3>
                  <p className="text-sm text-slate-700 mt-2 leading-relaxed font-medium">
                    {getAlertMessage(a)}
                  </p>
                </div>

                {/* Weather Trigger & Region Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/90 rounded-2xl p-3.5 border border-slate-200/80 flex items-start gap-2.5">
                    <CloudRain size={18} className="text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('alertsPage.weatherTrigger')}
                      </p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {a.trigger_weather}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/90 rounded-2xl p-3.5 border border-slate-200/80 flex items-start gap-2.5">
                    <MapPin size={18} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('alertsPage.affectedRegion')}
                      </p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {a.region}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Immediate Emergency Action */}
                <div className="bg-gradient-to-r from-emerald-50 to-leaf-50 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span>{t('alertsPage.recommendedAction')}</span>
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-900 leading-relaxed">
                    {a.action}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Disclaimer />
    </div>
  );
}
