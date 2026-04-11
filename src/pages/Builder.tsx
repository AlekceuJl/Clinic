import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurveys } from '../store/useStore';
import { Survey, Question, QuestionType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  ArrowLeft, Save, Settings, Type, List, CheckSquare, Star, 
  GripVertical, Trash2, Copy, Plus, Contact, Share2
} from 'lucide-react';
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
  onSelect, 
  onUpdate, 
  onDelete, 
  onDuplicate 
}: { 
  question: Question; 
  isActive: boolean; 
  onSelect: () => void;
  onUpdate: (q: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
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
    const newOptions = [...(question.options || [])];
    newOptions[idx] = val;
    onUpdate({ ...question, options: newOptions });
  };

  const addOption = () => {
    onUpdate({ ...question, options: [...(question.options || []), `Вариант ${(question.options?.length || 0) + 1}`] });
  };

  const removeOption = (idx: number) => {
    const newOptions = [...(question.options || [])];
    newOptions.splice(idx, 1);
    onUpdate({ ...question, options: newOptions });
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
              </div>
            ))}
            <button onClick={addOption} className="flex items-center gap-1 text-sm text-sky-600 hover:underline mt-2">
              <Plus className="w-3 h-3" /> Добавить вариант
            </button>
          </div>
        )}

        {question.type === 'rating' && (
          <div className="flex items-center gap-2 mt-4 text-slate-400">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <div key={n} className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-sm">{n}</div>
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
  const { getSurvey, saveSurvey } = useSurveys();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      const existing = getSurvey(id);
      if (existing) {
        setSurvey(existing);
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
    }
  }, [id]);

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

  if (!survey) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSurvey((prev) => {
        if (!prev) return prev;
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id);
        const newIndex = prev.questions.findIndex((q) => q.id === over.id);
        return {
          ...prev,
          questions: arrayMove(prev.questions, oldIndex, newIndex),
        };
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
    setSurvey(prev => prev ? {
      ...prev,
      questions: prev.questions.filter(q => q.id !== qId)
    } : prev);
    if (activeQuestionId === qId) setActiveQuestionId(null);
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
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={survey.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                  {survey.questions.map((q) => (
                    <SortableQuestionItem
                      key={q.id}
                      question={q}
                      isActive={activeQuestionId === q.id}
                      onSelect={() => setActiveQuestionId(q.id)}
                      onUpdate={updateQuestion}
                      onDelete={() => deleteQuestion(q.id)}
                      onDuplicate={() => duplicateQuestion(q)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </main>

        {/* Right Panel - Settings */}
        <aside className="w-full lg:w-72 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 lg:p-5 flex flex-col shrink-0 max-h-48 lg:max-h-none overflow-y-auto z-10">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <Settings className="w-5 h-5" />
            <h3 className="font-semibold">Настройки</h3>
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
    </div>
  );
}
