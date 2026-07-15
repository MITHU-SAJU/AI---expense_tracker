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
            <span style={{ fontSize: '1.25rem' }}>🏠</span>
            Home
          </div>
          
          <div 
            className={`bottom-nav-item ${currentPage === 'charts' ? 'active' : ''}`}
            onClick={() => setCurrentPage('charts')}
          >
            <span style={{ fontSize: '1.25rem' }}>📊</span>
            Charts
          </div>
          
          {/* Centered floating mic/AI button for adding expenses */}
          <div className="mic-btn-container">
            <button 
              className="mic-btn shadow-sm"
              onClick={onMicClick}
            >
              🎤
            </button>
          </div>
          <div style={{ width: '40px' }}></div> {/* Spacer for middle button layout balance if needed, or flex handles it */}

          <div 
            className={`bottom-nav-item ${currentPage === 'chatbot' ? 'active' : ''}`}
            onClick={() => setCurrentPage('chatbot')}
          >
            <span style={{ fontSize: '1.25rem' }}>🤖</span>
            Chat
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
