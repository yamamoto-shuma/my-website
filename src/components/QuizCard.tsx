import { useState, useMemo } from 'react';
import type { Question } from '../types/quiz';

interface QuizCardProps {
  question: Question;
  current: number;
  total: number;
  onNext: (correct: boolean) => void;
  onBack: () => void;
}

function QuizCard({ question, current, total, onNext, onBack }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const shuffledChoices = useMemo(() => {
    const indexed = question.choices.map((text, i) => ({ text, originalIndex: i }));
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }
    return indexed;
  }, [question]);

  const correctShuffledIndex = shuffledChoices.findIndex((c) => c.originalIndex === question.answer);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
  };

  const handleNext = () => {
    if (selected === null) return;
    onNext(selected === correctShuffledIndex);
  };

  const progress = Math.round((current / total) * 100);

  const getChoiceStyle = (index: number): React.CSSProperties => {
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
      color: '#16191F',
      fontFamily: 'inherit',
    };
    if (selected === null) return base;
    if (index === correctShuffledIndex) return { ...base, background: '#E9F5EC', border: '1.5px solid #1D8348', color: '#1D8348', fontWeight: 600 };
    if (index === selected) return { ...base, background: '#FDEDEC', border: '1.5px solid #C0392B', color: '#C0392B' };
    return { ...base, opacity: 0.4 };
  };

  const isCorrect = selected === correctShuffledIndex;

  return (
    <div>
      {/* Header */}
      <div style={{ background: '#232F3E', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onBack}
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ color: '#FF9900', fontWeight: 700, fontSize: 20 }}>AWS</span>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 500 }}>Quiz</span>
        </button>
        <span style={{ marginLeft: 'auto', color: '#9BA7B4', fontSize: 13 }}>{question.service}</span>
      </div>

      {/* プログレスバー */}
      <div style={{ height: 4, background: '#D5DBDB' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#FF9900', transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ maxWidth: 700, margin: '28px auto', padding: '0 20px' }}>
        <p style={{ color: '#5F6B7A', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
          問題 {current} / {total}
        </p>

        {/* 問題カード */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.1)', padding: '28px', marginBottom: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#16191F', lineHeight: 1.7, margin: '0 0 24px' }}>
            {question.question}
          </p>

          <div>
            {shuffledChoices.map((choice, index) => (
              <button
                key={choice.originalIndex}
                onClick={() => handleSelect(index)}
                disabled={selected !== null}
                className={`choice-btn${selected === null ? ' choice-btn--interactive' : ''}`}
                style={getChoiceStyle(index)}
              >
                <span style={{ marginRight: 10, fontWeight: 700, color: '#8A9199', fontSize: 13 }}>
                  {String.fromCharCode(65 + index)}.
                </span>
                {choice.text}
              </button>
            ))}
          </div>
        </div>

        {/* 解説 */}
        {selected !== null && (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 8px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${isCorrect ? '#1D8348' : '#C0392B'}`,
            padding: '18px 22px',
            marginBottom: 16,
          }}>
            <p style={{ fontWeight: 700, margin: '0 0 8px', color: isCorrect ? '#1D8348' : '#C0392B', fontSize: 15 }}>
              {isCorrect ? '✓ 正解！' : '✗ 不正解'}
            </p>
            <p style={{ margin: '0 0 10px', color: '#3D4149', fontSize: 14, lineHeight: 1.7 }}>
              {question.explanation}
            </p>
            {question.reference && (
              <a
                href={question.reference}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, color: '#0073BB', fontWeight: 500 }}
              >
                AWS公式ドキュメント →
              </a>
            )}
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
            className="aws-btn"
            style={{
              padding: '10px 28px',
              fontSize: 14,
              fontWeight: 700,
              background: selected === null ? '#D5DBDB' : '#FF9900',
              color: selected === null ? '#9BA7B4' : '#16191F',
              border: 'none',
              borderRadius: 8,
              cursor: selected === null ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {current === total ? '結果を見る' : '次の問題へ →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizCard;
