import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurveys, useResponses } from '../store/useStore';
import { Survey, Answer } from '../types';
import { motion } from 'framer-motion';
import { Check, Stethoscope } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';

export default function SurveyView() {
  const { id } = useParams();
  const { getSurvey, isLoading } = useSurveys();
  const { saveResponse } = useResponses(id);

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoading) return;
    if (id) {
      const s = getSurvey(id);
      if (s) setSurvey(s);
    }
  }, [id, isLoading]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Загрузка...</div>;
  }

  if (!survey) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Опрос не найден</div>;
  }

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr[questionId];
        return newErr;
      });
    }
  };

  const handleMultipleAnswer = (questionId: string, option: string, checked: boolean) => {
    setAnswers(prev => {
      const current = (prev[questionId] as string[]) || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, option] };
      } else {
        return { ...prev, [questionId]: current.filter(o => o !== option) };
      }
    });
    if (errors[questionId]) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr[questionId];
        return newErr;
      });
    }
  };

  const handleContactAnswer = (questionId: string, field: string, val: string) => {
    setAnswers(prev => {
      const current = (prev[questionId] as Record<string, string>) || {};
      return { ...prev, [questionId]: { ...current, [field]: val } };
    });
    if (errors[questionId]) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr[questionId];
        return newErr;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    survey.questions.forEach(q => {
      if (q.required) {
        const val = answers[q.id];
        if (q.type === 'contact') {
          const contactVal = (val as Record<string, string>) || {};
          const missing = q.contactFields?.some(f => !contactVal[f] || contactVal[f].trim() === '');
          if (missing || !q.contactFields?.length) {
            newErrors[q.id] = 'Пожалуйста, заполните все контактные данные';
          }
        } else if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[q.id] = 'Это обязательный вопрос';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      // Scroll to first error
      const firstErrorId = Object.keys(errors)[0];
      document.getElementById(`q-${firstErrorId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value
    }));

    saveResponse({
      id: uuidv4(),
      surveyId: survey.id,
      answers: formattedAnswers,
      submittedAt: Date.now()
    });

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-sans">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center max-w-md w-full"
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white"
            style={{ backgroundColor: survey.brandColor || '#0ea5e9' }}
          >
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-slate-800">Спасибо за ответ!</h2>
          <p className="text-slate-500">Ваше мнение очень важно для нас.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-sky-100/50 to-transparent pointer-events-none" />
      
      <header className="bg-white/80 backdrop-blur-md py-6 px-6 border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3" style={{ color: survey.brandColor || '#0ea5e9' }}>
          <div className="p-2 rounded-xl" style={{ backgroundColor: `${survey.brandColor || '#0ea5e9'}15` }}>
            <Stethoscope className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">City Med</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 relative z-0">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">{survey.title}</h1>
          {survey.description && (
            <p className="text-base sm:text-lg text-slate-600">{survey.description}</p>
          )}
        </div>

        <div className="space-y-8 sm:space-y-12">
          {survey.questions.map((q, index) => (
            <motion.div 
              key={q.id}
              id={`q-${q.id}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-slate-100"
            >
              <h3 className="text-xl font-medium text-slate-800 mb-2 leading-snug">
                {q.title}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              {q.description && <p className="text-slate-500 mb-6">{q.description}</p>}
              {!q.description && <div className="h-4" />}

              {q.type === 'single' && (
                <div className="space-y-3">
                  {q.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name={q.id} 
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleAnswer(q.id, opt)}
                        className="w-5 h-5 text-sky-600 focus:ring-sky-500"
                        style={{ accentColor: survey.brandColor || '#0ea5e9' }}
                      />
                      <span className="text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'multiple' && (
                <div className="space-y-3">
                  {q.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={(answers[q.id] || []).includes(opt)}
                        onChange={(e) => handleMultipleAnswer(q.id, opt, e.target.checked)}
                        className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
                        style={{ accentColor: survey.brandColor || '#0ea5e9' }}
                      />
                      <span className="text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'text' && (
                <textarea 
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  placeholder="Ваш ответ..."
                  className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:ring-2 focus:border-transparent resize-y min-h-[120px] transition-shadow"
                  style={{ '--tw-ring-color': survey.brandColor || '#0ea5e9' } as React.CSSProperties}
                />
              )}

              {q.type === 'rating' && (
                <div className="flex flex-wrap gap-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => {
                    const isSelected = answers[q.id] === n;
                    return (
                      <button
                        key={n}
                        onClick={() => handleAnswer(q.id, n)}
                        className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-base sm:text-lg font-medium transition-all",
                          isSelected 
                            ? "text-white shadow-md scale-105" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                        style={isSelected ? { backgroundColor: survey.brandColor || '#0ea5e9' } : {}}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>
              )}

              {q.type === 'contact' && (
                <div className="space-y-4">
                  {q.contactFields?.includes('name') && (
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Имя</label>
                      <input 
                        type="text"
                        value={answers[q.id]?.name || ''}
                        onChange={(e) => handleContactAnswer(q.id, 'name', e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:border-transparent transition-shadow"
                        style={{ '--tw-ring-color': survey.brandColor || '#0ea5e9' } as React.CSSProperties}
                      />
                    </div>
                  )}
                  {q.contactFields?.includes('phone') && (
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Телефон</label>
                      <input 
                        type="tel"
                        value={answers[q.id]?.phone || ''}
                        onChange={(e) => handleContactAnswer(q.id, 'phone', e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:border-transparent transition-shadow"
                        style={{ '--tw-ring-color': survey.brandColor || '#0ea5e9' } as React.CSSProperties}
                      />
                    </div>
                  )}
                  {q.contactFields?.includes('email') && (
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Email</label>
                      <input 
                        type="email"
                        value={answers[q.id]?.email || ''}
                        onChange={(e) => handleContactAnswer(q.id, 'email', e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:border-transparent transition-shadow"
                        style={{ '--tw-ring-color': survey.brandColor || '#0ea5e9' } as React.CSSProperties}
                      />
                    </div>
                  )}
                </div>
              )}

              {errors[q.id] && (
                <p className="text-red-500 text-sm mt-3">{errors[q.id]}</p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-8 py-4 rounded-xl text-white font-medium text-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: survey.brandColor || '#0ea5e9' }}
          >
            Отправить ответы
          </button>
        </div>
      </main>
    </div>
  );
}
