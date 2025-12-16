import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPolls = () => api.get('/polls');
export const getPoll = (id) => api.get(`/polls/${id}`);
export const createPoll = (pollData) => api.post('/polls', pollData);
export const voteOnPoll = (pollId, optionId) => api.post(`/polls/${pollId}/vote`, { optionId });
export const deletePoll = (id) => api.delete(`/polls/${id}`);

export default api;

