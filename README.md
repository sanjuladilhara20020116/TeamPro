# TeamPro - Weekly Report Generator & Team Dashboard

TeamPro is a full-stack MERN web application built for weekly work reporting and team progress analysis. Team members can create and submit structured weekly reports, while managers can view reports across the team using filters, submission status tracking, dashboard metrics, charts, and an optional AI assistant.

## Assignment Title

Weekly Report Generator & Team Dashboard

## Tech Stack

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

### Optional AI
- OpenAI API
- Manager-only AI chat assistant

---

## Main Features

### Authentication and Roles
- User registration
- Login and logout
- Password hashing with bcryptjs
- JWT-based secure session handling
- Role-based access control

Roles:
- Team Member
- Manager / Admin

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

### Manager Features
- View all team reports
- Filter reports by member
- Filter reports by project/category
- Filter reports by selected week
- Filter reports by date range
- Track submitted, pending, and late status
- Manage projects/categories
- Assign members to projects

### Dashboard Insights
- Total reports submitted this week
- Submission compliance rate
- Open blockers count
- Pending reports count
- Tasks completed trend chart
- Project workload distribution chart
- Submission status by member chart
- Recent activity feed

### AI Assistant
- Manager-only AI chat widget
- Summarizes team progress
- Identifies open blockers
- Explains workload distribution
- Uses backend-protected API key
- Includes local fallback summary if no OpenAI API key is configured

---

## Folder Structure

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