import { Question } from '../types';

export function isQuestionVisible(
  question: Question,
  answers: Record<string, any>,
  allQuestions: Question[],
  visited: Set<string> = new Set()
): boolean {
  if (!question.condition) return true;
  if (visited.has(question.id)) return true;
  visited.add(question.id);

  const trigger = allQuestions.find(q => q.id === question.condition!.questionId);
  if (!trigger) return true;

  if (!isQuestionVisible(trigger, answers, allQuestions, visited)) return false;

  const answer = answers[question.condition.questionId];
  if (answer === undefined || answer === null) return false;

  if (trigger.type === 'single') {
    return answer === question.condition.value;
  }

  if (trigger.type === 'multiple' && Array.isArray(answer)) {
    return answer.includes(question.condition.value);
  }

  return true;
}
