import { Link } from 'react-router-dom';
import { Bug, Microscope, AlertTriangle, Sprout, FlaskConical, CloudSun, Mic, ScanLine, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CARDS = [
  { to: '/pest', icon: Bug, key: 'cards.pest' },
  { to: '/result', icon: Microscope, key: 'cards.disease' },
  { to: '/alerts', icon: AlertTriangle, key: 'cards.alerts' },
  { to: '/advisory', icon: Sprout, key: 'cards.advisory' },
  { to: '/fertilizer', icon: FlaskConical, key: 'cards.fertilizer' },
  { to: '/weather', icon: CloudSun, key: 'cards.weather' },
  { to: '/voice', icon: Mic, key: 'cards.voice' },
  { to: '/soil', icon: ScanLine, key: 'cards.soil' },
  { to: '/ask', icon: HelpCircle, key: 'cards.ask' },
];

export default function FeatureCards() {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-4xl mx-auto px-4">
      {CARDS.map(({ to, icon: Icon, key }) => (
        <Link
          key={to}
          to={to}
          className="bg-white rounded-xl shadow p-5 flex flex-col items-center gap-2 text-center hover:shadow-md transition"
        >
          <Icon size={28} className="text-leaf-500" />
          <span className="text-sm font-medium text-leaf-600">{t(key)}</span>
        </Link>
      ))}
    </div>
  );
}
