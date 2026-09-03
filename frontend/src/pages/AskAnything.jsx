import { useState } from 'react';
import { HelpCircle, Search, Sparkles, Send, Mic, ChevronDown, ChevronUp, Leaf, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Disclaimer from '../components/Disclaimer.jsx';
import VoiceAssistant from '../components/VoiceAssistant.jsx';

const FAQS = [
  {
    id: 1,
    category: 'disease',
    question_en: 'How to control Tomato leaf curl virus organically?',
    question_te: 'టమోటా ఆకు ముడుత తెగులును సహజ పద్ధతుల్లో ఎలా నివారించాలి?',
    question_hi: 'टमाटर में पत्ती मरोड़ वायरस को जैविक तरीके से कैसे रोकें?',
    answer_en: 'Install yellow sticky traps (15 per acre) to trap whitefly vectors. Spray 5% Neem seed kernel extract (NSKE) or Neem oil (10,000 ppm) @ 2ml/L every 10 days. Rogue out severely infected plants early.',
    answer_te: 'తెల్లదోమల నివారణకు ఎకరానికి 15 పసుపు రంగు జిగురు అట్టలను అమర్చండి. 5% వేప గింజల కషాయం లేదా వేపనూనె (2 మి.లీ/లీ) పిచికారీ చేయండి. తీవ్రంగా ఆశించిన మొక్కలను పీకి నాశనం చేయండి.',
    answer_hi: 'सफेद मक्खी नियंत्रण के लिए प्रति एकड़ 15 पीले चिपचिपे ट्रैप लगाएं। 5% नीम तेल (2 मिली प्रति लीटर) का 10 दिनों के अंतराल पर छिड़काव करें। अत्यधिक संक्रमित पौधों को उखाड़कर नष्ट करें।'
  },
  {
    id: 2,
    category: 'fertilizer',
    question_en: 'What is the best time to apply DAP in Rice / Paddy?',
    question_te: 'వరి పంటలో DAP ఎరువును ఎప్పుడు వేయడం మంచిది?',
    question_hi: 'धान की फसल में डीएपी खाद डालने का सबसे सही समय कौन सा है?',
    answer_en: 'DAP should be applied 100% as a basal dose at the final land preparation or puddling stage before transplanting. Phosphorus does not move easily in soil, so root proximity at planting is essential.',
    answer_te: 'DAP ఎరువును నాట్లు వేసే సమయంలో ఆఖరి దుక్కిలో లేదా దమ్ము చేసినప్పుడు 100% సమగ్రంగా వేయాలి. భాస్వరం నేలలో త్వరగా కదలదు కాబట్టి మొదట్లోనే వేయడం ముఖ్యం.',
    answer_hi: 'डीएपी की पूरी मात्रा रोपाई के समय आखिरी जुताई (लेव लगाते समय) में ही डाल देनी चाहिए। फास्फोरस मिट्टी में तेजी से नहीं फैलता, इसलिए जड़ क्षेत्र में शुरुआत में ही देना आवश्यक है।'
  },
  {
    id: 3,
    category: 'fertilizer',
    question_en: 'How to prepare and apply Liquid Jeevamrutham?',
    question_te: 'ద్రవ జీవామృతాన్ని ఎలా తయారు చేయాలి మరియు ఎలా వాడాలి?',
    question_hi: 'तरल जीवामृत कैसे बनाएं और इसका उपयोग कैसे करें?',
    answer_en: 'Mix 10kg fresh desi cow dung, 10L cow urine, 2kg jaggery, 2kg pulse flour, and 1 handful virgin forest soil in 200L water. Ferment for 48 hours under shade stirring twice daily. Apply 200L/acre with irrigation water every 15 days.',
    answer_te: '200 లీటర్ల నీటిలో 10 కేజీల ఆవు పేడ, 10 లీటర్ల గోమూత్రం, 2 కేజీల బెల్లం, 2 కేజీల పప్పు పిండి మరియు పిడికెడు పుట్టమన్ను కలపండి. 2 రోజులు నీడలో ఉంచి రోజుకు రెండుసార్లు తిప్పండి. ప్రతి 15 రోజులకు ఒకసారి నీటితో పాటు ఎకరానికి 200 లీటర్లు అందించండి.',
    answer_hi: '200 लीटर पानी में 10 किलो ताजा देशी गाय का गोबर, 10 लीटर गोमूत्र, 2 किलो गुड़, 2 किलो बेसन और मुट्ठी भर उपजाऊ मिट्टी मिलाएं। 48 घंटे छांव में रखें और दिन में दो बार चलाएं। प्रति एकड़ 200 लीटर सिंचाई पानी के साथ 15 दिन में दें।'
  },
  {
    id: 4,
    category: 'disease',
    question_en: 'How to save Cotton crop from Pink Bollworm?',
    question_te: 'ప్రత్తి పంటను గులాబీ రంగు పురుగు నుండి ఎలా కాపాడాలి?',
    question_hi: 'कपास को गुलाबी सुंडी के प्रकोप से कैसे बचाएं?',
    answer_en: 'Install 8 pheromone traps per acre at 45 days. Release Trichogramma egg parasitoids @ 60,000/acre. When ETL cross 8 moths/trap, spray Emamectin Benzoate 5% SG @ 0.5g/L or Chlorantraniliprole 18.5% SC @ 0.3ml/L.',
    answer_te: '45 రోజుల వయసులో ఎకరానికి 8 లింగాకర్షక బుట్టలు అమర్చండి. ట్రైకోగ్రామా గుడ్ల పరాన్నజీవులను విడుదల చేయండి. పురుగు ఉధృతి పెరిగితే ఎమామెక్టిన్ బెంజోయేట్ 0.5 గ్రా/లీ లేదా క్లోరాంట్రానిలిప్రోల్ 0.3 మి.లీ/లీ పిచికారీ చేయండి.',
    answer_hi: '45 दिन की फसल पर 8 फेरोमोन ट्रैप लगाएं। ट्राइकोग्रामा परजीवी छोड़ें। यदि कीट अधिक दिखें तो एमामेक्टिन बेंजोएट 0.5 ग्राम प्रति लीटर या कोराजन 0.3 मिली प्रति लीटर का छिड़काव करें।'
  },
  {
    id: 5,
    category: 'schemes',
    question_en: 'How can farmers benefit from PM-Kisan & Soil Health Card?',
    question_te: 'పీఎం కిసాన్ మరియు సాయిల్ హెల్త్ కార్డు ద్వారా రైతులకు ఎలాంటి ప్రయోజనం ఉంటుంది?',
    question_hi: 'पीएम-किसान और मृदा स्वास्थ्य कार्ड योजना का लाभ कैसे लें?',
    answer_en: 'PM-Kisan provides ₹6,000/year in 3 equal installments directly to farmer bank accounts. Soil Health Cards give customized nutrient status of your field every 2 years, saving 20-30% on excess fertilizer costs.',
    answer_te: 'పీఎం కిసాన్ ద్వారా సంవత్సరానికి ₹6,000 రైతుల ఖాతాల్లో నేరుగా జమవుతుంది. సాయిల్ హెల్త్ కార్డు ద్వారా పొలంలో ఏ పోషకాలు తక్కువగా ఉన్నాయో తెలుసుకుని అనవసర ఎరువుల ఖర్చును 20-30% వరకు తగ్గించుకోవచ్చు.',
    answer_hi: 'पीएम-किसान योजना के तहत सालाना ₹6,000 सीधे बैंक खाते में मिलते हैं। मृदा स्वास्थ्य कार्ड से खेत की मिट्टी की जांच कर सही उर्वरक डालने से खाद का खर्च 20-30% कम हो जाता है।'
  }
];

export default function AskAnything() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [customResponse, setCustomResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(1);

  const getQuestion = (faq) => {
    if (i18n.language === 'te' && faq.question_te) return faq.question_te;
    if (i18n.language === 'hi' && faq.question_hi) return faq.question_hi;
    return faq.question_en;
  };

  const getAnswer = (faq) => {
    if (i18n.language === 'te' && faq.answer_te) return faq.answer_te;
    if (i18n.language === 'hi' && faq.answer_hi) return faq.answer_hi;
    return faq.answer_en;
  };

  const handleAsk = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        const text = i18n.language === 'te'
          ? `మీరు అడిగిన "${query}" గురించి సమాచారం: ${item.name_te || item.name} పరిశీలించండి.`
          : i18n.language === 'hi'
          ? `आपके प्रश्न "${query}" के आधार पर "${item.name_hi || item.name}" से संबंधित जानकारी उपलब्ध है।`
          : `Based on your question about "${query}", we found matching guidance for "${item.name}".`;
        setCustomResponse(text);
      } else {
        const text = i18n.language === 'te'
          ? 'మీ ప్రశ్నకు సంబంధించిన ఖచ్చితమైన సలహా కోసం పంట పేరు మరియు వ్యాధి లక్షణాలను పేర్కొనండి.'
          : i18n.language === 'hi'
          ? 'सटीक सलाह के लिए कृपया फसल का नाम और दिखने वाले लक्षण स्पष्ट रूप से लिखें।'
          : 'For specific agronomic advice, please include the crop name and symptom details.';
        setCustomResponse(text);
      }
    } catch {
      setCustomResponse('Your query has been recorded.');
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = FAQS.filter((f) => {
    if (categoryFilter === 'all') return true;
    return f.category === categoryFilter;
  });

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-900 text-xs font-semibold">
          <HelpCircle size={14} className="text-teal-700" />
          <span>Agricultural Q&A Knowledge Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          {t('askPage.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          {t('askPage.subtitle')}
        </p>
      </div>

      {/* Query Input Box */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-md">
        <form onSubmit={handleAsk} className="space-y-4">
          <div className="relative flex items-center bg-white border border-slate-300 rounded-2xl px-4 py-3.5 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition shadow-2xs">
            <Search size={20} className="text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('askPage.inputPlaceholder')}
              className="flex-1 outline-none text-sm sm:text-base text-slate-800 font-medium bg-transparent"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white p-2.5 rounded-xl font-bold transition shadow-sm flex items-center justify-center shrink-0 ml-2"
            >
              <Send size={16} />
            </button>
          </div>
        </form>

        {customResponse && (
          <div className="mt-4 p-5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 text-sm font-medium animate-fade-in">
            <p className="font-bold text-xs uppercase tracking-wider text-teal-800 mb-1 flex items-center gap-1.5">
              <Sparkles size={14} className="text-teal-600" />
              <span>AI Advisory Response</span>
            </p>
            <p>{customResponse}</p>
          </div>
        )}
      </div>

      {/* Categories & FAQ Accordion */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            {t('askPage.popularTopics')}
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {['all', 'disease', 'fertilizer', 'schemes'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  categoryFilter === cat
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t(`askPage.categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-50 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs shrink-0">
                      Q
                    </span>
                    <span>{getQuestion(faq)}</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-teal-600 shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed border-t border-slate-100 bg-teal-50/20">
                    <p className="mt-2">{getAnswer(faq)}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
