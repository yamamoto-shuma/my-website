import { useState, useCallback, useEffect, useRef } from 'react';
import type { VoiceActor, Title, VcResultItem, VcQuestion } from '../types/vcQuiz';
import { generateQuestions } from '../lib/vcQuizLogic';
import VcTitleSelector from '../components/VcTitleSelector';
import VcQuizPage from '../components/VcQuizPage';
import VcResultPage from '../components/VcResultPage';

type Phase = 'loading' | 'selecting' | 'quizzing' | 'result';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuote = false;
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote; continue; }
    if (ch === ',' && !inQuote) { result.push(current.trim()); current = ''; continue; }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const values = parseCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

function VcQuiz() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [titles, setTitles] = useState<Title[]>([]);
  const [voiceActors, setVoiceActors] = useState<VoiceActor[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<VcQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<VcResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const [vasRes, titlesRes, charsRes] = await Promise.all([
          fetch('/data/vc-quiz/voice_actors.csv'),
          fetch('/data/vc-quiz/titles.csv'),
          fetch('/data/vc-quiz/characters.csv'),
        ]);
        if (!vasRes.ok) throw new Error(`voice_actors.csv の取得に失敗しました（${vasRes.status}）`);
        if (!titlesRes.ok) throw new Error(`titles.csv の取得に失敗しました（${titlesRes.status}）`);
        if (!charsRes.ok) throw new Error(`characters.csv の取得に失敗しました（${charsRes.status}）`);

        const [vasText, titlesText, charsText] = await Promise.all([
          vasRes.text(), titlesRes.text(), charsRes.text(),
        ]);

        const vasRows = parseCSV(vasText);
        const titlesRows = parseCSV(titlesText);
        const charsRows = parseCSV(charsText);

        const vas: VoiceActor[] = vasRows.map((r) => ({
          id: r.id,
          name: r.name,
          reading: r.reading,
          gender: r.gender as 'male' | 'female',
          birthday: r.birthday,
          wiki_url: r.wiki_url,
        }));

        const ts: Title[] = titlesRows.map((r) => ({
          id: r.id,
          title: r.title,
          broadcast_year: Number(r.broadcast_year),
          characters: charsRows
            .filter((c) => c.title_id === r.id)
            .map((c) => ({
              char_name: c.char_name,
              va_id: c.va_id,
              gender: c.char_gender as 'male' | 'female',
            })),
        }));

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
        onChangeSelected={(ids) => {
          setSelectedIds(ids);
          const max = titles.filter((t) => ids.includes(t.id)).reduce((s, t) => s + t.characters.length, 0);
          if (max > 0) setQuestionCount((prev) => Math.min(prev, max));
        }}
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
