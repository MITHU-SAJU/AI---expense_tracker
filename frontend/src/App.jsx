import { useState } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import Chatbot from "./pages/Chatbot";
import ChartsPage from "./pages/ChartsPage";

function App() {
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  const reloadExpenses = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="app-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

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
    </div>
  );
}

export default App;

