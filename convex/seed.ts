import { mutation } from "./_generated/server";

const templates = [
  {
    clientId: 'template-1',
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
    clientId: 'template-2',
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
    clientId: 'template-3',
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
    clientId: 'template-4',
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
    clientId: 'template-5',
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

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("surveys").first();
    if (existing) {
      return "Templates already exist, skipping seed.";
    }
    for (const template of templates) {
      await ctx.db.insert("surveys", template);
    }
    return "Seeded 5 survey templates.";
  },
});
