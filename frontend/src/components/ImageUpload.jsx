import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Upload, Camera, Loader2, Sparkles, X, RefreshCw, CheckCircle2,
  Image as ImageIcon, AlertCircle, Search, Key, HelpCircle, Check, Info, Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Common Agricultural Crops for high-accuracy matching
const CROP_OPTIONS = [
  { value: '', label: '🌱 Auto-Detect Crop (AI Vision)', label_te: '🌱 ఆటో డిటెక్ట్ పంట', label_hi: '🌱 स्वतः फसल पहचानें' },
  { value: 'Tomato', label: '🍅 Tomato (టమోటా / टमाटर)', label_te: '🍅 టమోటా', label_hi: '🍅 टमाटर' },
  { value: 'Rice', label: '🌾 Rice / Paddy (వరి / धान)', label_te: '🌾 వరి', label_hi: '🌾 धान' },
  { value: 'Cotton', label: '☁️ Cotton (ప్రత్తి / कपास)', label_te: '☁️ ప్రత్తి', label_hi: '☁️ कपास' },
  { value: 'Chilli', label: '🌶️ Chilli (మిర్చి / मिर्च)', label_te: '🌶️ మిర్చి', label_hi: '🌶️ मिर्च' },
  { value: 'Maize', label: '🌽 Maize / Corn (మొక్కజొన్న / मक्का)', label_te: '🌽 మొక్కజొన్న', label_hi: '🌽 मक्का' },
  { value: 'Groundnut', label: '🥜 Groundnut (వేరుశనగ / मूंगफली)', label_te: '🥜 వేరుశనగ', label_hi: '🥜 मूंगफली' },
  { value: 'Sugarcane', label: '🎋 Sugarcane (చెరకు / गन्ना)', label_te: '🎋 చెరకు', label_hi: '🎋 गन्ना' },
  { value: 'Banana', label: '🍌 Banana (అరటి / केला)', label_te: '🍌 అరటి', label_hi: '🍌 केला' },
  { value: 'Mango', label: '🥭 Mango (మామిడి / आम)', label_te: '🥭 మామిడి', label_hi: '🥭 आम' },
  { value: 'Potato', label: '🥔 Potato (బంగాళాదుంప / आलू)', label_te: '🥔 బంగాళాదుంప', label_hi: '🥔 आलू' },
  { value: 'Wheat', label: '🌾 Wheat (గోధుమ / गेहूँ)', label_te: '🌾 గోధుమ', label_hi: '🌾 गेहूँ' },
  { value: 'Soybean', label: '🌱 Soybean (సోయాబీన్ / सोयाबीन)', label_te: '🌱 సోయాబీన్', label_hi: '🌱 सोयाबीन' },
  { value: 'Onion', label: '🧅 Onion (ఉల్లిపాయ / प्याज)', label_te: '🧅 ఉల్లిపాయ', label_hi: '🧅 प्याज' },
];

// Quick symptom tags
const SYMPTOM_TAGS = [
  { id: 'spots', label: '🍂 Brown Spots', value: 'brown necrotic circular spots with yellow halo' },
  { id: 'yellowing', label: '🟡 Yellowing', value: 'foliar chlorosis and yellowing leaves' },
  { id: 'mildew', label: '⚪ White Powdery', value: 'white powdery fungal coating on leaf surface' },
  { id: 'curling', label: '🌀 Leaf Curling', value: 'upward or downward leaf curling and puckering' },
  { id: 'wilting', label: '🥀 Wilting', value: 'drooping dry withered leaves and stem collapse' },
  { id: 'rust', label: '🟠 Rust / Red', value: 'reddish-brown rust pustules on leaf underside' },
  { id: 'pests', label: '🐛 Holes / Bites', value: 'irregular holes chewed leaves and insect larvae' },
  { id: 'healthy', label: '✨ Healthy', value: 'healthy green leaf surface checkup' },
];

// Preset test samples
const SAMPLES = [
  { id: 'tomato', cropHint: 'Tomato', labelKey: 'samples.tomato', icon: '🍅', color: 'bg-rose-50 border-rose-200 text-rose-700', symptoms: 'Dark brown concentric bullseye rings with yellow halos on tomato foliage' },
  { id: 'rice', cropHint: 'Rice (Paddy)', labelKey: 'samples.rice', icon: '🌾', color: 'bg-amber-50 border-amber-200 text-amber-700', symptoms: 'Spindle-shaped elliptical spots with grey centers on paddy leaves' },
  { id: 'cotton', cropHint: 'Cotton', labelKey: 'samples.cotton', icon: '☁️', color: 'bg-slate-50 border-slate-200 text-slate-700', symptoms: 'Angular water-soaked brown spots and bollworm holes on cotton leaves' },
  { id: 'chilli', cropHint: 'Chilli', labelKey: 'samples.chilli', icon: '🌶️', color: 'bg-red-50 border-red-200 text-red-700', symptoms: 'Upward leaf curling and circular sunken dark spots on chilli plant' },
];

