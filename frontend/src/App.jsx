import { useState } from "react";

import Header from "./components/Header/Header";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import Chatbot from "./pages/Chatbot";

function App() {
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  const reloadExpenses = () => {
    setRefresh(!refresh);
  };

  return (
    <>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <Layout>
        {currentPage === "home" ? (
          <Home refresh={refresh} reloadExpenses={reloadExpenses} />
        ) : (
          <Chatbot />
        )}
      </Layout>
    </>
  );
}

export default App;
