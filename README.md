# intervue-polling-system

Live Polling System built as part of the Intervue.io SDE Intern Role Assignment. The application allows users to create polls, vote in real time, and view live results with a responsive UI.

A modern, full-stack poll system application built with React and Node.js/Express with MongoDB integration.

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
- MongoDB (with Mongoose)
- RESTful API

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup
### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/devradheee/intervue-polling-system.git
   cd intervue-polling-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
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
│   ├── index.js           # Server entry point
│   ├── test-connection.js # MongoDB connection test script
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

Create a `.env` file in the `server` directory:
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pollSystemDB?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
```


## Running the Application

1. The apps will be available at:
   ```
   http://localhost:3000/
   ```