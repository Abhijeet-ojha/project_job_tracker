export type ColumnId = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

export interface Application {
  id: string;           // maps to MongoDB _id
  company: string;
  role: string;
  dateApplied: string;
  skills: string[];     // maps to requiredSkills
  location?: string;
  seniority?: string;
  columnId: ColumnId;   // derived from status
}

export const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'applied', title: 'Applied' },
  { id: 'screening', title: 'Phone Screen' },
  { id: 'interview', title: 'Interview' },
  { id: 'offer', title: 'Offer' },
  { id: 'rejected', title: 'Rejected' },
];

// Backend status ↔ UI columnId mapping helpers
export function statusToColumnId(status: string): ColumnId {
  return status.toLowerCase() as ColumnId;
}

export function columnIdToStatus(columnId: ColumnId): string {
  return columnId.charAt(0).toUpperCase() + columnId.slice(1);
}
