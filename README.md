# ClientIQ — Mini CRM Lead Management System

A professional, full-stack Client Lead Management System built with Node.js, Express, MongoDB, and Vanilla JavaScript. Clean SaaS-style dashboard UI inspired by modern CRM tools.

![ClientIQ Dashboard](./preview.png)

---

## Features

- **Authentication** — JWT-based login with bcrypt password hashing
- **Lead Management** — Add, edit, delete, and search leads
- **Status Pipeline** — New → Contacted → Proposal → Converted → Lost
- **Activity Notes** — Add/delete notes with types (Note, Call, Email, Meeting)
- **Dashboard Stats** — Total leads, conversion rate, new leads, converted count
- **Conversion Funnel** — Visual pipeline breakdown
- **Search & Filter** — Real-time search + filter by status
- **Toast Notifications** — Success/error feedback
- **Responsive Design** — Mobile + desktop

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

## Project Structure

```
clientiq-crm/
├── client/                  # Frontend (serve with any static server)
│   ├── index.html           # Redirect to login
│   ├── login.html           # Login page
│   ├── dashboard.html       # Main dashboard
│   ├── css/
│   │   └── styles.css       # All styles
│   └── js/
│       ├── auth.js          # JWT auth module
│       ├── api.js           # API communication
│       ├── ui.js            # UI rendering components
│       └── app.js           # Main application logic
│
└── server/                  # Backend
    ├── server.js            # Entry point
    ├── .env                 # Environment variables
    ├── package.json
    ├── models/
    │   ├── User.js          # User schema
    │   ├── Lead.js          # Lead schema
    │   └── Note.js          # Note schema
    ├── controllers/
    │   ├── authController.js
    │   ├── leadController.js
    │   └── noteController.js
    ├── routes/
    │   ├── auth.js
    │   ├── leads.js
    │   └── notes.js
    └── middleware/
        ├── auth.js          # JWT protection middleware
        └── errorHandler.js  # Global error handler
```

---

## Quick Start

### Prerequisites
- **Node.js** v18+ — https://nodejs.org
- **MongoDB** v6+ — https://www.mongodb.com/try/download/community
- **npm** (comes with Node.js)

### 1. Clone / Extract

```bash
# If cloning from GitHub:
git clone https://github.com/yourusername/clientiq-crm.git
cd clientiq-crm
```

### 2. Setup the Backend

```bash
cd server
npm install
```

**Configure environment** — edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/clientiq
JWT_SECRET=your_super_secret_key_here_change_this
JWT_EXPIRES_IN=7d
```

**Start MongoDB** (if running locally):
```bash
# macOS with Homebrew:
brew services start mongodb-community

# Ubuntu/Debian:
sudo systemctl start mongod

# Windows: Start MongoDB service from Services panel
```

**Start the server:**
```bash
npm start
# or for auto-restart during development:
npm run dev
```

You'll see:
```
✅ MongoDB connected
✅ Default admin seeded: admin@clientiq.com / admin123
🚀 Server running on http://localhost:5000
```

### 3. Setup the Frontend

The frontend is pure HTML/CSS/JS — no build step needed.

**Option A — Simple (open directly in browser):**
```bash
# macOS:
open client/login.html

# Or just drag client/login.html into your browser
```
> ⚠️ Note: For full functionality, use a local server (Option B) to avoid CORS issues.

**Option B — Local static server (recommended):**
```bash
# Using npx (no install needed):
cd client
npx serve .

# Or using Python:
cd client
python3 -m http.server 3000

# Or VS Code: Install "Live Server" extension, right-click login.html → Open with Live Server
```

Visit: **http://localhost:3000/login.html**

### 4. Login

| Field | Value |
|-------|-------|
| Email | `admin@clientiq.com` |
| Password | `admin123` |

---

## API Reference

All protected routes require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/me` | Get current user |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | Get all leads (supports `?status=&search=`) |
| POST | `/api/leads` | Create a lead |
| PUT | `/api/leads/:id` | Update a lead |
| DELETE | `/api/leads/:id` | Delete a lead + its notes |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes/:leadId` | Get notes for a lead |
| POST | `/api/notes` | Create a note |
| DELETE | `/api/notes/:id` | Delete a note |

---

## Database Schemas

### Lead
```js
{
  name: String,          // required
  email: String,         // required
  phone: String,
  company: String,
  source: Enum,          // website | referral | social | email | cold_call | other
  status: Enum,          // new | contacted | proposal | converted | lost
  value: Number,         // deal value in $
  createdAt: Date
}
```

### Note
```js
{
  leadId: ObjectId,      // ref: Lead
  content: String,       // required
  author: String,
  type: Enum,            // note | call | email | meeting
  createdAt: Date
}
```

---

## Configuration

### Change API URL
Edit the first line of `client/js/app.js`:
```js
const API_BASE = 'http://localhost:5000/api'; // ← Change this
```

### Use MongoDB Atlas (cloud)
In `server/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/clientiq?retryWrites=true&w=majority
```

---

## Deployment

### Backend (Render / Railway / Heroku)
1. Push server folder to GitHub
2. Set environment variables in your hosting dashboard
3. Set start command: `node server.js`

### Frontend (Netlify / Vercel / GitHub Pages)
1. Update `API_BASE` in `client/js/app.js` to your deployed backend URL
2. Deploy the `client/` folder as a static site

---

## License

MIT — free to use, modify, and distribute.
