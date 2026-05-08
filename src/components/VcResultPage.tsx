import type { VcResultItem } from '../types/vcQuiz';

interface VcResultPageProps {
  results: VcResultItem[];
  onRetry: () => void;
}

function VcResultPage({ results, onRetry }: VcResultPageProps) {
  const total = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const rate = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  const rateColor = rate >= 80 ? '#1D8348' : rate >= 60 ? '#E88B00' : 'var(--vc-primary)';
  const rateMessage = rate >= 80 ? '素晴らしい結果です！' : rate >= 60 ? 'もう少しで完璧です' : '復習してもう一度挑戦しましょう';

  return (
    <div>
      {/* Header */}
      <div style={{ background: '#1A1A1A', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: 'var(--vc-primary)', fontWeight: 700, fontSize: 20 }}>声優</span>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 500 }}>クイズ</span>
        <span style={{ marginLeft: 'auto', color: '#9BA7B4', fontSize: 13 }}>結果</span>
      </div>

      <div style={{ maxWidth: 640, margin: '36px auto', padding: '0 20px' }}>
        {/* スコアカード */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ background: '#1A1A1A', padding: '18px 28px' }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: 17, fontWeight: 600 }}>クイズ完了</h2>
          </div>
          <div style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                border: `5px solid ${rateColor}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: rateColor }}>{rate}%</span>
              </div>
              <p style={{ margin: '8px 0 0', color: '#8A9199', fontSize: 12, fontWeight: 500 }}>正答率</p>
            </div>
            <div>
              <p style={{ fontSize: 30, fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>
                {correctCount} <span style={{ fontSize: 16, color: '#5F6B7A', fontWeight: 400 }}>/ {total} 問正解</span>
              </p>
              <p style={{ color: rateColor, fontSize: 14, margin: 0, fontWeight: 500 }}>{rateMessage}</p>
            </div>
          </div>
        </div>

        {/* 問題一覧 */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '14px 24px', borderBottom: '1px solid #EAEDED' }}>
            <h3 style={{ margin: 0, fontSize: 15, color: '#1A1A1A', fontWeight: 600 }}>問題一覧</h3>
          </div>
          <div style={{ padding: '8px 0' }}>
            {results.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: '14px 24px',
                  borderBottom: i < results.length - 1 ? '1px solid #F2F3F3' : 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <span style={{
                  flexShrink: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: r.correct ? '#1D8348' : 'var(--vc-primary)',
                  minWidth: 24,
                }}>
                  {r.correct ? '○' : '✗'}
                </span>
                <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6 }}>
                  <p style={{ margin: '0 0 4px', color: '#3D4149' }}>{r.question.questionText}</p>
                  <p style={{ margin: 0, color: '#1D8348', fontWeight: 500 }}>正解：{r.question.correctAnswer}</p>
                  {!r.correct && (
                    <p style={{ margin: '2px 0 0', color: 'var(--vc-primary)', fontWeight: 500 }}>
                      あなたの回答：{r.userAnswer}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onRetry}
            className="vc-btn"
            style={{
              padding: '10px 28px',
              fontSize: 14,
              fontWeight: 700,
              background: 'var(--vc-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            もう一度
          </button>
        </div>
      </div>
    </div>
  );
}

export default VcResultPage;
