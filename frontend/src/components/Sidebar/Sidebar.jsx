import React from "react";

function Sidebar({ currentPage, setCurrentPage, onMicClick }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar">
        <div className="sidebar-brand">
          Expense AI
        </div>
        <div 
          className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentPage('home')}
        >
          <span>🏠</span> Dashboard
        </div>
        <div 
          className={`nav-item ${currentPage === 'charts' ? 'active' : ''}`}
          onClick={() => setCurrentPage('charts')}
        >
          <span>📊</span> Charts
        </div>
        <div 
          className={`nav-item ${currentPage === 'chatbot' ? 'active' : ''}`}
          onClick={() => setCurrentPage('chatbot')}
        >
          <span>🤖</span> AI Assistant
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          <div 
            className={`bottom-nav-item ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            <div className="nav-icon-circle">🏠</div>
            <span>Home</span>
          </div>
          
          <div 
            className={`bottom-nav-item ${currentPage === 'charts' ? 'active' : ''}`}
            onClick={() => setCurrentPage('charts')}
          >
            <div className="nav-icon-circle">📊</div>
            <span>Charts</span>
          </div>
          
          <div 
            className="bottom-nav-item"
            onClick={onMicClick}
          >
            <div className="nav-icon-circle mic-btn-circle" style={{ color: 'white' }}>🎤</div>
            <span>Voice</span>
          </div>

          <div 
            className={`bottom-nav-item ${currentPage === 'chatbot' ? 'active' : ''}`}
            onClick={() => setCurrentPage('chatbot')}
          >
            <div className="nav-icon-circle">🤖</div>
            <span>Chat</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
