import { useState } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import Chatbot from "./pages/Chatbot";
import ChartsPage from "./pages/ChartsPage";
import VoiceModal from "./components/VoiceModal/VoiceModal";

function App() {
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const reloadExpenses = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="app-container">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onMicClick={() => setShowVoiceModal(true)} 
      />

      <Layout>
        {currentPage === "home" && (
          <Home refresh={refresh} reloadExpenses={reloadExpenses} />
        )}
        {currentPage === "charts" && (
          <ChartsPage refresh={refresh} />
        )}
        {currentPage === "chatbot" && (
          <Chatbot />
        )}
      </Layout>

      <VoiceModal 
        show={showVoiceModal} 
        onHide={() => setShowVoiceModal(false)} 
        reloadExpenses={reloadExpenses} 
      />
    </div>
  );
}

export default App;

