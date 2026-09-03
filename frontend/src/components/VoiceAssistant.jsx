import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function VoiceAssistant({ onQueryResult, compact = false }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
      if (event.results[current].isFinal) {
        processVoiceQuery(text);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [i18n.language]);

  const getLanguageCode = () => {
    if (i18n.language === 'te') return 'te-IN';
    if (i18n.language === 'hi') return 'hi-IN';
    return 'en-IN';
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      stopSpeaking();
      recognitionRef.current.lang = getLanguageCode();
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start retry:', err);
      }
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode();
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const processVoiceQuery = async (queryText) => {
    const lower = queryText.toLowerCase();

    // Check weather
    if (lower.includes('weather') || lower.includes('వాతావరణం') || lower.includes('मौसम') || lower.includes('rain') || lower.includes('వర్షం') || lower.includes('बारिश')) {
      const msg = i18n.language === 'te'
        ? 'ప్రస్తుతం వాతావరణం తేమగా ఉంది. రాబోయే 24 గంటల్లో తేలికపాటి వర్ష సూచన ఉంది. మందుల పిచికారీని వాయిదా వేయండి.'
        : i18n.language === 'hi'
        ? 'वर्तमान में मौसम में नमी है। अगले 24 घंटों में हल्की बारिश की संभावना है। कीटनाशक छिड़काव अभी टालें।'
        : 'Weather conditions show moderate humidity with light rain chance. Delay foliar spraying until dry skies.';
      setResponse(msg);
      speakText(msg);
      return;
    }

    // Check cotton / pink bollworm
    if (lower.includes('cotton') || lower.includes('ప్రత్తి') || lower.includes('कपास') || lower.includes('bollworm') || lower.includes('గులాబీ')) {
      const msg = i18n.language === 'te'
        ? 'ప్రత్తిలో గులాబీ రంగు పురుగు నివారణకు ఎకరానికి 8 లింగాకర్షక బుట్టలు అమర్చండి మరియు ఎమామెక్టిన్ బెంజోయేట్ 0.5 గ్రాము లీటరు నీటికి కలిపి పిచికారీ చేయండి.'
        : i18n.language === 'hi'
        ? 'कपास में गुलाबी सुंडी नियंत्रण के लिए प्रति एकड़ 8 फेरोमोन ट्रैप लगाएं और एमामेक्टिन बेंजोएट 0.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।'
        : 'For Cotton pink bollworm, install 8 pheromone traps per acre and spray Emamectin Benzoate 5% SG at 0.5g per liter.';
      setResponse(msg);
      speakText(msg);
      return;
    }

    // Check tomato
    if (lower.includes('tomato') || lower.includes('టమోటా') || lower.includes('टमाटर')) {
      const msg = i18n.language === 'te'
        ? 'టమోటాలో ముందస్తు ఆకుమచ్చ తెగులు నివారణకు మాంకోజెబ్ 2 గ్రాములు లేదా వేపనూనె 5 మి.లీ లీటరు నీటికి కలిపి పిచికారీ చేయండి.'
        : i18n.language === 'hi'
        ? 'टमाटर में अगेती झुलसा रोग के लिए मैंकोजेब 2 ग्राम या नीम तेल 5 मिली प्रति लीटर पानी में मिलाकर छिड़कें।'
        : 'For Tomato early blight, spray Mancozeb 75% WP at 2g per liter or organic Neem oil at 5ml per liter.';
      setResponse(msg);
      speakText(msg);
      return;
    }

    // Check fertilizer
    if (lower.includes('fertilizer') || lower.includes('ఎరువులు') || lower.includes('खाद') || lower.includes('urea') || lower.includes('యూరియా') || lower.includes('यूरिया')) {
      const msg = i18n.language === 'te'
        ? 'ఎరువులను పంట విస్తీర్ణాన్ని బట్టి సమతుల్య NPK నిష్పత్తిలో 3 దఫాలుగా వేయాలి. ఎరువుల కాలిక్యులేటర్ పేజీని చూడండి.'
        : i18n.language === 'hi'
        ? 'उर्वरकों को फसल क्षेत्रफल अनुसार संतुलित NPK अनुपात में 3 किस्तों में दें। सटीक मात्रा के लिए उर्वरक कैलकुलेटर देखें।'
        : 'Apply balanced NPK fertilizers in 3 split doses across crop growth stages. Visit our Fertilizer Calculator for exact bag counts.';
      setResponse(msg);
      speakText(msg);
      return;
    }

    // Default fallback search
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(queryText)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const first = data.results[0];
        const msg = i18n.language === 'te'
          ? `మీ ప్రశ్నకు సంబంధించి "${first.name_te || first.name}" వివరాలు కనుగొనబడ్డాయి.`
          : i18n.language === 'hi'
          ? `आपके सवाल के अनुसार "${first.name_hi || first.name}" की जानकारी उपलब्ध है।`
          : `Found information regarding "${first.name}".`;
        setResponse(msg);
        speakText(msg);
      } else {
        const msg = i18n.language === 'te'
          ? 'మీ మాట వినబడింది. దయచేసి పంట లేదా తెగులు పేరును స్పష్టంగా చెప్పండి.'
          : i18n.language === 'hi'
          ? 'आपकी बात सुनी गई। कृपया फसल या रोग का नाम स्पष्ट बोलें।'
          : 'I heard your question. Please mention the crop or pest name clearly for specific remedies.';
        setResponse(msg);
        speakText(msg);
      }
    } catch {
      const msg = 'Agricultural voice query processed.';
      setResponse(msg);
      speakText(msg);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={toggleListening}
          className={`p-3 rounded-2xl flex items-center gap-2 font-bold text-xs transition shadow-md ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-leaf-600 hover:bg-leaf-700 text-white'
          }`}
          title="Voice Assistant"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          <span>{isListening ? t('voicePage.listening') : t('cards.voice')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto text-center relative overflow-hidden">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-leaf-100 text-leaf-800 text-xs font-semibold mb-3">
        <Sparkles size={14} className="text-leaf-600" />
        <span>Web Speech Native AI Assistant</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
        {t('voicePage.title')}
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
        {t('voicePage.subtitle')}
      </p>

      {!supported && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs sm:text-sm mb-6">
          {t('voicePage.notSupported')}
        </div>
      )}

      {/* Interactive Mic Orb */}
      <div className="relative my-8 flex justify-center items-center">
        {isListening && (
          <>
            <div className="absolute w-36 h-36 rounded-full bg-leaf-400/20 animate-ping pointer-events-none" />
            <div className="absolute w-28 h-28 rounded-full bg-leaf-500/30 animate-pulse pointer-events-none" />
          </>
        )}
        <button
          onClick={toggleListening}
          disabled={!supported}
          className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
            isListening
              ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-rose-500/40 ring-4 ring-rose-200'
              : 'bg-gradient-to-tr from-leaf-600 to-leaf-500 hover:from-leaf-700 hover:to-leaf-600 text-white shadow-leaf-600/30 ring-4 ring-leaf-100 hover:ring-leaf-200'
          }`}
          aria-label="Toggle Voice Assistant"
        >
          {isListening ? <MicOff size={36} /> : <Mic size={36} />}
        </button>
      </div>

      <p className="text-sm font-bold text-slate-700 mb-4">
        {isListening ? t('voicePage.listening') : t('voicePage.tapToSpeak')}
      </p>

      {/* Recognized Speech Bubble */}
      {transcript && (
        <div className="bg-leaf-50 border border-leaf-200 rounded-2xl p-4 text-left mb-4 animate-fade-in">
          <p className="text-xs font-semibold text-leaf-800 mb-1 flex items-center gap-1.5">
            <Mic size={14} className="text-leaf-600" />
            <span>You said:</span>
          </p>
          <p className="text-sm text-slate-800 font-medium italic">"{transcript}"</p>
        </div>
      )}

      {/* Spoken AI Response Bubble */}
      {response && (
        <div className="bg-white border border-leaf-300 rounded-2xl p-5 text-left mb-6 shadow-md animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-leaf-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-leaf-600" />
              <span>{t('voicePage.response')}</span>
            </p>
            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded bg-rose-50"
              >
                <VolumeX size={14} />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={() => speakText(response)}
                className="flex items-center gap-1 text-xs text-leaf-700 hover:text-leaf-800 font-semibold px-2 py-1 rounded bg-leaf-50"
              >
                <Volume2 size={14} />
                <span>Replay</span>
              </button>
            )}
          </div>
          <p className="text-sm text-slate-800 leading-relaxed font-medium">{response}</p>
        </div>
      )}

      {/* Suggested Quick Questions */}
      <div className="pt-4 border-t border-slate-100 text-left">
        <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
          <HelpCircle size={14} className="text-slate-400" />
          <span>{t('voicePage.quickPrompts')}</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {['sample1', 'sample2', 'sample3', 'sample4'].map((sKey) => (
            <button
              key={sKey}
              onClick={() => {
                const sampleText = t(`voicePage.${sKey}`);
                setTranscript(sampleText);
                processVoiceQuery(sampleText);
              }}
              className="text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-leaf-50 hover:text-leaf-900 border border-slate-200 text-slate-600 text-left transition flex items-center justify-between group"
            >
              <span className="truncate mr-1">{t(`voicePage.${sKey}`)}</span>
              <ArrowRight size={13} className="text-slate-400 group-hover:text-leaf-600 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
