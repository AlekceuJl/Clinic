import { Link, useNavigate } from 'react-router-dom';
import { useSurveys } from '../store/useStore';
import { Plus, BarChart2, Edit, Trash2, Link as LinkIcon, Stethoscope, ClipboardList, LogOut } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Dashboard() {
  const { surveys, deleteSurvey } = useSurveys();
  const navigate = useNavigate();

  const handleCreate = () => {
    const newId = uuidv4();
    navigate(`/builder/${newId}`);
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/s/${id}`;
    navigator.clipboard.writeText(url);
    alert('Ссылка скопирована!');
  };

  const handleLogout = () => {
    localStorage.removeItem('citymed_auth');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3 text-sky-600">
          <div className="bg-sky-100 p-2 rounded-xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">City Med <span className="text-slate-400 font-normal">| Опросы</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCreate}
            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Создать опрос
          </button>
          <button 
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Выйти"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Мои опросы</h2>
            <p className="text-slate-500 mt-1">Управляйте анкетами и анализируйте отзывы пациентов</p>
          </div>
        </div>
        
        {surveys.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">У вас пока нет опросов</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Создайте свой первый опрос, чтобы начать собирать обратную связь от пациентов.</p>
            <button 
              onClick={handleCreate}
              className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
            >
              Создать первый опрос
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map(survey => (
              <div key={survey.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 p-6 flex flex-col group">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: survey.brandColor || '#0ea5e9' }}
                    >
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                      {survey.questions.length} вопросов
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors">{survey.title || 'Без названия'}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6">{survey.description || 'Нет описания'}</p>
                </div>
                
                <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-slate-500">
                  <div className="flex gap-1.5">
                    <Link to={`/builder/${survey.id}`} className="p-2 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors" title="Редактировать">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <Link to={`/analytics/${survey.id}`} className="p-2 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors" title="Аналитика">
                      <BarChart2 className="w-4 h-4" />
                    </Link>
                    <button onClick={() => copyLink(survey.id)} className="p-2 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors" title="Скопировать ссылку">
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm('Удалить опрос?')) deleteSurvey(survey.id);
                    }}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
