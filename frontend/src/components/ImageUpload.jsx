import { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, Camera, Loader2, Sparkles, X, RefreshCw, CheckCircle2, Image as ImageIcon, AlertCircle, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Resolve API base URL: Vite dev proxy works on relative paths,
// but in production we need the absolute backend URL.
// Set VITE_API_URL=https://your-backend.com in frontend/.env for production
const API_BASE = import.meta.env.VITE_API_URL || '';

// Preset test samples for quick test
const SAMPLES = [
  { id: 'tomato', cropHint: 'Tomato', labelKey: 'samples.tomato', icon: '🍅', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { id: 'rice', cropHint: 'Rice (Paddy)', labelKey: 'samples.rice', icon: '🌾', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'cotton', cropHint: 'Cotton', labelKey: 'samples.cotton', icon: '☁️', color: 'bg-slate-50 border-slate-200 text-slate-700' },
  { id: 'chilli', cropHint: 'Chilli', labelKey: 'samples.chilli', icon: '🌶️', color: 'bg-red-50 border-red-200 text-red-700' },
];

export default function ImageUpload() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [symptomHint, setSymptomHint] = useState('');

  // Compress and set preview from a file
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
        const maxDim = 800;
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
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        setPreview(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle file selection
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Drag-and-drop handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Open Live Camera
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
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        setCameraError('Camera access not supported on this device/browser.');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Could not access camera. Please allow camera permissions.');
    }
  };

  // Attach video stream when modal mounts
  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  // Close Camera
  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  // Capture Snapshot from Live Video
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const snapshotBase64 = canvas.toDataURL('image/jpeg', 0.85);

    setPreview(snapshotBase64);
    setSelectedSample(null);
    closeCamera();
  };

  // Switch between front/back camera
  const toggleCameraFacing = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: nextMode } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.warn('Facing mode switch fallback:', err);
    }
  };

  // Select a sample preset
  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setError('');
    // Create an SVG leaf placeholder preview with color
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#f0fdf4');
    gradient.addColorStop(1, '#dcfce7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sample.icon, 300, 200);
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(t(sample.labelKey), 300, 260);
    ctx.fillStyle = '#4b5563';
    ctx.font = '16px sans-serif';
    ctx.fillText('Sample Test Image — Kisan Mitra', 300, 295);
    setPreview(canvas.toDataURL('image/png'));
  };

  // Run AI Analysis
  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        cropHint: selectedSample ? selectedSample.cropHint : '',
        symptomHint: symptomHint.trim(),
        imageBase64: preview,
      };
      const res = await fetch(`${API_BASE}/api/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      navigate('/result', { state: { ...data, imagePreview: preview } });
    } catch (err) {
      console.error('Diagnosis failed:', err);
      setError(
        err.message.includes('fetch')
          ? 'Cannot connect to backend server. Make sure it is running on port 4000.'
          : err.message || 'Analysis failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto text-center relative overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Decorative accent top line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-leaf-400 via-leaf-600 to-amber-400" />

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-leaf-100 text-leaf-800 text-xs font-semibold mb-3">
        <Sparkles size={14} className="text-leaf-600 animate-spin" />
        <span>AI Vision Diagnostic Engine</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
        {t('uploadTitle')}
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
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

      {/* Preview Box */}
      <div className="relative group mb-5">
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
            className={`border-2 border-dashed rounded-2xl py-10 px-4 transition cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-500 group ${
              isDragging
                ? 'border-leaf-500 bg-leaf-50 scale-[1.01]'
                : 'border-leaf-300 hover:border-leaf-500 bg-leaf-50/50 hover:bg-leaf-50'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-leaf-600 transition border border-leaf-200 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
              <ImageIcon size={28} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {isDragging ? 'Drop your image here!' : 'Click to browse or drag & drop leaf photo'}
            </p>
            <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP up to 10MB</p>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFile}
        className="hidden"
      />

      {/* Upload and Camera Buttons */}
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-leaf-100 hover:bg-leaf-200 text-leaf-800 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm hover:shadow"
        >
          <Upload size={18} className="text-leaf-700" />
          {t('uploadButton')}
        </button>

        <button
          onClick={openCamera}
          className="flex items-center gap-2 bg-leaf-700 hover:bg-leaf-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm hover:shadow"
        >
          <Camera size={18} />
          {t('cameraButton')}
        </button>
      </div>

      {/* Optional Symptom Hint Input */}
      <div className="mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={symptomHint}
            onChange={(e) => setSymptomHint(e.target.value)}
            placeholder="Describe symptoms (optional): e.g. yellow leaves, brown spots..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Sample Quick-Test Presets */}
      <div className="mb-6 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-600 mb-3 text-left sm:text-center">
          {t('sampleImagesTitle')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLES.map((s) => {
            const isSelected = selectedSample?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleSelectSample(s)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                  isSelected
                    ? 'border-leaf-600 bg-leaf-100 text-leaf-900 ring-2 ring-leaf-500/20 shadow-sm'
                    : `${s.color} hover:shadow-sm`
                }`}
              >
                <span className="text-base">{s.icon}</span>
                <span className="truncate flex-1 font-semibold">{t(s.labelKey)}</span>
                {isSelected && <CheckCircle2 size={14} className="text-leaf-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!preview || loading}
        className="w-full bg-gradient-to-r from-leaf-600 via-leaf-700 to-leaf-800 hover:from-leaf-700 hover:to-leaf-900 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 px-6 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 transform active:scale-[0.99]"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>{t('analyzing')}</span>
          </>
        ) : (
          <>
            <Sparkles size={20} className="text-amber-300" />
            <span>{t('analyzeButton')}</span>
          </>
        )}
      </button>

      {/* Live Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
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
                {/* Visual Viewfinder crosshair */}
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
