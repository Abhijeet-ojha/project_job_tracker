# Job Tracker Application

🔗 **Live App:** [https://project-job-tracker.vercel.app](https://project-job-tracker.vercel.app)

> ⚠️ **Note:** The backend is hosted on Render's free tier. The first request after a period of inactivity may take **up to 2 minutes** to respond while the server spins up. Please be patient on first load.


## How to Run the Project

1. **Prerequisites:** Ensure you have Node.js and MongoDB installed or a Mongo database available.
2. **Backend Setup:**
   - Navigate to the `backend` directory: `cd backend`
   - Run `npm install` to install the dependencies.
   - Set up your environment variables by creating a `.env` file based on the `.env.example` structure.
   - Start the backend server: `npm run dev` (it will be accessible on port 5000).
3. **Frontend Setup:**
   - Navigate to the `frontend` directory: `cd frontend`
   - Run `npm install` to install the dependencies.
   - Start the frontend server: `npm run dev` (it will be accessible at http://localhost:5173).

## Environment Variables

You need to create a `.env` file in the `backend/` directory with the following variables:

- `PORT` - The port for the backend server (typically `5000`).
- `MONGO_URI` - MongoDB connection string (e.g., `mongodb+srv://<user>:<password>@cluster/job_tracker`).
- `JWT_SECRET` - A strong secret key used for signing JWTs.
- `GEMINI_API_KEY` - API key for the Gemini API.
- `CLIENT_URL` - The application's frontend URLs (e.g., `http://localhost:5173,https://your-frontend-domain.vercel.app`).

## Decisions Made

- **Tech Stack**: Built natively with React, TypeScript, and Express.js with a MongoDB backend. The full usage of TypeScript from the DB models to the components guarantees strict type safety.
- **UI Architectural Overhaul**: Replaced the traditional endless vertical Kanban board columns with a "Stacked Deck" UI pattern inspired by Apple Wallet. Kanban columns are permanently stacked to conserve horizontal space. Detailed views of the columns are moved into isolated glassmorphic overlay sheets for a clean context-switch.
- **Animation Framework**: Employed Framer Motion heavily to provide Apple-ecosystem-level fluid motion: using specifically tailored physics (spring stiffness, damping, mass offsets) to mimic tangible momentum in layout switching and hover effects.
- **Custom Drag Paradigms**: Implemented a hybrid drag-and-drop system. While the columns employ standard `Droppable` zones, picking up cards out of the focused floating overlay employs custom pointer-event hit-testing, a long-press timing threshold, and a custom "Drag Ghost" cursor tracker. This unifies the UX of "removing something from a modal" to "dropping it on the background map".
