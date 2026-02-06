
export interface StudentInfo {
  name: string;
  rollNumber: string;
  subject: string;
  class: string;
  examName: string;
  date: string;
}

export interface QuestionGrade {
  questionNumber: string;
  studentAnswer: string;
  correctAnswer: string;
  marksObtained: number;
  totalMarks: number;
  feedback: string;
}

export interface EvaluationReport {
  studentInfo: StudentInfo;
  grades: QuestionGrade[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  generalFeedback: string;
}

export interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

export interface HistoryItem {
  id: string;
  institution_id: string;
  timestamp: number;
  report: EvaluationReport;
  pages_processed: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits: number;
  totalEvaluations: number;
  freeTrialUsed: boolean;
  joinedDate: number;
  role: 'institution' | 'admin';
}

export interface BillingInfo {
  pendingAmount: number;
  dueDate: string;
  isPaid: boolean;
  sheetsEvaluatedThisMonth: number;
}
