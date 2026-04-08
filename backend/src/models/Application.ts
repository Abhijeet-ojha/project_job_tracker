import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';
  dateApplied: Date;
  location: string;
  seniority: string;
  jobUrl: string;
  jobDescription: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  resumeSuggestions: string[];
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    dateApplied: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    seniority: {
      type: String,
      default: '',
      trim: true,
    },
    jobUrl: {
      type: String,
      default: '',
      trim: true,
    },
    jobDescription: {
      type: String,
      default: '',
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    niceToHaveSkills: {
      type: [String],
      default: [],
    },
    resumeSuggestions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
