import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Survey, SurveyResponse, Question, QuestionType } from '../types';

export function useSurveys() {
  const rawSurveys = useQuery(api.surveys.list);
  const saveMut = useMutation(api.surveys.save);
  const removeMut = useMutation(api.surveys.remove);

  const surveys: Survey[] = (rawSurveys ?? []).map((s) => ({
    id: s.clientId,
    title: s.title,
    description: s.description,
    questions: s.questions.map((q): Question => ({
      ...q,
      type: q.type as QuestionType,
      contactFields: q.contactFields as Question['contactFields'],
    })),
    createdAt: s.createdAt,
    brandColor: s.brandColor,
    isActive: s.isActive,
  }));

  const isLoading = rawSurveys === undefined;

  const saveSurvey = (survey: Survey) => {
    saveMut({
      clientId: survey.id,
      title: survey.title,
      description: survey.description,
      questions: survey.questions,
      createdAt: survey.createdAt,
      brandColor: survey.brandColor,
      isActive: survey.isActive,
    });
  };

  const deleteSurvey = (id: string) => {
    removeMut({ clientId: id });
  };

  const getSurvey = (id: string) => surveys.find((s) => s.id === id);

  return { surveys, saveSurvey, deleteSurvey, getSurvey, isLoading };
}

export function useResponses(surveyId?: string) {
  const rawResponses = useQuery(
    api.responses.listBySurvey,
    surveyId ? { surveyId } : "skip"
  );
  const submitMut = useMutation(api.responses.submit);

  const responses: SurveyResponse[] = (rawResponses ?? []).map((r) => ({
    id: r._id,
    surveyId: r.surveyId,
    answers: r.answers,
    submittedAt: r.submittedAt,
  }));

  const saveResponse = (response: SurveyResponse) => {
    submitMut({
      surveyId: response.surveyId,
      answers: response.answers,
      submittedAt: response.submittedAt,
    });
  };

  return { responses, saveResponse };
}
