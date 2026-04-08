import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import applicationRoutes from './routes/application.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "https://project-job-tracker.vercel.app",
];

console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked Origin:", origin);
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ─── Database ─────────────────────────────────────────────────────────────────
connectDB();

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Job Tracker API is running' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
