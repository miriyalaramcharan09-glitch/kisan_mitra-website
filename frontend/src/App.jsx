import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Result from './pages/Result.jsx';
import PestID from './pages/PestID.jsx';
import DiseaseAlerts from './pages/DiseaseAlerts.jsx';
import CropAdvisory from './pages/CropAdvisory.jsx';
import Fertilizer from './pages/Fertilizer.jsx';
import Weather from './pages/Weather.jsx';
import SoilScanner from './pages/SoilScanner.jsx';
import VoicePage from './pages/VoicePage.jsx';
import AskAnything from './pages/AskAnything.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f6fbf7] text-slate-900 flex flex-col antialiased selection:bg-leaf-200 selection:text-leaf-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
          <Route path="/pest" element={<PestID />} />
          <Route path="/alerts" element={<DiseaseAlerts />} />
          <Route path="/advisory" element={<CropAdvisory />} />
          <Route path="/fertilizer" element={<Fertilizer />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/soil" element={<SoilScanner />} />
          <Route path="/voice" element={<VoicePage />} />
          <Route path="/ask" element={<AskAnything />} />
        </Routes>
      </main>
    </div>
  );
}
