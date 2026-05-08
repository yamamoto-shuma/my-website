import { useState, useCallback, useEffect, useRef } from 'react';
import type { VoiceActor, Title, VcResultItem } from '../types/vcQuiz';
import { generateQuestions } from '../lib/vcQuizLogic';
import VcTitleSelector from '../components/VcTitleSelector';
import VcQuizPage from '../components/VcQuizPage';
import VcResultPage from '../components/VcResultPage';

type Phase = 'loading' | 'selecting' | 'quizzing' | 'result';

function VcQuiz() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [titles, setTitles] = useState<Title[]>([]);
  const [voiceActors, setVoiceActors] = useState<VoiceActor[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState(generateQuestions([], [], [], 0));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<VcResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const [vasRes, titlesRes] = await Promise.all([
          fetch('/data/vc-quiz/voice_actors.json'),
          fetch('/data/vc-quiz/titles.json'),
        ]);
        if (!vasRes.ok) throw new Error(`voice_actors.json の取得に失敗しました（${vasRes.status}）`);
        if (!titlesRes.ok) throw new Error(`titles.json の取得に失敗しました（${titlesRes.status}）`);
        const [vas, ts] = await Promise.all([vasRes.json(), titlesRes.json()]) as [VoiceActor[], Title[]];
        setVoiceActors(vas);
        setTitles(ts);
        setSelectedIds(ts.map((t) => t.id));
        setPhase('selecting');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'データ取得に失敗しました');
        setPhase('selecting');
      }
    })();
  }, []);

  const startQuiz = useCallback(() => {
    const qs = generateQuestions(voiceActors, titles, selectedIds, questionCount);
    if (qs.length === 0) {
      setError('問題を生成できませんでした。作品を追加するか声優データを確認してください。');
      return;
    }
    setQuestions(qs);
    setCurrentIndex(0);
    setResults([]);
    setError(null);
    setPhase('quizzing');
  }, [voiceActors, titles, selectedIds, questionCount]);

  const handleNext = (userAnswer: string, correct: boolean) => {
    const updated = [...results, { question: questions[currentIndex], userAnswer, correct }];
    setResults(updated);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setPhase('result');
    }
  };

  const handleBack = () => {
    setPhase('selecting');
  };

  if (phase === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 18, color: '#5F6B7A' }}>データを読み込み中...</div>
      </div>
    );
  }

  if (phase === 'selecting') {
    return (
      <VcTitleSelector
        titles={titles}
        selectedIds={selectedIds}
        questionCount={questionCount}
        onChangeSelected={setSelectedIds}
        onChangeCount={setQuestionCount}
        onStart={startQuiz}
        error={error}
      />
    );
  }

  if (phase === 'quizzing') {
    return (
      <VcQuizPage
        key={currentIndex}
        question={questions[currentIndex]}
        current={currentIndex + 1}
        total={questions.length}
        onNext={handleNext}
        onBack={handleBack}
      />
    );
  }

  return <VcResultPage results={results} onRetry={handleBack} />;
}

export default VcQuiz;
