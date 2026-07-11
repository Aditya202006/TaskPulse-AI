# TaskPulse AI

> **Your AI-Powered Deadline & Task Extraction Platform**

TaskPulse AI is a complete, production-ready full-stack web application designed to automatically extract tasks, deadlines, and key events from college circulars, placement emails, assignment screenshots, WhatsApp notices, event posters, and internship offer letters. Using advanced OCR technology and Google Gemini AI, it parses text and structures it into a unified, responsive SaaS dashboard.

This version is fully integrated with **Clerk Authentication** and supports **Gmail Inbox Syncing** to automatically extract academic dates from placements, bills, and exam notices with a single click.

---

## 🚀 Key Features

*   **Document-to-Task Pipeline**: Drag-and-drop support for PDF, PNG, JPEG, and TXT files.
*   **Dual OCR Strategy**: Parses text-based PDFs locally using `pdf-parse` (offline, instantaneous) and falls back to `OCR.Space` API for images and scanned documents.
*   **Gemini 1.5 Flash AI Parsing**: Understands unstructured text content and returns clean, structured task properties (title, category, priority, relative deadlines, times, summaries, and logical reasoning) using Gemini JSON Schemas.
*   **Gmail Inbox Sync**: Scans the user's real Google email inbox for keywords (deadlines, placements, exams, bills, etc.), retrieves body text, and parses tasks automatically. Includes a duplication guard to prevent duplicate task creations.
*   **Production Clerk Auth**: Wrap-around secure authentication using Clerk SSO (Google Provider) with dynamic Axios request interceptors that auto-refresh expired JWT session tokens.
*   **Interactive SaaS Dashboard**: Beautiful responsive metrics and filters for tasks (All, Today, Tomorrow, This Week, Completed, High Priority, and Category Tags).
*   **Automated AI Insights**: High-fidelity widgets summarizing total pending load, urgent items, category distribution, and task completions.
*   **Developer Mock Bypass**: Built-in mode to test all functionalities (including simulated mock Gmail syncs) immediately without configuring API credentials or Google Client IDs.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS & Vanilla CSS
*   **Routing**: React Router DOM (v6)
*   **API Client**: Axios (with custom dynamic request interceptor for Clerk token refreshing)
*   **Icons**: Lucide React
*   **Auth Provider**: `@clerk/clerk-react`

### Backend
*   **Server**: Node.js & Express.js
*   **Database**: MongoDB (Mongoose Object Modeling)
*   **Authentication**: Clerk Node SDK (`@clerk/clerk-sdk-node` with clock skew tolerance)
*   **OCR**: OCR.space API & `pdf-parse`
*   **AI Engine**: Google Gemini API (`@google/generative-ai` targeting `gemini-flash-latest`)
*   **File Upload**: Multer (In-memory buffer processing)

---

## 📂 Project Structure

```text
TaskPulse AI/
├── client/                     # Frontend React Client
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Global styles
│   │   ├── components/         # Reusable UI elements (Navbar, StatCard, GmailSyncButton, etc.)
│   │   ├── hooks/              # Custom context hooks (useAuth)
│   │   ├── pages/              # LandingPage, AuthPage, Dashboard
│   │   ├── services/           # Axios HTTP endpoints (api, auth, tasks)
│   │   └── utils/              # Date operations & formatting utilities
│   │   ├── App.jsx             # React routing table
│   │   ├── index.css           # Styling imports & variables
│   │   └── main.jsx            # React root mount point
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
│
└── server/                     # Backend Node.js Server
    ├── config/                 # DB connectors
    ├── controllers/            # Controller layers (auth, tasks, extract, gmail)
    ├── middlewares/            # Auth, Error handlers, Multer uploads
    ├── models/                 # Mongoose User and Task schemas
    ├── routes/                 # Express REST routers
    ├── services/               # OCR, Gemini, and Gmail integration pipelines
    ├── server.js               # Application entry point
    ├── package.json
    └── .env.example
```

---

## ⚙️ Environment Variables

### Backend Server (`server/.env`)

Create a `server/.env` file with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_srv_or_seedlist_connection_string
JWT_SECRET=your_jwt_secret_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OCR_SPACE_API_KEY=your_ocr_space_api_key_here
CLIENT_URL=http://localhost:5173
```

### Frontend Client (`client/.env`)

Create a `client/.env` file with the following variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

---

## 📥 Installation & Running Locally

### Prerequisites
*   Node.js (v18+)
*   MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas connection.

### Step 1: Clone the repository and install dependencies

```bash
# Navigate to backend and install packages
cd server
npm install

# Navigate to frontend and install packages
cd ../client
npm install
```

### Step 2: Set up environment files
Ensure you have created the `.env` files in both the `client/` and `server/` directories based on the `.env.example` templates.

### Step 3: Run the Application

Start the backend server:
```bash
cd server
npm run dev
```

Start the frontend Vite dev server:
```bash
cd client
npm run dev
```

Open your browser and navigate to `http://localhost:5173`. You can log in using **Demo User Mode** instantly or sign in using Clerk.

---

## ☁️ Deployment

### Backend (Render / Heroku)
1.  Connect your repository to Render.
2.  Set the start command to `npm start` (or `node server.js`).
3.  Add all environment variables (`CLERK_SECRET_KEY`, `GEMINI_API_KEY`, etc.) under the "Environment" settings tab.
4.  Ensure that `CLIENT_URL` is set to your deployed frontend domain.

### Frontend (Netlify / Vercel)
1.  Connect your repository to Vercel/Netlify.
2.  Set the build command to `npm run build` and publish directory to `dist`.
3.  Add `VITE_CLERK_PUBLISHABLE_KEY` in the environment variables settings.