export default function ImageUpload() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedSample, setSelectedSample] = useState(null);
  const [activeTags, setActiveTags] = useState([]);
  const [symptomHint, setSymptomHint] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Gemini API Key Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('kisan_gemini_api_key') || '');
  const [savedKey, setSavedKey] = useState(() => localStorage.getItem('kisan_gemini_api_key') || '');

  // Live Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState('');

  // Process and resize uploaded file
  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    setError('');
    setSelectedSample(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1024;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setPreview(canvas.toDataURL('image/jpeg', 0.90));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Toggle symptom tag
  const toggleSymptomTag = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
    );
  };

  // Save or clear Gemini API key
  const handleSaveApiKey = () => {
    const cleanKey = apiKeyInput.trim();
    if (cleanKey) {
      localStorage.setItem('kisan_gemini_api_key', cleanKey);
      setSavedKey(cleanKey);
    } else {
      localStorage.removeItem('kisan_gemini_api_key');
      setSavedKey('');
    }
    setIsKeyModalOpen(false);
  };

  // Live Camera
  const openCamera = async () => {
    setCameraError('');
    setIsCameraOpen(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        setCameraStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } else {
        setCameraError('Camera access not supported on this device/browser.');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Could not access camera. Please allow camera permissions.');
    }
  };

  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPreview(canvas.toDataURL('image/jpeg', 0.90));
    setSelectedSample(null);
    closeCamera();
  };

  const toggleCameraFacing = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: nextMode } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.warn('Camera facing switch fallback:', err);
    }
  };

  // Select Sample
  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setSelectedCrop(sample.cropHint);
    setSymptomHint(sample.symptoms);
    setError('');

    // High quality canvas visual mockup
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#f0fdf4');
    gradient.addColorStop(1, '#dcfce7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);
    ctx.font = 'bold 76px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sample.icon, 300, 190);
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(t(sample.labelKey), 300, 250);
    ctx.fillStyle = '#4b5563';
    ctx.font = '14px sans-serif';
    ctx.fillText(sample.symptoms, 300, 285);
    setPreview(canvas.toDataURL('image/png'));
  };

  // Execute Diagnosis
  const handleAnalyze = async () => {
    setLoading(true);
    setError('');

    // Combine active symptom tags + free text
    const selectedTagTexts = SYMPTOM_TAGS
      .filter((t) => activeTags.includes(t.id))
      .map((t) => t.value)
      .join(', ');
    const combinedSymptoms = [selectedTagTexts, symptomHint.trim()].filter(Boolean).join('. ');

    try {
      const payload = {
        cropHint: selectedCrop || (selectedSample ? selectedSample.cropHint : ''),
        symptomHint: combinedSymptoms,
        imageBase64: preview,
        apiKey: savedKey || '',
      };

      const res = await fetch(`${API_BASE}/api/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(savedKey ? { 'x-gemini-api-key': savedKey } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Diagnosis server error (${res.status})`);
      }

      const data = await res.json();
      navigate('/result', { state: { ...data, imagePreview: preview } });
    } catch (err) {
      console.error('Plant diagnosis failed:', err);
      setError(
        err.message.includes('fetch')
          ? 'Cannot connect to backend server. Make sure it is running on port 4000.'
          : err.message || 'Diagnosis failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-card rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto text-center relative overflow-hidden shadow-xl"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Gradient Banner */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-leaf-400 via-leaf-600 to-amber-400" />

      {/* Header Badge & API Key Setting */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-leaf-100 text-leaf-800 text-xs font-semibold">
          <Sparkles size={14} className="text-leaf-600 animate-spin" />
          <span>{savedKey ? '⚡ Gemini 1.5 Flash Vision Active' : '🌿 Smart Agronomy Diagnostic Engine'}</span>
        </div>

        <button
          onClick={() => setIsKeyModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border ${
            savedKey
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
          }`}
          title="Configure Google Gemini Vision AI Key"
        >
          <Key size={13} className={savedKey ? 'text-emerald-600' : 'text-slate-500'} />
          <span>{savedKey ? 'Gemini Key Configured' : '⚡ Enable Gemini Vision AI'}</span>
        </button>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
        {t('uploadTitle')}
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
        {t('uploadSubtitle')}
      </p>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm text-left">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <p className="font-semibold">Analysis Failed</p>
            <p className="text-xs mt-0.5 text-rose-700">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-600"><X size={16} /></button>
        </div>
      )}

      {/* 1. Crop Selection Dropdown */}
      <div className="mb-4 text-left">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Select Crop / Plant (Optional - Helps Exact Diagnosis):
        </label>
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-leaf-500 shadow-xs"
        >
          {CROP_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Image Drop / Preview Area */}
      <div className="relative group mb-4">
        {preview ? (
          <div className="relative inline-block mx-auto max-w-full rounded-2xl overflow-hidden shadow-md border-2 border-leaf-400 bg-black/5">
            <img
              src={preview}
              alt="Crop Leaf Preview"
              className="max-h-60 sm:max-h-72 w-auto mx-auto object-contain rounded-2xl"
            />
            <button
              onClick={() => {
                setPreview(null);
                setSelectedSample(null);
                setError('');
              }}
              className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white p-1.5 rounded-full transition shadow"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl py-8 px-4 transition cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-500 group ${
              isDragging
                ? 'border-leaf-500 bg-leaf-50 scale-[1.01]'
                : 'border-leaf-300 hover:border-leaf-500 bg-leaf-50/50 hover:bg-leaf-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-leaf-600 transition border border-leaf-200 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
              <ImageIcon size={26} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {isDragging ? 'Drop your leaf photo here!' : 'Click to browse or drag & drop leaf photo'}
            </p>
            <p className="text-xs text-slate-400">Clear close-up photo of infected leaf or healthy foliage</p>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFile}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2.5 justify-center mb-5">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-leaf-100 hover:bg-leaf-200 text-leaf-800 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
        >
          <Upload size={16} className="text-leaf-700" />
          {t('uploadButton')}
        </button>

        <button
          onClick={openCamera}
          className="flex items-center gap-2 bg-leaf-700 hover:bg-leaf-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
        >
          <Camera size={16} />
          {t('cameraButton')}
        </button>
      </div>

      {/* 3. Visual Symptom Chips Picker */}
      <div className="mb-4 text-left">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Tap Visible Symptoms on Leaf:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SYMPTOM_TAGS.map((tag) => {
            const isActive = activeTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleSymptomTag(tag)}
                className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition border flex items-center gap-1 ${
                  isActive
                    ? 'bg-leaf-700 border-leaf-700 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isActive && <Check size={12} />}
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Free-form Symptom Description */}
      <div className="mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={symptomHint}
            onChange={(e) => setSymptomHint(e.target.value)}
            placeholder="Additional observations: e.g. lower leaves drying, concentric spots..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-leaf-400"
          />
        </div>
      </div>

      {/* Quick Test Preset Buttons */}
      <div className="mb-5 pt-3 border-t border-slate-100 text-left">
        <p className="text-xs font-semibold text-slate-600 mb-2">
          {t('sampleImagesTitle')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLES.map((s) => {
            const isSelected = selectedSample?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleSelectSample(s)}
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition text-left ${
                  isSelected
                    ? 'border-leaf-600 bg-leaf-100 text-leaf-900 ring-2 ring-leaf-500/20 shadow-xs'
                    : `${s.color} hover:shadow-xs`
                }`}
              >
                <span className="text-base">{s.icon}</span>
                <span className="truncate flex-1 font-semibold">{t(s.labelKey)}</span>
                {isSelected && <CheckCircle2 size={13} className="text-leaf-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!preview || loading}
        className="w-full bg-gradient-to-r from-leaf-600 via-leaf-700 to-leaf-800 hover:from-leaf-700 hover:to-leaf-900 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 px-6 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 transform active:scale-[0.99]"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Analyzing Leaf Features & Pathology...</span>
          </>
        ) : (
          <>
            <Sparkles size={20} className="text-amber-300" />
            <span>{t('analyzeButton')}</span>
          </>
        )}
      </button>

      {/* Gemini API Key Configuration Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-left relative animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Google Gemini Vision AI</h3>
                  <p className="text-xs text-slate-500">100% Precision Multimodal Plant Analysis</p>
                </div>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-600 space-y-2 mb-4">
              <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Info size={14} className="text-leaf-600 shrink-0" />
                How to get a Free Google AI API Key:
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-leaf-700 font-bold underline">Google AI Studio</a></li>
                <li>Click <strong>Create API Key</strong> (100% free tier)</li>
                <li>Paste it below and click Save.</li>
              </ol>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Gemini API Key:
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              {savedKey && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('kisan_gemini_api_key');
                    setSavedKey('');
                    setApiKeyInput('');
                    setIsKeyModalOpen(false);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  Clear Key
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-5 py-2 text-xs font-bold bg-leaf-700 hover:bg-leaf-800 text-white rounded-xl shadow-sm"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-lg w-full text-white shadow-2xl animate-fade-in relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Camera size={20} className="text-leaf-400" />
                {t('cameraTitle')}
              </h3>
              <button
                onClick={closeCamera}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {cameraError ? (
              <div className="bg-rose-900/50 border border-rose-700 text-rose-200 p-4 rounded-2xl text-sm mb-4">
                {cameraError}
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-4 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-8 border-2 border-white/40 rounded-xl pointer-events-none" />
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={toggleCameraFacing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                <RefreshCw size={14} />
                {t('cameraSwitch')}
              </button>

              <button
                onClick={captureSnapshot}
                disabled={!!cameraError}
                className="flex-1 bg-leaf-500 hover:bg-leaf-600 disabled:opacity-40 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <Camera size={18} />
                {t('cameraCapture')}
              </button>

              <button
                onClick={closeCamera}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                {t('cameraClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
