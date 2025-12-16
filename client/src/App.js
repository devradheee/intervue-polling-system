import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import CreatePoll from './components/CreatePoll';
import PollDetail from './components/PollDetail';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>🗳️ Poll System</h1>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/create">Create Poll</Link>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePoll />} />
            <Route path="/poll/:id" element={<PollDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

