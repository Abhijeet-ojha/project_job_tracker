import api from './axios';

export interface CreateApplicationPayload {
  company: string;
  role: string;
  status?: string;
  dateApplied?: string;
  location?: string;
  seniority?: string;
  jobUrl?: string;
  jobDescription?: string;
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  resumeSuggestions?: string[];
}

export interface ParseJobDescriptionResponse {
  company: string;
  role: string;
  location: string;
  seniority: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  resumeSuggestions: string[];
}

export const getApplications = () => api.get('/applications');

export const createApplication = (payload: CreateApplicationPayload) =>
  api.post('/applications', payload);

export const updateApplication = (id: string, payload: Partial<CreateApplicationPayload>) =>
  api.put(`/applications/${id}`, payload);

export const deleteApplication = (id: string) =>
  api.delete(`/applications/${id}`);

export const parseJobDescription = (jobDescriptionText: string) =>
  api.post<ParseJobDescriptionResponse>('/applications/parse', { jobDescriptionText });
