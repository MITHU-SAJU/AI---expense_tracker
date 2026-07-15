import { useState, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";

import Sidebar from "./components/Sidebar/Sidebar";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import Chatbot from "./pages/Chatbot";
import ChartsPage from "./pages/ChartsPage";
import VoiceModal from "./components/VoiceModal/VoiceModal";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const { user, loading } = useContext(AuthContext);
  const [authPage, setAuthPage] = useState('login'); // 'login' or 'register'
  
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
  }

  if (!user) {
    return authPage === 'login' ? <Login setPage={setAuthPage} /> : <Register setPage={setAuthPage} />;
  }

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

