import { useState } from 'react';
import type { Question } from '../types/quiz';

interface QuizCardProps {
  question: Question;
  current: number;
  total: number;
  onNext: (correct: boolean) => void;
}

function QuizCard({ question, current, total, onNext }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
  };

  const handleNext = () => {
    if (selected === null) return;
    const correct = selected === question.answer;
    setSelected(null);
    onNext(correct);
  };

  const getChoiceStyle = (index: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'block',
      width: '100%',
      padding: '10px 16px',
      marginBottom: 8,
      textAlign: 'left',
      fontSize: 15,
      cursor: selected !== null ? 'default' : 'pointer',
      border: '1px solid #ccc',
      borderRadius: 4,
      background: '#fff',
    };

    if (selected === null) return base;

    if (index === question.answer) {
      return { ...base, background: '#d4edda', borderColor: '#28a745' };
    }
    if (index === selected && selected !== question.answer) {
      return { ...base, background: '#f8d7da', borderColor: '#dc3545' };
    }
    return base;
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 24 }}>
      <p style={{ color: '#666', marginBottom: 8 }}>
        {current} / {total}問目 — {question.service}
      </p>
      <p style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 20 }}>{question.question}</p>
      <div>
        {question.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={selected !== null}
            style={getChoiceStyle(index)}
          >
            {choice}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div style={{ marginTop: 16, padding: 12, background: '#f0f0f0', borderRadius: 4 }}>
          <p style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {selected === question.answer ? '正解！' : '不正解'}
          </p>
          <p style={{ margin: 0 }}>{question.explanation}</p>
          {question.reference && (
            <a
              href={question.reference}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: 8, fontSize: 13, color: '#0066cc' }}
            >
              AWS公式ドキュメント →
            </a>
          )}
        </div>
      )}
      <button
        onClick={handleNext}
        disabled={selected === null}
        style={{
          marginTop: 20,
          padding: '10px 24px',
          fontSize: 15,
          cursor: selected === null ? 'not-allowed' : 'pointer',
          opacity: selected === null ? 0.5 : 1,
        }}
      >
        次へ
      </button>
    </div>
  );
}

export default QuizCard;
