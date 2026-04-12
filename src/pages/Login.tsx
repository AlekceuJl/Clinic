import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ClipboardList, Lock, Mail, ArrowRight, User, UserPlus, Building2 } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginMut = useMutation(api.users.login);
  const registerMut = useMutation(api.users.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Введите имя');
          setLoading(false);
          return;
        }
        const result = await registerMut({ email, password, name: name.trim(), companyName: companyName.trim() || undefined });
        if (result.success) {
          localStorage.setItem('citymed_auth', 'true');
          localStorage.setItem('citymed_user', JSON.stringify({ email: result.email, name: result.name, userId: result.userId, companyName: result.companyName }));
          navigate('/');
        } else {
          setError(result.error || 'Ошибка регистрации');
        }
      } else {
        const result = await loginMut({ email, password });
        if (result.success) {
          localStorage.setItem('citymed_auth', 'true');
          localStorage.setItem('citymed_user', JSON.stringify({ email: result.email, name: result.name, userId: result.userId, companyName: result.companyName }));
          navigate('/');
        } else {
          setError(result.error || 'Неверный email или пароль');
        }
      }
    } catch {
      setError('Ошибка соединения с сервером');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-sky-100 p-3 rounded-2xl text-sky-600 mb-4">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isRegister ? 'Регистрация' : 'Вход для сотрудников'}
          </h1>
          <p className="text-slate-500 text-sm mt-2 text-center">
            Панель управления опросами
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Имя</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    placeholder="Ваше имя"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название компании</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    placeholder="Например: City Med"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            {isRegister && (
              <p className="text-xs text-slate-400 mt-1">Минимум 6 символов</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:hover:translate-y-0"
          >
            {loading ? (
              'Загрузка...'
            ) : isRegister ? (
              <>
                Зарегистрироваться
                <UserPlus className="w-4 h-4" />
              </>
            ) : (
              <>
                Войти в кабинет
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
          >
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </div>
      </div>
    </div>
  );
}
