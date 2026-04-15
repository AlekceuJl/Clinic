export type QuestionType = 'single' | 'multiple' | 'text' | 'rating' | 'contact';

export interface QuestionCondition {
  questionId: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  contactFields?: ('name' | 'phone' | 'email')[];
  condition?: QuestionCondition;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: number;
  brandColor?: string;
  isActive: boolean;
  _isTemplate?: boolean;
  companyName?: string;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number | Record<string, string>;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Answer[];
  submittedAt: number;
}
