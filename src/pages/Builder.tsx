import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSurveys } from '../store/useStore';
import { Survey, Question, QuestionType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  ArrowLeft, Save, Settings, Type, List, CheckSquare, Star,
  GripVertical, Trash2, Copy, Plus, Contact, Share2, X, QrCode, GitBranch
} from 'lucide-react';
import QrModal from './QrModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../lib/utils';

const QUESTION_TYPES: { type: QuestionType; label: string; icon: any }[] = [
  { type: 'single', label: 'Один из списка', icon: List },
  { type: 'multiple', label: 'Несколько из списка', icon: CheckSquare },
  { type: 'text', label: 'Текстовый ответ', icon: Type },
  { type: 'rating', label: 'Шкала оценки', icon: Star },
  { type: 'contact', label: 'Контактные данные', icon: Contact },
];

function SortableQuestionItem({
  question,
  isActive,
  allQuestions,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddBranch,
  onScrollToBranch,
  onOptionRenamed,
  onOptionRemoved,
}: {
  question: Question;
  isActive: boolean;
  allQuestions: Question[];
  onSelect: () => void;
  onUpdate: (q: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddBranch: (questionId: string, optionValue: string) => void;
  onScrollToBranch: (questionId: string, optionValue: string) => void;
  onOptionRenamed: (questionId: string, oldValue: string, newValue: string) => void;
  onOptionRemoved: (questionId: string, optionValue: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleOptionChange = (idx: number, val: string) => {
    const oldVal = question.options?.[idx];
    const newOptions = [...(question.options || [])];
    newOptions[idx] = val;
    onUpdate({ ...question, options: newOptions });
    if (oldVal && oldVal !== val) {
      onOptionRenamed(question.id, oldVal, val);
    }
  };

  const addOption = () => {
    onUpdate({ ...question, options: [...(question.options || []), `Вариант ${(question.options?.length || 0) + 1}`] });
  };

  const removeOption = (idx: number) => {
    const removedVal = question.options?.[idx];
    const newOptions = [...(question.options || [])];
    newOptions.splice(idx, 1);
    onUpdate({ ...question, options: newOptions });
    if (removedVal) {
      onOptionRemoved(question.id, removedVal);
    }
  };

  const branchCount = (optionValue: string) => {
    return allQuestions.filter(q => q.condition?.questionId === question.id && q.condition?.value === optionValue).length;
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "bg-white border rounded-xl mb-4 transition-all",
        isActive ? "border-sky-500 shadow-md ring-1 ring-sky-500" : "border-slate-200 hover:border-slate-300"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center p-2 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <div {...attributes} {...listeners} className="p-2 cursor-grab text-slate-400 hover:text-slate-600">
          <GripVertical className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-2">
          {QUESTION_TYPES.find(t => t.type === question.type)?.label}
        </span>
        {question.condition && (() => {
          const trigger = allQuestions.find(q => q.id === question.condition!.questionId);
          return (
            <span className="text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full ml-2 flex items-center gap-1" title={`Показывается если в «${trigger?.title || '...'}» выбрано «${question.condition!.value}»`}>
              <GitBranch className="w-3 h-3" />
              ↳ «{question.condition!.value}»
            </span>
          );
        })()}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1.5 text-slate-400 hover:text-sky-600 rounded transition-colors" title="Дублировать">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors" title="Удалить">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <input
          type="text"
          value={question.title}
          onChange={(e) => onUpdate({ ...question, title: e.target.value })}
          placeholder="Введите вопрос"
          className="w-full text-lg font-medium outline-none placeholder:text-slate-300 mb-2"
        />
        <input
          type="text"
          value={question.description || ''}
          onChange={(e) => onUpdate({ ...question, description: e.target.value })}
          placeholder="Описание (необязательно)"
          className="w-full text-sm text-slate-500 outline-none placeholder:text-slate-300 mb-4"
        />

        {(question.type === 'single' || question.type === 'multiple') && (
          <div className="space-y-2 mt-4">
            {question.options?.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={cn("w-4 h-4 border border-slate-300", question.type === 'single' ? 'rounded-full' : 'rounded-sm')} />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 text-sm outline-none border-b border-transparent focus:border-sky-300 py-1"
                />
                <button onClick={() => removeOption(idx)} className="text-slate-300 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
                {branchCount(opt) > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onScrollToBranch(question.id, opt); }}
                    className="flex items-center gap-0.5 text-sky-500 hover:text-sky-700 p-0.5"
                    title={`Перейти к ветке «${opt}» (${branchCount(opt)} вопр.)`}
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">{branchCount(opt)}</span>
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onAddBranch(question.id, opt); }}
                  className="text-slate-300 hover:text-sky-600 p-0.5"
                  title={`Добавить вопрос в ветку «${opt}»`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button onClick={addOption} className="flex items-center gap-1 text-sm text-sky-600 hover:underline mt-2">
              <Plus className="w-3 h-3" /> Добавить вариант
            </button>
          </div>
        )}

        {question.type === 'rating' && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-4 text-slate-400">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <div key={n} className="w-9 h-9 sm:w-8 sm:h-8 rounded bg-slate-100 flex items-center justify-center text-sm">{n}</div>
            ))}
          </div>
        )}

        {question.type === 'text' && (
          <div className="mt-4 border-b-2 border-slate-200 border-dashed pb-6 text-slate-400 text-sm">
            Место для длинного ответа...
          </div>
        )}

        {question.type === 'contact' && (
          <div className="mt-4 space-y-3">
            {['name', 'phone', 'email'].map(field => {
              const isChecked = question.contactFields?.includes(field as any);
              const labels: Record<string, string> = { name: 'Имя', phone: 'Телефон', email: 'Email' };
              return (
                <label key={field} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={(e) => {
                      const current = question.contactFields || [];
                      const next = e.target.checked 
                        ? [...current, field]
                        : current.filter(f => f !== field);
                      onUpdate({ ...question, contactFields: next as any });
                    }}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  Запрашивать {labels[field]}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromTemplateId = searchParams.get('from');
  const { getSurvey, saveSurvey, isLoading } = useSurveys();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (isLoading || initialized) return;
    if (id) {
      const existing = getSurvey(id);
      if (existing) {
        setSurvey(existing);
      } else if (fromTemplateId) {
        const template = getSurvey(fromTemplateId);
        setSurvey({
          id,
          title: template?.title || '',
          description: template?.description || '',
          questions: (template?.questions || []).map(q => ({ ...q, id: uuidv4() })),
          createdAt: Date.now(),
          isActive: true,
          brandColor: template?.brandColor || '#0ea5e9',
        });
      } else {
        setSurvey({
          id,
          title: '',
          description: '',
          questions: [],
          createdAt: Date.now(),
          isActive: true,
          brandColor: '#0ea5e9'
        });
      }
      setInitialized(true);
    }
  }, [id, isLoading]);

  // Auto-save
  useEffect(() => {
    if (survey) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveSurvey(survey);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }, 1000);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [survey]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getEligibleTriggers = (currentId: string): Question[] => {
    if (!survey) return [];
    const idx = survey.questions.findIndex(q => q.id === currentId);
    return survey.questions.filter((q, i) =>
      i < idx && (q.type === 'single' || q.type === 'multiple') && q.options && q.options.length > 0
    );
  };

  if (!survey) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSurvey((prev) => {
        if (!prev) return prev;
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id);
        const newIndex = prev.questions.findIndex((q) => q.id === over.id);
        const reordered = arrayMove(prev.questions, oldIndex, newIndex);
        const cleaned = reordered.map((q, idx) => {
          if (q.condition) {
            const triggerIdx = reordered.findIndex(tq => tq.id === q.condition!.questionId);
            if (triggerIdx === -1 || triggerIdx >= idx) {
              return { ...q, condition: undefined };
            }
          }
          return q;
        });
        return { ...prev, questions: cleaned };
      });
    }
  };

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: uuidv4(),
      type,
      title: type === 'contact' ? 'Оставьте ваши контакты' : '',
      required: true,
      options: type === 'single' || type === 'multiple' ? ['Вариант 1', 'Вариант 2'] : undefined,
      contactFields: type === 'contact' ? ['name', 'phone'] : undefined
    };
    setSurvey(prev => prev ? { ...prev, questions: [...prev.questions, newQ] } : prev);
    setActiveQuestionId(newQ.id);
  };

  const updateQuestion = (updated: Question) => {
    setSurvey(prev => prev ? {
      ...prev,
      questions: prev.questions.map(q => q.id === updated.id ? updated : q)
    } : prev);
  };

  const deleteQuestion = (qId: string) => {
    setSurvey(prev => {
      if (!prev) return prev;
      const toRemove = new Set<string>();
      const collect = (id: string) => {
        toRemove.add(id);
        prev.questions
          .filter(q => q.condition?.questionId === id)
          .forEach(q => collect(q.id));
      };
      collect(qId);
      return { ...prev, questions: prev.questions.filter(q => !toRemove.has(q.id)) };
    });
    if (activeQuestionId === qId || (survey && !survey.questions.find(q => q.id === activeQuestionId))) {
      setActiveQuestionId(null);
    }
  };

  const addBranchQuestion = (triggerQuestionId: string, optionValue: string) => {
    if (!survey) return;
    const newQ: Question = {
      id: uuidv4(),
      type: 'text',
      title: '',
      required: false,
      condition: { questionId: triggerQuestionId, value: optionValue },
    };
    // Insert after the last question with the same (triggerId, value)
    const triggerIdx = survey.questions.findIndex(q => q.id === triggerQuestionId);
    let insertIdx = triggerIdx + 1;
    let lastSameValueIdx = -1;
    while (insertIdx < survey.questions.length && survey.questions[insertIdx].condition?.questionId === triggerQuestionId) {
      if (survey.questions[insertIdx].condition?.value === optionValue) {
        lastSameValueIdx = insertIdx;
      }
      insertIdx++;
    }
    const finalIdx = lastSameValueIdx >= 0 ? lastSameValueIdx + 1 : insertIdx;
    const newQuestions = [...survey.questions];
    newQuestions.splice(finalIdx, 0, newQ);
    setSurvey({ ...survey, questions: newQuestions });
    setActiveQuestionId(newQ.id);
    setTimeout(() => {
      document.getElementById(`q-item-${newQ.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const scrollToBranch = (triggerQuestionId: string, optionValue: string) => {
    if (!survey) return;
    const first = survey.questions.find(
      q => q.condition?.questionId === triggerQuestionId && q.condition?.value === optionValue
    );
    if (first) {
      setActiveQuestionId(first.id);
      document.getElementById(`q-item-${first.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleOptionRenamed = (questionId: string, oldValue: string, newValue: string) => {
    setSurvey(prev => prev ? {
      ...prev,
      questions: prev.questions.map(q =>
        q.condition?.questionId === questionId && q.condition?.value === oldValue
          ? { ...q, condition: { questionId, value: newValue } }
          : q
      )
    } : prev);
  };

  const handleOptionRemoved = (questionId: string, optionValue: string) => {
    setSurvey(prev => prev ? {
      ...prev,
      questions: prev.questions.filter(q =>
        !(q.condition?.questionId === questionId && q.condition?.value === optionValue)
      )
    } : prev);
  };

  const duplicateQuestion = (q: Question) => {
    const newQ = { ...q, id: uuidv4() };
    setSurvey(prev => {
      if (!prev) return prev;
      const idx = prev.questions.findIndex(x => x.id === q.id);
      const newQuestions = [...prev.questions];
      newQuestions.splice(idx + 1, 0, newQ);
      return { ...prev, questions: newQuestions };
    });
    setActiveQuestionId(newQ.id);
  };

  const handleSave = () => {
    if (survey) saveSurvey(survey);
    navigate('/');
  };

  const handleBack = () => {
    if (survey) saveSurvey(survey);
    navigate('/');
  };

  const handleShare = () => {
    if (survey) saveSurvey(survey);
    const url = `${window.location.origin}/s/${survey?.id}`;
    navigator.clipboard.writeText(url);
    alert('Ссылка на опрос скопирована в буфер обмена!');
  };

  const activeQuestion = survey.questions.find(q => q.id === activeQuestionId);

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={handleBack} className="text-slate-500 hover:text-slate-800 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input 
            type="text"
            value={survey.title}
            onChange={e => setSurvey({...survey, title: e.target.value})}
            placeholder="Название опроса"
            className="font-medium text-lg outline-none bg-transparent placeholder:text-slate-300 w-full sm:w-64"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {isSaved && <span className="text-sm text-emerald-500 font-medium hidden sm:inline">Сохранено</span>}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="lg:hidden bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-md transition-colors"
            title="Настройки"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => { if (survey) saveSurvey(survey); setShowQr(true); }}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-md transition-colors"
            title="QR-код"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Поделиться</span>
          </button>
          <button 
            onClick={handleSave}
            className="bg-sky-600 hover:bg-sky-700 text-white px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Готово
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Tools */}
        <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-3 lg:p-4 flex flex-col shrink-0 lg:overflow-y-auto z-10">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 lg:mb-4 hidden lg:block">Типы вопросов</h3>
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
            {QUESTION_TYPES.map(qt => (
              <button
                key={qt.type}
                onClick={() => addQuestion(qt.type)}
                className="shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-left transition-colors group"
              >
                <qt.icon className="w-5 h-5 text-slate-400 group-hover:text-sky-600" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-sky-700 whitespace-nowrap">{qt.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Center - Canvas */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50">
          <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
            {survey.questions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                <p className="text-slate-500">Добавьте первый вопрос из панели слева</p>
              </div>
            ) : (
              <>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={survey.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                    {survey.questions.map((q) => (
                      <div key={q.id} id={`q-item-${q.id}`} className={q.condition ? 'ml-6 lg:ml-10 border-l-2 border-sky-200 pl-2' : ''}>
                        <SortableQuestionItem
                          question={q}
                          isActive={activeQuestionId === q.id}
                          allQuestions={survey.questions}
                          onSelect={() => setActiveQuestionId(q.id)}
                          onUpdate={updateQuestion}
                          onDelete={() => deleteQuestion(q.id)}
                          onDuplicate={() => duplicateQuestion(q)}
                          onAddBranch={addBranchQuestion}
                          onScrollToBranch={scrollToBranch}
                          onOptionRenamed={handleOptionRenamed}
                          onOptionRemoved={handleOptionRemoved}
                        />
                      </div>
                    ))}
                  </SortableContext>
                </DndContext>

                {/* Mobile add question button */}
                <div className="lg:hidden mt-4 relative">
                  <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-sky-500 hover:text-sky-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                  >
                    <Plus className="w-5 h-5" />
                    Добавить вопрос
                  </button>
                  {showAddMenu && (
                    <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg z-20 overflow-hidden">
                      {QUESTION_TYPES.map(qt => (
                        <button
                          key={qt.type}
                          onClick={() => { addQuestion(qt.type); setShowAddMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 text-left transition-colors border-b border-slate-100 last:border-0"
                        >
                          <qt.icon className="w-5 h-5 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{qt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>

        {/* Right Panel - Settings (mobile overlay) */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setShowSettings(false)} />
        )}
        <aside className={`
          ${showSettings ? 'translate-x-0' : 'translate-x-full'}
          fixed top-0 right-0 h-full w-72 z-50
          lg:relative lg:translate-x-0 lg:z-10 lg:h-auto lg:w-72
          bg-white border-l border-slate-200 p-4 lg:p-5 flex flex-col shrink-0 overflow-y-auto
          transition-transform duration-200
        `}>
          <div className="flex items-center justify-between mb-6 text-slate-800">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <h3 className="font-semibold">Настройки</h3>
            </div>
            <button onClick={() => setShowSettings(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {activeQuestion ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Вопрос</h4>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeQuestion.required}
                    onChange={e => updateQuestion({...activeQuestion, required: e.target.checked})}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  Обязательный вопрос
                </label>
              </div>

              {/* Condition section */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Условие показа</h4>
                {getEligibleTriggers(activeQuestion.id).length === 0 ? (
                  <p className="text-xs text-slate-400">Добавьте вопрос с вариантами выше, чтобы настроить условие</p>
                ) : (
                  <>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={!!activeQuestion.condition}
                        onChange={e => {
                          if (e.target.checked) {
                            const triggers = getEligibleTriggers(activeQuestion.id);
                            if (triggers.length > 0) {
                              updateQuestion({
                                ...activeQuestion,
                                condition: { questionId: triggers[0].id, value: triggers[0].options?.[0] || '' }
                              });
                            }
                          } else {
                            updateQuestion({ ...activeQuestion, condition: undefined });
                          }
                        }}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      Показывать по условию
                    </label>

                    {activeQuestion.condition && (
                      <div className="space-y-3 pl-1">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Если в вопросе:</label>
                          <select
                            value={activeQuestion.condition.questionId}
                            onChange={e => {
                              const trigger = survey.questions.find(q => q.id === e.target.value);
                              updateQuestion({
                                ...activeQuestion,
                                condition: { questionId: e.target.value, value: trigger?.options?.[0] || '' }
                              });
                            }}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-sky-500"
                          >
                            {getEligibleTriggers(activeQuestion.id).map(q => (
                              <option key={q.id} value={q.id}>{q.title || 'Без названия'}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Выбран ответ:</label>
                          <select
                            value={activeQuestion.condition.value}
                            onChange={e => updateQuestion({
                              ...activeQuestion,
                              condition: { ...activeQuestion.condition!, value: e.target.value }
                            })}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-sky-500"
                          >
                            {survey.questions.find(q => q.id === activeQuestion.condition!.questionId)?.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Опрос</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Описание</label>
                    <textarea 
                      value={survey.description}
                      onChange={e => setSurvey({...survey, description: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-sky-500 resize-none h-24"
                      placeholder="Введите описание опроса..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Брендовый цвет</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={survey.brandColor || '#0ea5e9'}
                        onChange={e => setSurvey({...survey, brandColor: e.target.value})}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="text-sm text-slate-500 uppercase">{survey.brandColor || '#0ea5e9'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {showQr && survey && (
        <QrModal
          surveyUrl={`${window.location.origin}/s/${survey.id}`}
          surveyTitle={survey.title}
          onClose={() => setShowQr(false)}
        />
      )}
    </div>
  );
}
