import { useState, useCallback } from 'react';
import type { Question, ResultItem } from '../types/quiz';
import ServiceSelector from '../components/ServiceSelector';
import QuizCard from '../components/QuizCard';
import Result from '../components/Result';

import vpcQuestions from '../data/questions/vpc.json';
import iamQuestions from '../data/questions/iam.json';
import kmsQuestions from '../data/questions/kms.json';

const ALL_QUESTIONS: Question[] = [
  ...(vpcQuestions as Question[]),
  ...(iamQuestions as Question[]),
  ...(kmsQuestions as Question[]),
];

const ALL_SERVICES = [...new Set(ALL_QUESTIONS.map((q) => q.service))];

type Phase = 'selecting' | 'quizzing' | 'result';


function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function AwsQuiz() {
  const [phase, setPhase] = useState<Phase>('selecting');
  const [selectedServices, setSelectedServices] = useState<string[]>(ALL_SERVICES);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ResultItem[]>([]);

  const filteredCount = ALL_QUESTIONS.filter((q) => selectedServices.includes(q.service)).length;

  const startQuiz = useCallback(() => {
    const pool = ALL_QUESTIONS.filter((q) => selectedServices.includes(q.service));
    setQuestions(shuffle(pool));
    setCurrentIndex(0);
    setResults([]);
    setPhase('quizzing');
  }, [selectedServices]);

  const handleNext = (correct: boolean) => {
    const updated = [...results, { question: questions[currentIndex], correct }];
    setResults(updated);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setPhase('result');
    }
  };

  const handleRetry = () => {
    setQuestions(shuffle(questions));
    setCurrentIndex(0);
    setResults([]);
    setPhase('quizzing');
  };

  if (phase === 'selecting') {
    return (
      <ServiceSelector
        services={ALL_SERVICES}
        selected={selectedServices}
        onChange={setSelectedServices}
        onStart={startQuiz}
        questionCount={filteredCount}
      />
    );
  }

  if (phase === 'quizzing') {
    return (
      <QuizCard
        key={currentIndex}
        question={questions[currentIndex]}
        current={currentIndex + 1}
        total={questions.length}
        onNext={handleNext}
      />
    );
  }

  return <Result results={results} onRetry={handleRetry} />;
}

export default AwsQuiz;
