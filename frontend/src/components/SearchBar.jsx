import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sprout, Bug, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setSuggestions(data.results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Search fetch failed:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    if (item.type === 'crop') {
      // Navigate to result with crop hint
      navigate('/result', { state: { cropHint: item.cropName, disease: item.disease } });
    } else if (item.type === 'pest') {
      navigate('/pest');
    } else if (item.type === 'alert') {
      navigate('/alerts');
    }
  };

  const getItemLabel = (item) => {
    if (i18n.language === 'te' && item.name_te) return item.name_te;
    if (i18n.language === 'hi' && item.name_hi) return item.name_hi;
    return item.name;
  };

  return (
    <div ref={dropdownRef} className="relative max-w-3xl mx-auto w-full">
      <div className="relative flex items-center bg-white rounded-2xl shadow-md border border-leaf-200/80 hover:border-leaf-400 focus-within:border-leaf-500 focus-within:ring-4 focus-within:ring-leaf-500/10 transition px-4 py-3.5">
        <Search size={22} className="text-leaf-600 shrink-0 mr-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={t('searchPlaceholder')}
          className="flex-1 outline-none text-slate-800 text-sm sm:text-base placeholder:text-slate-400 font-medium bg-transparent"
        />
        {loading && <Loader2 size={18} className="text-leaf-500 animate-spin mr-2" />}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-40 bg-white w-full rounded-2xl shadow-xl border border-leaf-200 mt-2 overflow-hidden animate-fade-in max-h-80 overflow-y-auto">
          <div className="px-4 py-2 bg-leaf-50/80 border-b border-leaf-100 text-[11px] font-semibold text-leaf-800 uppercase tracking-wider flex justify-between items-center">
            <span>Matching Agriculture Results</span>
            <span className="text-leaf-600 lowercase font-normal">{suggestions.length} found</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {suggestions.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className="px-4 py-3 hover:bg-leaf-50/80 cursor-pointer flex items-center justify-between group transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'crop'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.type === 'pest'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.type === 'crop' && <Sprout size={18} />}
                    {item.type === 'pest' && <Bug size={18} />}
                    {item.type === 'alert' && <AlertTriangle size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-leaf-700 transition">
                      {getItemLabel(item)}
                    </p>
                    <span className="text-xs text-slate-400 capitalize">
                      {item.type === 'crop' ? t('searchType.crop') : item.type === 'pest' ? t('searchType.pest') : t('searchType.alert')}
                    </span>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-slate-300 group-hover:text-leaf-600 group-hover:translate-x-1 transition"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
