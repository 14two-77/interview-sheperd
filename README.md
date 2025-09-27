# Interview Shepherd

Interview Shepherd is a web application that helps users practice job interviews with an AI-powered interviewer. The platform simulates realistic interview scenarios, provides instant feedback, and supports multiple job roles and languages through customizable job post to be used for interviews.

## Features

- AI-driven interviewer simulates real interview flow and adapts to user responses
- Users can create and manage job scenarios
- Resume upload for tailored interview questions
- Real-time chat interface with AI
- AI-evalutaion with scoring and suggestions
- User authentication/authorization and account management

## Screenshots

<img src="/screenshots/login.png" alt="Login page (mobile)" width="360" />
<img src="/screenshots/job-post.png" alt="Job post page (desktop)" width="900" />
<img src="/screenshots/pre-interview.png" alt="Resume input (desktop)" width="900" />
<img src="/screenshots/interview.png" alt="Interview page (desktop)" width="900" />

## Tech Stack

- **Frontend:** HTML, CSS (Tailwind), JavaScript
- **Backend:** Node.js, Express, MongoDB
- **AI Provider:** Google Gemini 2.5 Flash
- **Chat:** SSE (Server Side Event)

## Getting Started

1. Clone the repository.
2. Set up environment variables in `backend/.env` (see `.env.template`) and config in `frontend/config.js`.
3. Install dependencies in `backend` folders.
4. Start the backend server:
   ```sh
   cd backend
   npm install
   node server.js
   ```
5. Serve the frontend (e.g., with Live Server or any static server).

## Project Origin & Contraints

The project is a final project in **Intro to CEDT** course, part of [Computer Engineering and Digital Technology](https://www.cp.eng.chula.ac.th/cedt) major. The group of 6 random students must contribute to the project in concept of **LLM in Web Application** within two weeks (along with serveral mid-term/final exams). The project must

- Not use any library except for ExpressJS and database-related library.
- Be a Single Page Application with vanila JavaScript.
- Be responsive for all platform.
- Contain full CRUD operations.

> [!NOTE]
> Despite the packed schedule and limited experience, we were able to deliver this in three days, thankfully. I appreciate everyone's determination throughout the project. It was a very tough task for team who had only four three-hour web development classes, and the project period overlapped with actual web development class. Nevertheless, It was so much fun working with you all. — @14two-77
