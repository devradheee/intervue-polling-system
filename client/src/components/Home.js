import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPolls, deletePoll } from '../services/api';
import './Home.css';
import { FiTrash2, FiEye, FiClock } from 'react-icons/fi';

function Home() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await getPolls();
      setPolls(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load polls';
      setError(errorMessage.includes('Database not connected') 
        ? 'Database connection issue. Please check if MongoDB is connected.' 
        : errorMessage);
      console.error('Error fetching polls:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this poll?')) {
      try {
        await deletePoll(id);
        setPolls(polls.filter(poll => poll.id !== id));
      } catch (err) {
        alert('Failed to delete poll');
      }
    }
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading polls...</p>
      </div>
    );
  }

  if (error) {
    const isDbError = error.includes('Database not connected') || error.includes('MongoDB');
    return (
      <div className="error-container">
        <h3>⚠️ Connection Issue</h3>
        <p>{error}</p>
        {isDbError && (
          <div className="error-help">
            <p><strong>To fix this:</strong></p>
            <ol>
              <li>Check your <code>server/.env</code> file has the correct MONGO_URI</li>
              <li>Make sure your MongoDB password is URL-encoded (@ becomes %40)</li>
              <li>Verify MongoDB Atlas Network Access allows your IP</li>
              <li>Check the server console for detailed error messages</li>
            </ol>
          </div>
        )}
        <button onClick={fetchPolls}>Retry</button>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h2>All Polls</h2>
        <Link to="/create" className="create-button">
          + Create New Poll
        </Link>
      </div>

      {polls.length === 0 ? (
        <div className="empty-state">
          <p>No polls yet. Create your first poll!</p>
          <Link to="/create" className="create-button">
            Create Poll
          </Link>
        </div>
      ) : (
        <div className="polls-grid">
          {polls.map(poll => (
            <div key={poll.id} className="poll-card">
              <div className="poll-card-header">
                <h3>{poll.question}</h3>
                {isExpired(poll.expiresAt) && (
                  <span className="expired-badge">Expired</span>
                )}
                {poll.expiresAt && !isExpired(poll.expiresAt) && (
                  <span className="active-badge">
                    <FiClock /> Active
                  </span>
                )}
              </div>
              
              <div className="poll-stats">
                <span>{poll.options.length} options</span>
                <span>•</span>
                <span>{poll.totalVotes} votes</span>
              </div>

              <div className="poll-card-actions">
                <Link to={`/poll/${poll.id}`} className="view-button">
                  <FiEye /> View & Vote
                </Link>
                <button
                  onClick={(e) => handleDelete(poll.id, e)}
                  className="delete-button"
                >
                  <FiTrash2 />
                </button>
              </div>

              <div className="poll-date">
                Created: {new Date(poll.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;

