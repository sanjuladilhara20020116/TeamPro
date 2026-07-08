# 📊 TeamPro - Weekly Report Generator & Team Dashboard
<p align="center">
  <img src="frontend\public\images\teamproLogo2.png" alt="TeamPro Banner" width="50%" hieght="50%" />
</p>

TeamPro is a full-stack MERN web application built for weekly work reporting and team progress analysis. Team members can create and submit structured weekly reports, while managers can view reports across the team using filters, submission status tracking, dashboard metrics, charts, and an optional AI assistant.

<p align="center">
  <strong>Weekly Reports • Team Dashboard • Role-Based Access • Visual Insights • AI Assistant</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS-38bdf8?style=for-the-badge&logo=tailwindcss" />
</p>

---

## 📌 Assignment Title

**Weekly Report Generator & Team Dashboard**

---

## 🧰 Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Recharts
- React Hot Toast
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- express-validator

###  AI Chat Assistant

- OpenAI API


---

## ✨ Main Features

### Authentication and Roles

- User registration
- Login and logout
- Password hashing with bcryptjs
- JWT-based secure session handling
- Role-based access control

Roles:

- Team Member
- Manager / Admin

---

### Team Member Features

- Create weekly report
- Save report as draft
- Edit own report
- Submit report
- View own report history
- Filter own reports by status and project

Weekly report fixed fields:

- Week start date
- Week end date
- Project/category
- Tasks completed
- Tasks planned for next week
- Blockers/challenges
- Hours worked
- Notes/links

---

### Manager Features

- View all team reports
- Filter reports by member
- Filter reports by project/category
- Filter reports by selected week
- Filter reports by date range
- Track submitted, pending, and late status
- Manage projects/categories
- Assign members to projects

---

### Dashboard Insights

- Total reports submitted this week
- Submission compliance rate
- Open blockers count
- Pending reports count
- Tasks completed trend chart
- Project workload distribution chart
- Submission status by member chart
- Recent activity feed

---

### AI Chat Assistant

- Manager-only AI chat widget
- Summarizes team progress
- Identifies open blockers
- Explains workload distribution
- Uses backend-protected API key
- Includes local fallback summary if no OpenAI API key is configured

---

## 📁 Folder Structure

```txt
TeamPro/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   └── pages/
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# ⚙️ Setup Instructions

This section explains how to install dependencies, run the frontend, run the backend, and run the database.

---

## 1️⃣ Installing Dependencies

### Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_LINK
cd TeamPro
```

---

### Install Backend Dependencies

```bash
cd backend
npm install
```

---

### Install Frontend Dependencies

Open another terminal from the root folder:

```bash
cd frontend
npm install
```

---

## 2️⃣ Running the Backend

### Step 1: Create Backend Environment File

Inside the `backend` folder, create a `.env` file.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_generated_jwt_secret
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key_optional
OPENAI_MODEL=gpt-4.1-mini
```

You can use `backend/.env.example` as a reference.

---

### Step 2: Start Backend Server

From the `backend` folder, run:

```bash
npm run dev
```

Backend will run on:

```txt
http://localhost:5000
```

Test backend in browser:

```txt
http://localhost:5000
```

Expected response:

```txt
TeamPro Weekly Report Dashboard API is running...
```

---

## 3️⃣ Running the Frontend

### Step 1: Create Frontend Environment File

Inside the `frontend` folder, create a `.env` file.

```env
VITE_API_URL=http://localhost:5000/api
```

You can use `frontend/.env.example` as a reference.

---

### Step 2: Start Frontend Server

From the `frontend` folder, run:

```bash
npm run dev
```

Frontend will run on:

```txt
http://localhost:5173
```

Open the application in your browser:

```txt
http://localhost:5173
```

---

## 4️⃣ Running the Database

This project uses **MongoDB** as the database.

You can run the database using either:

- MongoDB Atlas
- Local MongoDB

---

### Option A: MongoDB Atlas

1. Go to MongoDB Atlas.
2. Create a new cluster.
3. Create a database user.
4. Allow network access.
5. Copy your connection string.
6. Add the connection string to `backend/.env`.

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/teampro?retryWrites=true&w=majority
```

Then run the backend:

```bash
cd backend
npm run dev
```

---

### Option B: Local MongoDB

Make sure MongoDB is installed and running on your computer.

Use this connection string in `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/teampro
```

Then run the backend:

```bash
cd backend
npm run dev
```

---

## ✅ Quick Run Summary

Open two terminals.

### Terminal 1 - Backend

```bash
cd backend
npm install
npm run dev
```

### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database

Use MongoDB Atlas or local MongoDB and add the connection string to:

```txt
backend/.env
```

---

## 🔐 Environment Variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_generated_jwt_secret
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key_optional
OPENAI_MODEL=gpt-4.1-mini
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Important:

```txt
Do not upload real .env files to GitHub.
Only upload .env.example files.
```

---

## 👥 Demo Accounts

You can register users directly from the application.

Example manager:

```txt
Email: manager@test.com
Password: 123456
Role: Manager
```

Example team member:

```txt
Email: member@test.com
Password: 123456
Role: Team Member
```

---

## 🧪 API Overview

### Auth APIs

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

---

### Project APIs

```txt
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
PATCH  /api/projects/:id/assign
```

---

### Report APIs

```txt
POST  /api/reports
GET   /api/reports/my
GET   /api/reports/my/:id
PUT   /api/reports/:id
PATCH /api/reports/:id/submit
```

---

### Manager Dashboard APIs

```txt
GET /api/dashboard/team-reports
GET /api/dashboard/submission-status
GET /api/dashboard/filters
GET /api/dashboard/summary
GET /api/dashboard/tasks-trend
GET /api/dashboard/project-workload
GET /api/dashboard/recent-activity
```

---

### AI API

```txt
POST /api/ai/chat
```

---

## 🛡️ Role-Based Access

### Team Members Can:

- Manage only their own reports
- Create weekly reports
- Save drafts
- Submit reports
- View own report history

### Managers/Admins Can:

- View all team reports
- Filter reports
- Track submitted, pending, and late status
- Manage projects/categories
- Assign members to projects
- Access dashboard analytics
- Use AI assistant

---

## 🧠 AI Assistant Approach

The AI assistant is implemented as a manager-only feature.

The frontend chat widget sends the manager’s question to a protected Express API endpoint. The backend fetches relevant submitted weekly reports from MongoDB, prepares a compact report context, and sends it to the AI model.

### Privacy Considerations

- OpenAI API key is stored only in backend `.env`
- Passwords are never sent to the AI model
- JWT tokens are never sent to the AI model
- Only selected report fields are used as AI context
- If no OpenAI API key is configured, the system returns a local generated summary

---

## 🗄️ Database Design Overview

Main collections:

- Users
- Projects
- Weekly Reports

Relationships:

- One user can create many weekly reports
- One project can have many weekly reports
- Projects can have many assigned members
- Users can be assigned to many projects

---

## 📊 Dashboard Visuals

The manager dashboard includes:

- Summary metric cards
- Tasks completed trend line chart
- Project workload pie chart
- Submission status bar chart
- Recent activity feed

Chart library used:

```txt
Recharts
```

---

## 🧾 Weekly Report Structure

All team members use the same fixed report structure.

```txt
1. Week start date
2. Week end date
3. Project/category
4. Tasks completed
5. Tasks planned for next week
6. Blockers/challenges
7. Hours worked
8. Notes/links
```

Users cannot add custom fields or reorder fields.

---




