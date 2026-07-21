import { useState, useContext, lazy, Suspense } from "react";
import { AuthContext } from "./contexts/AuthContext";

import Sidebar from "./components/Sidebar/Sidebar";
import Layout from "./components/Layout/Layout";
import VoiceModal from "./components/VoiceModal/VoiceModal";

const Home = lazy(() => import("./pages/Home"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
const ChartsPage = lazy(() => import("./pages/ChartsPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

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
    return (
      <Suspense fallback={<div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>}>
        {authPage === 'login' ? <Login setPage={setAuthPage} /> : <Register setPage={setAuthPage} />}
      </Suspense>
    );
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
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          {currentPage === "home" && (
            <Home refresh={refresh} reloadExpenses={reloadExpenses} />
          )}
          {currentPage === "charts" && (
            <ChartsPage refresh={refresh} />
          )}
          {currentPage === "chatbot" && (
            <Chatbot />
          )}
        </Suspense>
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

