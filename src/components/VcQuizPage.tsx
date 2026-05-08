import { useState } from 'react';
import type { VcQuestion } from '../types/vcQuiz';

interface VcQuizPageProps {
  question: VcQuestion;
  current: number;
  total: number;
  onNext: (userAnswer: string, correct: boolean) => void;
  onBack: () => void;
}

function VcQuizPage({ question, current, total, onNext, onBack }: VcQuizPageProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const [shuffledChoices] = useState(() => [...question.choices]);

  const handleSelect = (choice: string) => {
    if (selected !== null) return;
    setSelected(choice);
  };

  const handleNext = () => {
    if (selected === null) return;
    onNext(selected, selected === question.correctAnswer);
  };

  const progress = Math.round((current / total) * 100);
  const isCorrect = selected !== null && selected === question.correctAnswer;

  const getChoiceStyle = (choice: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'block',
      width: '100%',
      padding: '13px 18px',
      marginBottom: 8,
      textAlign: 'left',
      fontSize: 14,
      fontWeight: 500,
      cursor: selected !== null ? 'default' : 'pointer',
      border: '1.5px solid #D5DBDB',
      borderRadius: 10,
      background: '#FAFAFA',
      color: '#1A1A1A',
      fontFamily: 'inherit',
    };
    if (selected === null) return base;
    if (choice === question.correctAnswer) return { ...base, background: '#E9F5EC', border: '1.5px solid #1D8348', color: '#1D8348', fontWeight: 600 };
    if (choice === selected) return { ...base, background: '#FDEDEC', border: '1.5px solid var(--vc-primary)', color: 'var(--vc-primary)' };
    return { ...base, opacity: 0.4 };
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: '#1A1A1A', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onBack}
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ color: 'var(--vc-primary)', fontWeight: 700, fontSize: 20 }}>声優</span>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 500 }}>クイズ</span>
        </button>
        <span style={{ marginLeft: 'auto', color: '#9BA7B4', fontSize: 13 }}>
          {question.type === 'forward' ? 'キャラ → 声優' : '声優 → キャラ'}
        </span>
      </div>

      {/* プログレスバー */}
      <div style={{ height: 4, background: '#D5DBDB' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--vc-primary)', transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ maxWidth: 700, margin: '28px auto', padding: '0 20px' }}>
        <p style={{ color: '#5F6B7A', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
          問題 {current} / {total}
        </p>

        {/* 問題カード */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.1)', padding: '28px', marginBottom: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.7, margin: '0 0 24px' }}>
            {question.questionText}
          </p>

          <div>
            {shuffledChoices.map((choice, index) => (
              <button
                key={choice}
                onClick={() => handleSelect(choice)}
                disabled={selected !== null}
                className={`vc-choice-btn${selected === null ? ' vc-choice-btn--interactive' : ''}`}
                style={getChoiceStyle(choice)}
              >
                <span style={{ marginRight: 10, fontWeight: 700, color: '#8A9199', fontSize: 13 }}>
                  {String.fromCharCode(65 + index)}.
                </span>
                {choice}
              </button>
            ))}
          </div>
        </div>

        {/* 回答後フィードバック */}
        {selected !== null && (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 8px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${isCorrect ? '#1D8348' : 'var(--vc-primary)'}`,
            padding: '18px 22px',
            marginBottom: 16,
          }}>
            <p style={{ fontWeight: 700, margin: '0 0 12px', color: isCorrect ? '#1D8348' : 'var(--vc-primary)', fontSize: 15 }}>
              {isCorrect ? '✓ 正解！' : '✗ 不正解'}
            </p>
            <div style={{ fontSize: 14, color: '#3D4149', lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 2px' }}>
                <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{question.correctVa.name}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: '#8A9199' }}>({question.correctVa.reading})</span>
              </p>
              <p style={{ margin: '0 0 8px', color: '#5F6B7A' }}>デビュー：{question.correctVa.debut_year}年</p>
              {question.correctVa.wiki_url && (
                <a
                  href={question.correctVa.wiki_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: 'var(--vc-primary)', fontWeight: 500 }}
                >
                  Wikipedia →
                </a>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 500,
              background: 'transparent',
              color: '#8A9199',
              border: '1.5px solid #D5DBDB',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            やめる
          </button>
          <button
            onClick={handleNext}
            disabled={selected === null}
            className="vc-btn"
            style={{
              padding: '10px 28px',
              fontSize: 14,
              fontWeight: 700,
              background: selected === null ? '#D5DBDB' : 'var(--vc-primary)',
              color: selected === null ? '#9BA7B4' : '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: selected === null ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {current === total ? '結果を見る' : '次へ →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VcQuizPage;
