import { useTranslation } from 'react-i18next';

// TODO: replace each usage of this component (see App.jsx) with a real feature
// page per BUILD_PLAN.md Phase 1/4.
export default function PlaceholderPage({ titleKey }) {
  const { t } = useTranslation();
  return (
    <div className="py-20 text-center text-earth-500">
      <h1 className="text-2xl font-bold text-leaf-600 mb-2">{t(titleKey)}</h1>
      <p>🚧 Coming soon — see BUILD_PLAN.md</p>
    </div>
  );
}
