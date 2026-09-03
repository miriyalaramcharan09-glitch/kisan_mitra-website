import { useState, useEffect } from 'react';
import {
  CloudSun, Sun, Droplets, Wind, CloudRain, AlertTriangle,
  CheckCircle2, Sparkles, MapPin, Calendar, ArrowRight, ShieldAlert
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Disclaimer from '../components/Disclaimer.jsx';

const REGIONS = [
  { key: 'hyderabad', label: 'Hyderabad (Telangana)' },
  { key: 'warangal', label: 'Warangal (Telangana)' },
  { key: 'guntur', label: 'Guntur (Andhra Pradesh)' },
  { key: 'vijayawada', label: 'Vijayawada (Andhra Pradesh)' },
  { key: 'kurnool', label: 'Kurnool (Rayalaseema)' },
  { key: 'bengaluru', label: 'Bengaluru (Karnataka)' },
  { key: 'pune', label: 'Pune (Maharashtra)' },
  { key: 'delhi', label: 'Delhi NCR' },
  { key: 'lucknow', label: 'Lucknow (Uttar Pradesh)' },
  { key: 'patna', label: 'Patna (Bihar)' },
];

export default function Weather() {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState('hyderabad');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = (cityKey) => {
    setLoading(true);
    fetch(`/api/weather?city=${cityKey}`)
      .then((res) => res.json())
      .then((data) => {
        setWeatherData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Weather fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-900 text-xs font-semibold">
          <CloudSun size={14} className="text-sky-700" />
          <span>Real-Time Farm Meteorological Advisory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          {t('weatherPage.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          {t('weatherPage.subtitle')}
        </p>
      </div>

      {/* Region Selector Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs sm:text-sm">
          <MapPin size={18} className="text-rose-500" />
          <span>{t('weatherPage.selectLocation')}</span>
        </div>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full sm:w-72 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-sky-500 shadow-2xs"
        >
          {REGIONS.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {weatherData && (
        <div className="space-y-6 animate-fade-in">
          {/* Current Live Weather Hero Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-white via-sky-50/30 to-leaf-50/40">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-teal-400 to-leaf-500" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  {weatherData.location}
                </span>
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-4xl sm:text-6xl font-extrabold text-slate-900 font-heading">
                    {weatherData.current.temp}°C
                  </span>
                  <span className="text-base sm:text-xl font-bold text-slate-600">
                    {weatherData.current.condition}
                  </span>
                </div>
              </div>

              {/* Metric Chips */}
              <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                <div className="bg-white/90 rounded-2xl p-4 border border-slate-200/80 text-center shadow-2xs">
                  <Droplets size={20} className="text-blue-500 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-slate-400 uppercase">{t('weatherPage.humidity')}</p>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">{weatherData.current.humidity}%</p>
                </div>

                <div className="bg-white/90 rounded-2xl p-4 border border-slate-200/80 text-center shadow-2xs">
                  <Wind size={20} className="text-teal-500 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-slate-400 uppercase">{t('weatherPage.wind')}</p>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">{weatherData.current.windSpeed} <span className="text-xs font-normal">km/h</span></p>
                </div>

                <div className="bg-white/90 rounded-2xl p-4 border border-slate-200/80 text-center shadow-2xs">
                  <CloudRain size={20} className="text-indigo-500 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-slate-400 uppercase">{t('weatherPage.rainChance')}</p>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">{weatherData.current.rainProb}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Agricultural Advisories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Spraying Suitability */}
            <div className="glass-card rounded-3xl p-6 border shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('weatherPage.sprayIndex')}
                  </p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${weatherData.advisory.spraying.badge}`}>
                    {weatherData.advisory.spraying.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {weatherData.advisory.spraying.advice}
                </p>
              </div>
            </div>

            {/* Irrigation Guidance */}
            <div className="glass-card rounded-3xl p-6 border shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('weatherPage.irrigationAdvice')}
                  </p>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    {weatherData.advisory.irrigation.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {weatherData.advisory.irrigation.advice}
                </p>
              </div>
            </div>

            {/* Disease Risk Index */}
            <div className="glass-card rounded-3xl p-6 border shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('weatherPage.diseaseRisk')}
                  </p>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {weatherData.advisory.diseaseRisk.level}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {weatherData.advisory.diseaseRisk.cause}
                </p>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast Grid */}
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-sky-600" />
              <span>{t('weatherPage.forecast7Day')}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {weatherData.forecast?.map((day, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 text-center shadow-2xs space-y-1.5"
                >
                  <p className="text-xs font-bold text-slate-800">{day.dayName}</p>
                  <p className="text-sm font-bold text-slate-900">{day.condition}</p>
                  <div className="flex items-center justify-center gap-2 text-xs pt-1">
                    <span className="font-bold text-slate-900">{day.maxTemp}°</span>
                    <span className="text-slate-400">{day.minTemp}°</span>
                  </div>
                  <p className="text-[11px] font-semibold text-blue-600">
                    💧 {day.rainProb}% rain
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
