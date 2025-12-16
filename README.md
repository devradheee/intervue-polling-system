# Poll System

A modern, full-stack poll system application built with React and Node.js/Express.

## Features

- ✅ Create polls with multiple options
- ✅ Vote on polls
- ✅ View real-time poll results with visual charts
- ✅ Set expiration dates for polls
- ✅ Delete polls
- ✅ Responsive design with modern UI
- ✅ RESTful API backend

## Tech Stack

### Frontend
- React 18
- React Router
- Axios
- React Icons
- CSS3 with modern styling

### Backend
- Node.js
- Express.js
- File-based storage (JSON)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

   Or manually:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend app on `http://localhost:3000`

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

## Project Structure

```
Poll_System/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Express backend
│   ├── data/              # JSON data storage
│   ├── index.js           # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## API Endpoints

- `GET /api/polls` - Get all polls
- `GET /api/polls/:id` - Get a specific poll
- `POST /api/polls` - Create a new poll
- `POST /api/polls/:id/vote` - Vote on a poll
- `DELETE /api/polls/:id` - Delete a poll
- `GET /api/health` - Health check

## Usage

1. **Create a Poll:**
   - Click "Create New Poll" from the home page
   - Enter a question
   - Add at least 2 options (up to 10)
   - Optionally set an expiration date
   - Click "Create Poll"

2. **Vote on a Poll:**
   - Click on any poll card to view details
   - Select an option
   - Click "Submit Vote"
   - View results immediately

3. **View Results:**
   - Results show vote counts and percentages
   - Visual bar charts display vote distribution
   - Results are sorted by vote count

## Environment Variables

Create a `.env` file in the `server` directory (optional):
```
PORT=5000
```

Create a `.env` file in the `client` directory (optional):
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Production Build

### Build Frontend:
```bash
cd client
npm run build
```

### Start Production Server:
```bash
cd server
npm start
```

## Future Enhancements

- User authentication
- Database integration (MongoDB/PostgreSQL)
- Real-time updates with WebSockets
- Poll sharing with unique links
- Email notifications
- Advanced analytics
- Poll categories/tags

## License

ISC

