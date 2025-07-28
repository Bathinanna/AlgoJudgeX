
# AlgoJudgeX

**AI-Powered Online Judge Platform for Coding, Contests, and Career Growth**

AlgoJudgeX is a full-stack platform for coding practice, real-time contests, and career utilities. It features secure Dockerized code execution, AI-powered analysis, and comprehensive progress tracking. Built for students, professionals, and educators.

---

## ✨ Features

### Frontend (React + Tailwind)
- Modern, responsive UI for all devices
- User authentication (register, login, email verification with OTP)
- Real-time contest dashboard and problem practice
- Code editor with syntax highlighting
- Submission status, verdicts, and test case feedback
- Leaderboards and analytics
- Profile management (bio, skills, handles, profile picture)
- Admin dashboard for managing questions, contests, and users
- Real-time collaborative rooms and chat
- Password reset and email notifications

### Backend (Node.js + Express)
- RESTful API for all platform features
- User registration, login, JWT authentication, and email verification
- OTP generation, resend, and validation
- Secure password hashing (bcrypt)
- MongoDB/Mongoose for all data models (users, problems, contests, submissions, internships)
- Problem and contest management (CRUD)
- Submission evaluation and verdict system
- Dockerized code judge engine for C++, Java, Python, JavaScript
- AI-powered code analysis, hints, and feedback(Gemini AI)
- Email notifications (Nodemailer, Gmail SMTP)
- File uploads (profile pictures, etc.)
- Rate limiting, CORS, and security middleware
- Admin APIs for analytics and management

### Compiler Server
- Isolated Docker containers for code execution
- Multi-language support (C++, Java, Python, JavaScript)
- Handles custom input, standard test cases, and edge cases

---
## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bathinanna/AlgoJudegeX.git
   cd CodeCrush
   ```
2. **Set up environment variables:**
   - Create `.env` files in `/server` and `/client` (see `.env.example` for reference)
3. **Install dependencies & run:**
   - Backend: `cd server && npm install && npm run dev`
   - Frontend: `cd client && npm install && npm run dev`
   - Compiler: `cd compiler-server && npm install && npm run dev`
4. **(Optional) Run with Docker:**
   ```bash
   docker-compose up --build
   ```

## 📬 Contact

**Bathinanna**  
Full Stack Developer | AI Explorer  
GitHub: [Bathinanna](https://github.com/Bathinanna)  
Email: [bathinibathinanna@gmail.com](mailto:bathinibathinanna@gmail.com)

---







