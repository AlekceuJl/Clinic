import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSurveys, useResponses } from '../store/useStore';
import { ArrowLeft, Users, Star, BarChart2, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as XLSX from 'xlsx';

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSurvey } = useSurveys();
  const { responses } = useResponses(id);
  
  const survey = useMemo(() => id ? getSurvey(id) : null, [id, getSurvey]);

  if (!survey) {
    return <div className="min-h-screen flex items-center justify-center">Опрос не найден</div>;
  }

  const totalResponses = responses.length;

  const getQuestionAnalytics = (questionId: string, type: string) => {
    const answers = responses.map(r => r.answers.find(a => a.questionId === questionId)?.value).filter(v => v !== undefined && v !== null && v !== '');
    
    if (answers.length === 0) return null;

    if (type === 'rating') {
      const sum = answers.reduce((acc, val) => acc + Number(val), 0);
      const avg = (sum / answers.length).toFixed(1);
      
      const distribution = [1,2,3,4,5,6,7,8,9,10].map(n => ({
        name: String(n),
        count: answers.filter(a => Number(a) === n).length
      }));

      return { avg, distribution, total: answers.length };
    }

    if (type === 'single' || type === 'multiple') {
      const counts: Record<string, number> = {};
      answers.forEach(ans => {
        if (Array.isArray(ans)) {
          ans.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
        } else {
          counts[ans as string] = (counts[ans as string] || 0) + 1;
        }
      });

      const distribution = Object.entries(counts).map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / answers.length) * 100)
      })).sort((a, b) => b.count - a.count);

      return { distribution, total: answers.length };
    }

    if (type === 'text') {
      return { answers: answers as string[], total: answers.length };
    }

    if (type === 'contact') {
      return { answers: answers as Record<string, string>[], total: answers.length };
    }

    return null;
  };

  const overallAvgRating = useMemo(() => {
    const ratingQuestions = survey.questions.filter(q => q.type === 'rating');
    if (ratingQuestions.length === 0 || totalResponses === 0) return null;

    let totalSum = 0;
    let totalCount = 0;

    ratingQuestions.forEach(q => {
      const stats = getQuestionAnalytics(q.id, 'rating');
      if (stats && 'avg' in stats) {
        totalSum += Number(stats.avg) * stats.total;
        totalCount += stats.total;
      }
    });

    return totalCount > 0 ? (totalSum / totalCount).toFixed(1) : null;
  }, [survey, responses]);

  const brandColor = survey.brandColor || '#0ea5e9';

  const exportToExcel = () => {
    if (responses.length === 0) return;

    const rows = responses.map((response) => {
      const row: Record<string, string> = {
        'Дата ответа': new Date(response.submittedAt).toLocaleString(),
      };
      survey.questions.forEach((q) => {
        const answer = response.answers.find((a) => a.questionId === q.id);
        if (!answer) {
          row[q.title] = '';
          return;
        }
        const val = answer.value;
        if (Array.isArray(val)) {
          row[q.title] = val.join(', ');
        } else if (typeof val === 'object' && val !== null) {
          const contact = val as Record<string, string>;
          const parts: string[] = [];
          if (contact.name) parts.push(`Имя: ${contact.name}`);
          if (contact.phone) parts.push(`Тел: ${contact.phone}`);
          if (contact.email) parts.push(`Email: ${contact.email}`);
          row[q.title] = parts.join('; ');
        } else {
          row[q.title] = String(val);
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ответы');
    XLSX.writeFile(wb, `${survey.title || 'Опрос'} — ответы.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-start sm:items-center gap-3 sm:gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800 transition-colors mt-1 sm:mt-0 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 truncate">Аналитика: {survey.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500">Создан {new Date(survey.createdAt).toLocaleDateString()}</p>
        </div>
        {totalResponses > 0 && (
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md shrink-0"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Скачать Excel</span>
          </button>
        )}
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 mt-4 sm:mt-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Всего ответов</p>
              <p className="text-3xl font-bold text-slate-900">{totalResponses}</p>
            </div>
          </div>

          {overallAvgRating && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Средняя оценка</p>
                <p className="text-3xl font-bold text-slate-900">{overallAvgRating} <span className="text-lg text-slate-400 font-normal">/ 10</span></p>
              </div>
            </div>
          )}
        </div>

        {totalResponses === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">Пока нет ответов</h3>
            <p className="text-slate-500 mb-6">Поделитесь ссылкой на опрос, чтобы начать собирать данные.</p>
            <Link 
              to={`/s/${survey.id}`} 
              target="_blank"
              className="inline-flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors"
            >
              Открыть опрос
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {survey.questions.map((q, index) => {
              const stats = getQuestionAnalytics(q.id, q.type);
              if (!stats) return null;

              return (
                <div key={q.id} className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="mb-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Вопрос {index + 1}</span>
                    <h3 className="text-xl font-medium text-slate-800">{q.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">Ответов: {stats.total}</p>
                  </div>

                  {q.type === 'rating' && 'avg' in stats && (
                    <div>
                      <div className="flex items-end gap-3 mb-8">
                        <span className="text-4xl font-bold text-slate-900">{stats.avg}</span>
                        <span className="text-slate-500 mb-1">средний балл</span>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.distribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <Tooltip 
                              cursor={{ fill: '#f8fafc' }}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {stats.distribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={brandColor} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {(q.type === 'single' || q.type === 'multiple') && 'distribution' in stats && (
                    <div className="space-y-4">
                      {stats.distribution.map((item: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-700">{item.name}</span>
                            <span className="text-slate-500">{item.count} ({item.percent}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="h-2.5 rounded-full transition-all duration-500" 
                              style={{ width: `${item.percent}%`, backgroundColor: brandColor }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'text' && 'answers' in stats && (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {stats.answers.map((ans: string, i: number) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl text-slate-700 text-sm border border-slate-100">
                          {ans}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'contact' && 'answers' in stats && (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {responses.map((response, i) => {
                        const contactAnswer = response.answers.find(a => a.questionId === q.id);
                        if (!contactAnswer || typeof contactAnswer.value !== 'object' || Array.isArray(contactAnswer.value)) return null;
                        const contact = contactAnswer.value as Record<string, string>;
                        const otherAnswers = response.answers.filter(a => a.questionId !== q.id);

                        return (
                          <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 flex flex-wrap gap-4 border-b border-slate-200">
                              {contact.name && (
                                <span className="text-sm"><span className="text-slate-500">Имя:</span> <span className="font-medium text-slate-800">{contact.name}</span></span>
                              )}
                              {contact.phone && (
                                <span className="text-sm"><span className="text-slate-500">Тел:</span> <span className="font-medium text-slate-800">{contact.phone}</span></span>
                              )}
                              {contact.email && (
                                <span className="text-sm"><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-800">{contact.email}</span></span>
                              )}
                              <span className="text-xs text-slate-400 ml-auto">{new Date(response.submittedAt).toLocaleString()}</span>
                            </div>
                            {otherAnswers.length > 0 && (
                              <div className="px-4 py-3 space-y-2">
                                {otherAnswers.map((ans) => {
                                  const question = survey.questions.find(sq => sq.id === ans.questionId);
                                  if (!question) return null;
                                  let displayValue = '';
                                  if (Array.isArray(ans.value)) {
                                    displayValue = ans.value.join(', ');
                                  } else if (typeof ans.value === 'object') {
                                    displayValue = Object.values(ans.value).join(', ');
                                  } else {
                                    displayValue = String(ans.value);
                                  }
                                  return (
                                    <div key={ans.questionId} className="text-sm">
                                      <span className="text-slate-500">{question.title}:</span>{' '}
                                      <span className="text-slate-800">{displayValue}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
