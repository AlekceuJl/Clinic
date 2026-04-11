import { useState, useEffect } from 'react';
import { Survey, SurveyResponse } from '../types';

const SURVEYS_KEY = 'citymed_surveys';
const RESPONSES_KEY = 'citymed_responses';

// Initial Templates
const templates: Survey[] = [
  {
    id: 'template-1',
    title: 'Оценка качества обслуживания',
    description: 'Помогите нам стать лучше! Оцените ваш последний визит в City Med.',
    createdAt: Date.now() - 100000,
    isActive: true,
    brandColor: '#0ea5e9',
    questions: [
      { id: 'q1', type: 'rating', title: 'Как вы оцениваете работу администраторов?', required: true },
      { id: 'q2', type: 'single', title: 'Было ли вам комфортно в зоне ожидания?', required: true, options: ['Да, очень комфортно', 'Нормально', 'Нет, было неудобно'] },
      { id: 'q3', type: 'text', title: 'Что нам стоит улучшить в сервисе?', required: false }
    ]
  },
  {
    id: 'template-2',
    title: 'Отзыв о приеме врача',
    description: 'Нам важно знать ваше мнение о компетентности и отношении наших специалистов.',
    createdAt: Date.now() - 80000,
    isActive: true,
    brandColor: '#10b981',
    questions: [
      { id: 'q1', type: 'single', title: 'Врач понятно объяснил диагноз и план лечения?', required: true, options: ['Да, абсолютно понятно', 'Остались вопросы', 'Ничего не понял(а)'] },
      { id: 'q2', type: 'rating', title: 'Оцените вежливость и тактичность врача', required: true },
      { id: 'q3', type: 'multiple', title: 'Что вам понравилось на приеме?', required: false, options: ['Внимательность', 'Профессионализм', 'Ответы на все вопросы', 'Отсутствие спешки'] },
      { id: 'q4', type: 'contact', title: 'Оставьте контакты, если хотите, чтобы главврач связался с вами', required: false, contactFields: ['name', 'phone'] }
    ]
  },
  {
    id: 'template-3',
    title: 'Анкета первичного пациента',
    description: 'Пожалуйста, ответьте на несколько вопросов перед вашим первым приемом.',
    createdAt: Date.now() - 60000,
    isActive: true,
    brandColor: '#8b5cf6',
    questions: [
      { id: 'q1', type: 'contact', title: 'Ваши контактные данные', required: true, contactFields: ['name', 'phone', 'email'] },
      { id: 'q2', type: 'single', title: 'Откуда вы о нас узнали?', required: true, options: ['Рекомендация друзей/знакомых', 'Поиск в интернете', 'Социальные сети', 'Реклама на улице', 'Другое'] },
      { id: 'q3', type: 'multiple', title: 'Какие услуги вас интересуют?', required: false, options: ['Терапия', 'Стоматология', 'Косметология', 'Анализы', 'Диагностика (УЗИ, МРТ)'] }
    ]
  },
  {
    id: 'template-4',
    title: 'Оценка дневного стационара',
    description: 'Оцените условия пребывания и работу медсестер в нашем стационаре.',
    createdAt: Date.now() - 40000,
    isActive: true,
    brandColor: '#f59e0b',
    questions: [
      { id: 'q1', type: 'rating', title: 'Оцените чистоту и комфорт в палате', required: true },
      { id: 'q2', type: 'rating', title: 'Оцените безболезненность процедур (капельницы, уколы)', required: true },
      { id: 'q3', type: 'text', title: 'Имя медсестры, которую вы хотели бы поблагодарить (если помните)', required: false }
    ]
  },
  {
    id: 'template-5',
    title: 'Индекс лояльности (NPS)',
    description: 'Короткий опрос о вашей готовности рекомендовать нашу клинику.',
    createdAt: Date.now() - 20000,
    isActive: true,
    brandColor: '#f43f5e',
    questions: [
      { id: 'q1', type: 'rating', title: 'С какой вероятностью вы порекомендуете City Med своим друзьям и близким?', required: true },
      { id: 'q2', type: 'text', title: 'Что является основной причиной вашей оценки?', required: true }
    ]
  }
];

function initSurveys(): Survey[] {
  const stored = localStorage.getItem(SURVEYS_KEY);
  if (stored) {
    let parsed = JSON.parse(stored);
    
    // Fix corrupted templates (if they were accidentally overwritten with 0 questions)
    parsed = parsed.map((p: Survey) => {
      const template = templates.find(t => t.id === p.id);
      if (template && p.questions.length === 0) {
        return template;
      }
      return p;
    });

    // Force inject templates if they are missing
    const missingTemplates = templates.filter(t => !parsed.some((p: Survey) => p.id === t.id));
    if (missingTemplates.length > 0) {
      parsed = [...missingTemplates, ...parsed];
    }
    
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(parsed));
    return parsed;
  }
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(templates));
  return templates;
}

export function useSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>(initSurveys);

  const saveSurvey = (survey: Survey) => {
    setSurveys(prev => {
      const exists = prev.find(s => s.id === survey.id);
      const updated = exists 
        ? prev.map(s => s.id === survey.id ? survey : s)
        : [...prev, survey];
      localStorage.setItem(SURVEYS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteSurvey = (id: string) => {
    setSurveys(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(SURVEYS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getSurvey = (id: string) => surveys.find(s => s.id === id);

  return { surveys, saveSurvey, deleteSurvey, getSurvey };
}

function initResponses(): SurveyResponse[] {
  const stored = localStorage.getItem(RESPONSES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function useResponses(surveyId?: string) {
  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    const all = initResponses();
    return surveyId ? all.filter(r => r.surveyId === surveyId) : all;
  });

  const saveResponse = (response: SurveyResponse) => {
    const allResponses = initResponses();
    const updated = [...allResponses, response];
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(updated));
    if (!surveyId || response.surveyId === surveyId) {
      setResponses(prev => [...prev, response]);
    }
  };

  return { responses, saveResponse };
}
