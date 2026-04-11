export type QuestionType = 'single' | 'multiple' | 'text' | 'rating' | 'contact';

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[]; // Used for single and multiple choice
  contactFields?: ('name' | 'phone' | 'email')[]; // Used for contact
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: number;
  brandColor?: string;
  isActive: boolean;
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
