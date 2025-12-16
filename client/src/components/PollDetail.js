import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPoll, voteOnPoll } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import './PollDetail.css';
import { FiArrowLeft, FiCheck, FiBarChart2, FiWifi, FiWifiOff, FiRefreshCw } from 'react-icons/fi';

function PollDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchPoll();
    
    // Connect to Socket.IO for real-time updates
    try {
      const socket = connectSocket();
      socketRef.current = socket;
      
      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('join-poll', id);
      });
      
      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('connect_error', () => {
        setIsConnected(false);
      });

      // Listen for real-time poll updates
      socket.on(`poll:${id}:update`, (updatedPoll) => {
        setPoll(updatedPoll);
        // Auto-show results when someone votes
        if (!voted && updatedPoll.totalVotes > 0) {
          setVoted(true);
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.emit('leave-poll', id);
          socketRef.current.off(`poll:${id}:update`);
          disconnectSocket();
        }
      };
    } catch (error) {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    }
  }, [id, voted]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const response = await getPoll(id);
      setPoll(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load poll');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      alert('Please select an option');
      return;
    }

    setVoting(true);
    try {
      const response = await voteOnPoll(id, selectedOption);
      setPoll(response.data);
      setVoted(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const isExpired = () => {
    if (!poll?.expiresAt) return false;
    return new Date(poll.expiresAt) < new Date();
  };

  const getPercentage = (votes) => {
    if (!poll || poll.totalVotes === 0) return 0;
    return ((votes / poll.totalVotes) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading poll...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="error-container">
        <p>{error || 'Poll not found'}</p>
        <Link to="/" className="back-button">
          <FiArrowLeft /> Back to Home
        </Link>
      </div>
    );
  }

  const expired = isExpired();

  return (
    <div className="poll-detail-container">
      <Link to="/" className="back-link">
        <FiArrowLeft /> Back to Home
      </Link>

      <div className="poll-detail-card">
        <div className="poll-header">
          <h1>{poll.question}</h1>
          {expired && <span className="expired-badge">Expired</span>}
          {poll.expiresAt && !expired && (
            <span className="active-badge">
              Expires: {new Date(poll.expiresAt).toLocaleString()}
            </span>
          )}
        </div>

        <div className="poll-meta">
          <span>{poll.totalVotes} total votes</span>
          <span>•</span>
          <span>Created {new Date(poll.createdAt).toLocaleDateString()}</span>
          <span className="connection-status">
            {isConnected ? (
              <><FiWifi /> Live</>
            ) : (
              <><FiWifiOff /> Offline</>
            )}
          </span>
        </div>

        {(voted || expired || poll.totalVotes > 0) ? (
          <div className="results-section">
            <h3>
              <FiBarChart2 /> Live Results
              {isConnected && <span className="live-indicator"></span>}
            </h3>
            <div className="results-list">
              {poll.options
                .sort((a, b) => b.votes - a.votes)
                .map((option) => (
                  <div key={option.id} className="result-item">
                    <div className="result-header">
                      <span className="result-text">{option.text}</span>
                      <span className="result-stats">
                        {option.votes} votes ({getPercentage(option.votes)}%)
                      </span>
                    </div>
                    <div className="result-bar-container">
                      <div
                        className="result-bar"
                        style={{ width: `${getPercentage(option.votes)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="voting-section">
            <h3>Select an option:</h3>
            <div className="options-list">
              {poll.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`option-button ${
                    selectedOption === option.id ? 'selected' : ''
                  }`}
                >
                  <span className="option-text">{option.text}</span>
                  {selectedOption === option.id && (
                    <FiCheck className="check-icon" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={handleVote}
              disabled={!selectedOption || voting}
              className="vote-button"
            >
              {voting ? 'Voting...' : 'Submit Vote'}
            </button>
          </div>
        )}

        {voted && !expired && (
          <button onClick={fetchPoll} className="refresh-button">
            <FiRefreshCw /> Refresh Results
          </button>
        )}
      </div>
    </div>
  );
}

export default PollDetail;

