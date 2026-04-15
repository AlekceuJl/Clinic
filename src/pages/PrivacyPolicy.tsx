import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  const { id } = useParams();
  const rawSurvey = useQuery(api.surveys.get, id ? { clientId: id } : 'skip');

  if (rawSurvey === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Загрузка...</div>;
  }
  if (!rawSurvey) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Опрос не найден</div>;
  }

  const companyName = rawSurvey.companyName || 'Организация';
  const brandColor = rawSurvey.brandColor || '#0ea5e9';

  // Собираем какие поля реально запрашиваются
  const contactFieldsSet = new Set<string>();
  rawSurvey.questions.forEach((q: any) => {
    if (q.type === 'contact' && Array.isArray(q.contactFields)) {
      q.contactFields.forEach((f: string) => contactFieldsSet.add(f));
    }
  });
  const fieldLabels: Record<string, string> = {
    name: 'Имя (ФИО)',
    phone: 'Номер телефона',
    email: 'Адрес электронной почты',
  };
  const collectedFields = Array.from(contactFieldsSet).map(f => fieldLabels[f] || f);

  const today = new Date().toLocaleDateString('ru-RU');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to={`/s/${id}`} className="text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" style={{ color: brandColor }} />
            <h1 className="font-medium text-slate-800">Политика конфиденциальности</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">
            Политика обработки персональных данных
          </h2>
          <p className="text-slate-500 mb-8">Актуально на {today}</p>

          <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
            <section>
              <h3 className="font-semibold text-slate-900 mb-2">1. Общие положения</h3>
              <p>
                Настоящая политика определяет порядок обработки персональных данных, собираемых{' '}
                <strong>«{companyName}»</strong> (далее — Оператор) через онлайн-опрос{' '}
                «{rawSurvey.title}».
              </p>
              <p className="mt-2">
                Обработка осуществляется в соответствии с Законом Республики Казахстан от 21 мая 2013 года
                № 94-V «О персональных данных и их защите».
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-slate-900 mb-2">2. Какие данные собираются</h3>
              {collectedFields.length > 0 ? (
                <>
                  <p>В рамках прохождения опроса Оператор собирает следующие персональные данные:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    {collectedFields.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  <p className="mt-2">
                    Дополнительно сохраняются ответы на вопросы анкеты, дата и время прохождения опроса.
                  </p>
                </>
              ) : (
                <p>Опрос является анонимным и не собирает персональных данных.</p>
              )}
            </section>

            <section>
              <h3 className="font-semibold text-slate-900 mb-2">3. Цели обработки</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Проведение опроса о качестве обслуживания и сбор обратной связи</li>
                <li>Улучшение качества услуг Оператора</li>
                <li>Связь с субъектом по запросу или для уточнения обратной связи (при наличии контактов)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-slate-900 mb-2">4. Правовое основание</h3>
              <p>
                Обработка осуществляется на основании согласия субъекта персональных данных,
                выраженного путём проставления отметки в соответствующем чекбоксе перед отправкой ответов
                (ст. 8 Закона РК № 94-V).
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-slate-900 mb-2">5. Срок хранения</h3>
              <p>
                Персональные данные хранятся до достижения целей обработки, но не более 3 (трёх) лет
                с момента получения, либо до момента отзыва согласия субъектом.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-slate-900 mb-2">6. Передача третьим лицам</h3>
              <p>
                Оператор не передаёт персональные данные третьим лицам, за исключением случаев,
                предусмотренных законодательством Республики Казахстан. Данные хранятся на защищённом
                облачном сервере и используются только уполномоченными сотрудниками Оператора.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-slate-900 mb-2">7. Права субъекта</h3>
              <p>Субъект персональных данных имеет право:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Получать информацию о своих обрабатываемых данных</li>
                <li>Требовать исправления или удаления данных</li>
                <li>Отозвать согласие на обработку в любое время</li>
                <li>Обжаловать действия Оператора в уполномоченный орган</li>
              </ul>
              <p className="mt-2">
                Для реализации своих прав субъект может обратиться к Оператору, используя контактные
                данные, указанные в опросе или полученные при обращении.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-slate-900 mb-2">8. Оператор</h3>
              <p>
                <strong>«{companyName}»</strong> — организация, проводящая данный опрос и определяющая
                цели и способы обработки персональных данных.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200">
            <Link
              to={`/s/${id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: brandColor }}
            >
              <ArrowLeft className="w-4 h-4" />
              Вернуться к опросу
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
