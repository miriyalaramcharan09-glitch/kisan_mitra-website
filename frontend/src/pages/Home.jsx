import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bug, Microscope, AlertTriangle, BookOpen, FlaskConical,
  CloudSun, Mic, ScanLine, HelpCircle, ArrowRight, ShieldAlert,
  Sparkles, Leaf, Sun, Droplets, Wind
} from 'lucide-react';
import SearchBar from '../components/SearchBar.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import Disclaimer from '../components/Disclaimer.jsx';

export default function Home() {
  const { t, i18n } = useTranslation();
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [topAlert, setTopAlert] = useState(null);

  useEffect(() => {
    // Fetch live weather summary
    fetch('/api/weather?city=hyderabad')
      .then((res) => res.json())
      .then((data) => setWeatherSummary(data))
      .catch((err) => console.warn('Home weather fetch:', err));

    // Fetch top active alert
    fetch('/api/alerts?severity=High')
      .then((res) => res.json())
      .then((data) => {
        if (data.alerts && data.alerts.length > 0) {
          setTopAlert(data.alerts[0]);
        }
      })
      .catch((err) => console.warn('Home alert fetch:', err));
  }, []);

  const getAlertTitle = (alert) => {
    if (!alert) return '';
    if (i18n.language === 'te' && alert.title_te) return alert.title_te;
    if (i18n.language === 'hi' && alert.title_hi) return alert.title_hi;
    return alert.title;
  };

  const CARDS = [
    {
      to: '/result',
      icon: Microscope,
      titleKey: 'cards.disease',
      descKey: 'cards.diseaseDesc',
      badge: 'AI Vision',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-700'
    },
    {
      to: '/pest',
      icon: Bug,
      titleKey: 'cards.pest',
      descKey: 'cards.pestDesc',
      badge: 'Bio-Control',
      color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-700'
    },
    {
      to: '/alerts',
      icon: AlertTriangle,
      titleKey: 'cards.alerts',
      descKey: 'cards.alertsDesc',
      badge: 'Live Warning',
      color: 'from-rose-500/10 to-red-500/10 border-rose-200 text-rose-700'
    },
    {
      to: '/fertilizer',
      icon: FlaskConical,
      titleKey: 'cards.fertilizer',
      descKey: 'cards.fertilizerDesc',
      badge: 'Calculator',
      color: 'from-cyan-500/10 to-blue-500/10 border-cyan-200 text-cyan-700'
    },
    {
      to: '/weather',
      icon: CloudSun,
      titleKey: 'cards.weather',
      descKey: 'cards.weatherDesc',
      badge: '7-Day Forecast',
      color: 'from-sky-500/10 to-indigo-500/10 border-sky-200 text-sky-700'
    },
    {
      to: '/advisory',
      icon: BookOpen,
      titleKey: 'cards.advisory',
      descKey: 'cards.advisoryDesc',
      badge: '16 Crops',
      color: 'from-leaf-500/10 to-green-500/10 border-leaf-200 text-leaf-700'
    },
    {
      to: '/soil',
      icon: ScanLine,
      titleKey: 'cards.soil',
      descKey: 'cards.soilDesc',
      badge: 'pH & NPK',
      color: 'from-amber-700/10 to-yellow-600/10 border-amber-300 text-amber-800'
    },
    {
      to: '/voice',
      icon: Mic,
      titleKey: 'cards.voice',
      descKey: 'cards.voiceDesc',
      badge: 'Telugu / Hindi / EN',
      color: 'from-purple-500/10 to-fuchsia-500/10 border-purple-200 text-purple-700'
    },
    {
      to: '/ask',
      icon: HelpCircle,
      titleKey: 'cards.ask',
      descKey: 'cards.askDesc',
      badge: '24/7 Q&A',
      color: 'from-teal-500/10 to-emerald-500/10 border-teal-200 text-teal-700'
    },
  ];

  return (
    <div className="py-8 sm:py-12 space-y-10 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-leaf-100 text-leaf-800 border border-leaf-200 text-xs font-semibold shadow-sm">
          <Leaf size={14} className="text-leaf-600" />
          <span>Smart AI Agricultural Assistant</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading leading-tight">
          {t('appName')}
          <span className="block text-xl sm:text-2xl font-semibold text-leaf-700 mt-2">
            {t('tagline')}
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
          {t('description')}
        </p>
      </section>

      {/* Top Urgent Alert Banner (if active) */}
      {topAlert && (
        <section className="max-w-4xl mx-auto">
          <Link
            to="/alerts"
            className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <ShieldAlert size={22} className="text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full mr-2">
                  High Alert • {topAlert.crop}
                </span>
                <p className="text-sm sm:text-base font-bold mt-0.5">
                  {getAlertTitle(topAlert)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold bg-white text-rose-700 px-3 py-1.5 rounded-xl shrink-0 group-hover:bg-rose-50 transition shadow-sm">
              <span>View Advisory</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </section>
      )}

      {/* Live Agri-Weather Strip */}
      {weatherSummary && (
        <section className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-leaf-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Sun size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">{weatherSummary.location}</p>
                <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>{weatherSummary.current?.temp}°C</span>
                  <span className="text-xs font-normal text-slate-500">
                    {weatherSummary.current?.condition}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1">
                <Droplets size={14} className="text-blue-500" />
                <span>{weatherSummary.current?.humidity}% Humidity</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind size={14} className="text-teal-500" />
                <span>{weatherSummary.current?.windSpeed} km/h</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${weatherSummary.advisory?.spraying?.badge}`}>
                {weatherSummary.advisory?.spraying?.status}
              </span>
              <Link
                to="/weather"
                className="text-xs font-bold text-leaf-700 hover:text-leaf-800 hover:underline flex items-center gap-0.5"
              >
                <span>Full Forecast</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Search Bar Section */}
      <section className="px-2">
        <SearchBar />
      </section>

      {/* Image Upload & Detection Scanner */}
      <section className="px-2">
        <ImageUpload />
      </section>

      {/* 9 Feature Hub Cards Grid */}
      <section className="space-y-4 pt-4">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Smart Farming Toolkit
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete suite of agricultural diagnosis, planning, and advisory tools
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto pt-2">
          {CARDS.map(({ to, icon: Icon, titleKey, descKey, badge, color }) => (
            <Link
              key={to}
              to={to}
              className={`glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between border transition group bg-gradient-to-br ${color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition">
                    <Icon size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200/80 text-slate-700 shadow-2xs">
                    {badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-leaf-700 transition">
                  {t(titleKey)}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {t(descKey)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold group-hover:translate-x-1 transition">
                <span>Explore Tool</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Voice Assistant Banner */}
      <section className="max-w-4xl mx-auto">
        <div className="rounded-3xl p-6 bg-gradient-to-r from-leaf-800 via-leaf-700 to-leaf-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Mic size={28} className="text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t('cards.voice')}</h3>
              <p className="text-xs sm:text-sm text-leaf-100 mt-0.5">
                Speak directly in Telugu, Hindi, or English for hands-free advice in your field.
              </p>
            </div>
          </div>
          <Link
            to="/voice"
            className="px-6 py-3 rounded-xl bg-white text-leaf-900 font-bold text-sm shadow-md hover:bg-leaf-50 transition shrink-0 flex items-center gap-2"
          >
            <span>Start Voice Assistant</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Agricultural Disclaimer */}
      <Disclaimer />
    </div>
  );
}
