require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection with improved error handling
if (!MONGO_URI) {
  console.error('⚠️  MONGO_URI is not defined in .env file');
  console.error('Please create server/.env file with your MongoDB connection string');
  console.error('Run: node verify-connection.js to test your connection string');
} else {
  // Validate connection string format
  const uriPattern = /^mongodb\+srv:\/\/[^:]+:[^@]+@[^/]+\/[^?]+\?/;
  if (!uriPattern.test(MONGO_URI)) {
    console.error('❌ Invalid MONGO_URI format in .env file');
    console.error('Expected: mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority');
    console.error('Run: node verify-connection.js to verify your connection string');
  } else {
    mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then(() => {
        console.log('✅ Connected to MongoDB successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🔗 Host: ${mongoose.connection.host}`);
      })
      .catch((error) => {
        console.error('\n❌ MongoDB connection error:', error.message);
        console.error('\n💡 Troubleshooting:');
        
        if (error.message.includes('ENOTFOUND')) {
          console.error('   The cluster hostname is incorrect!');
          console.error('   Get your correct connection string from MongoDB Atlas:');
          console.error('   1. Go to MongoDB Atlas → Connect → Connect your application');
          console.error('   2. Copy the connection string');
          console.error('   3. Update server/.env with the correct MONGO_URI');
        } else if (error.message.includes('authentication')) {
          console.error('   Authentication failed!');
          console.error('   - Check username and password');
          console.error('   - URL-encode special characters (@ → %40)');
        } else if (error.message.includes('timeout')) {
          console.error('   Connection timeout!');
          console.error('   - Check MongoDB Atlas Network Access settings');
          console.error('   - Add your IP or 0.0.0.0/0 for development');
        }
        
        console.error(`\n📋 Current MONGO_URI: ${MONGO_URI.replace(/:[^:@]+@/, ':****@')}`);
        console.error('\n🔧 Test your connection: node verify-connection.js\n');
        
        // Try to reconnect after 10 seconds
        console.log('🔄 Will retry connection in 10 seconds...\n');
        setTimeout(() => {
          mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
          })
          .then(() => {
            console.log('✅ Reconnected to MongoDB successfully');
            console.log(`📊 Database: ${mongoose.connection.name}`);
          })
          .catch((retryError) => {
            console.error('❌ Retry failed:', retryError.message);
          });
        }, 10000);
      });
  }
}

// Poll schema & model
const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 }
}, { _id: true });

const pollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [optionSchema], validate: v => v.length >= 2 },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    totalVotes: { type: Number, default: 0 }
  },
  {
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        if (ret.options) {
          ret.options = ret.options.map(opt => {
            const optObj = opt.toObject ? opt.toObject() : opt;
            optObj.id = optObj._id ? optObj._id.toString() : optObj.id;
            delete optObj._id;
            return optObj;
          });
        }
        return ret;
      }
    }
  }
);

const Poll = mongoose.model('Poll', pollSchema);

// Routes

// Get all polls
app.get('/api/polls', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: 'Failed to fetch polls: ' + error.message });
  }
});

// Get single poll by ID
app.get('/api/polls/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json(poll);
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll: ' + error.message });
  }
});

// Create new poll
app.post('/api/polls', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
    const { question, options, expiresAt } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res
        .status(400)
        .json({ error: 'Question and at least 2 options are required' });
    }

    const poll = new Poll({
      question,
      options: options.map((opt) => ({ text: opt })),
      expiresAt: expiresAt || null
    });

    const savedPoll = await poll.save();
    res.status(201).json(savedPoll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll: ' + error.message });
  }
});

// Vote on a poll
app.post('/api/polls/:id/vote', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
    const { optionId } = req.body;

    if (!optionId) {
      return res.status(400).json({ error: 'Option ID is required' });
    }

    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Poll has expired' });
    }

    // Find option by _id (MongoDB ObjectId) or by matching id string
    let option = poll.options.id(optionId);
    if (!option) {
      // Try finding by string comparison
      option = poll.options.find(opt => opt._id.toString() === optionId || opt.id === optionId);
    }
    
    if (!option) {
      return res.status(404).json({ error: 'Option not found' });
    }

    option.votes += 1;
    poll.totalVotes += 1;

    const updatedPoll = await poll.save();
    res.json(updatedPoll);
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to vote: ' + error.message });
  }
});

// Delete a poll
app.delete('/api/polls/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
    const deleted = await Poll.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ error: 'Failed to delete poll: ' + error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({ 
    status: 'OK',
    database: {
      status: dbStates[dbStatus] || 'unknown',
      connected: dbStatus === 1
    }
  });
});

// Database connection status endpoint
app.get('/api/db-status', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    connected: dbStatus === 1,
    status: dbStates[dbStatus] || 'unknown',
    hasUri: !!MONGO_URI,
    error: dbStatus !== 1 ? 'MongoDB not connected. Check your connection string in server/.env' : null
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

