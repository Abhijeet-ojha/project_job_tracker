import { Request, Response } from 'express';
import { Application } from '../models/Application';
import { parseJobDescription, generateResumeSuggestions } from '../services/ai.service';

// ─── Helper: get userId safely ───────────────────────────────────────────────

function getUserId(req: Request): string {
  const user = req.user;
  if (typeof user === 'string') return user;
  if (typeof user === 'object' && user !== null && 'id' in user) return (user as any).id;
  throw new Error('Invalid user on request');
}

// ─── GET /api/applications ───────────────────────────────────────────────────

export const getApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const applications = await Application.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    console.error('getApplications error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// ─── POST /api/applications ──────────────────────────────────────────────────

export const createApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const {
      company,
      role,
      status,
      dateApplied,
      location,
      seniority,
      jobUrl,
      jobDescription,
      requiredSkills,
      niceToHaveSkills,
      resumeSuggestions,
    } = req.body;

    if (!company || !role) {
      res.status(400).json({ message: 'company and role are required fields' });
      return;
    }

    const application = await Application.create({
      userId,
      company,
      role,
      status,
      dateApplied,
      location,
      seniority,
      jobUrl,
      jobDescription,
      requiredSkills,
      niceToHaveSkills,
      resumeSuggestions,
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('createApplication error:', error);
    res.status(500).json({ message: 'Server error creating application' });
  }
};

// ─── PUT /api/applications/:id ───────────────────────────────────────────────

export const updateApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!application) {
      res.status(404).json({ message: 'Application not found or not authorized' });
      return;
    }

    res.status(200).json(application);
  } catch (error) {
    console.error('updateApplication error:', error);
    res.status(500).json({ message: 'Server error updating application' });
  }
};

// ─── DELETE /api/applications/:id ────────────────────────────────────────────

export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);

    const application = await Application.findOneAndDelete({ _id: req.params.id, userId });

    if (!application) {
      res.status(404).json({ message: 'Application not found or not authorized' });
      return;
    }

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('deleteApplication error:', error);
    res.status(500).json({ message: 'Server error deleting application' });
  }
};

// ─── POST /api/applications/parse ────────────────────────────────────────────

export const parseApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobDescriptionText } = req.body;

    if (!jobDescriptionText || typeof jobDescriptionText !== 'string') {
      res.status(400).json({ message: 'jobDescriptionText (string) is required' });
      return;
    }

    // Step 1: Parse the JD into structured fields
    const parsed = await parseJobDescription(jobDescriptionText);

    // Step 2: Generate resume bullet suggestions based on parsed data
    const resumeSuggestions = await generateResumeSuggestions(
      parsed.role,
      parsed.requiredSkills,
      parsed.niceToHaveSkills
    );

    res.status(200).json({
      ...parsed,
      resumeSuggestions,
    });
  } catch (error) {
    console.error('parseApplication error:', error);
    res.status(500).json({ message: 'AI parsing failed. Please try again.' });
  }
};
