import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import AnalysisCenter from './pages/AnalysisCenter';
import TriageChat from './pages/TriageChat';
import PatientVault from './pages/PatientVault';
import Profile from './pages/Profile';
import ChatWidget from './components/ChatWidget';

function App() {
  const location = useLocation();
  const showChatWidget = location.pathname !== '/triage';

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/analysis" element={<AnalysisCenter />} />
        <Route path="/triage" element={<TriageChat />} />
        <Route path="/vault" element={<PatientVault />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

      {showChatWidget && <ChatWidget />}
    </>
  );
}

export default App;
