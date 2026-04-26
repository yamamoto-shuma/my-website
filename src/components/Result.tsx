import type { ResultItem } from '../types/quiz';

interface ResultProps {
  results: ResultItem[];
  onRetry: () => void;
  onBackToTop: () => void;
}

function Result({ results, onRetry, onBackToTop }: ResultProps) {
  const total = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const rate = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  const serviceMap: Record<string, { correct: number; total: number }> = {};
  for (const r of results) {
    const s = r.question.service;
    if (!serviceMap[s]) serviceMap[s] = { correct: 0, total: 0 };
    serviceMap[s].total += 1;
    if (r.correct) serviceMap[s].correct += 1;
  }

  const rateColor = rate >= 80 ? '#1D8348' : rate >= 60 ? '#E88B00' : '#C0392B';
  const rateMessage = rate >= 80 ? '素晴らしい結果です！' : rate >= 60 ? 'もう少しで完璧です' : '復習してもう一度挑戦しましょう';

  return (
    <div>
      {/* Header */}
      <div style={{ background: '#232F3E', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#FF9900', fontWeight: 700, fontSize: 20 }}>AWS</span>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 500 }}>Quiz</span>
        <span style={{ marginLeft: 'auto', color: '#9BA7B4', fontSize: 13 }}>結果</span>
      </div>

      <div style={{ maxWidth: 640, margin: '36px auto', padding: '0 20px' }}>
        {/* スコアカード */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ background: '#232F3E', padding: '18px 28px' }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: 17, fontWeight: 600 }}>クイズ完了</h2>
          </div>
          <div style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: 32 }}>
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
              <p style={{ fontSize: 30, fontWeight: 700, color: '#16191F', margin: '0 0 6px' }}>
                {correctCount} <span style={{ fontSize: 16, color: '#5F6B7A', fontWeight: 400 }}>/ {total} 問正解</span>
              </p>
              <p style={{ color: rateColor, fontSize: 14, margin: 0, fontWeight: 500 }}>{rateMessage}</p>
            </div>
          </div>
        </div>

        {/* サービス別内訳 */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '14px 24px', borderBottom: '1px solid #EAEDED' }}>
            <h3 style={{ margin: 0, fontSize: 15, color: '#16191F', fontWeight: 600 }}>サービス別内訳</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F9FA' }}>
                <th style={{ textAlign: 'left', padding: '10px 24px', fontSize: 12, color: '#5F6B7A', fontWeight: 600, letterSpacing: '0.05em' }}>サービス</th>
                <th style={{ textAlign: 'center', padding: '10px 16px', fontSize: 12, color: '#5F6B7A', fontWeight: 600 }}>正解</th>
                <th style={{ textAlign: 'center', padding: '10px 16px', fontSize: 12, color: '#5F6B7A', fontWeight: 600 }}>問題数</th>
                <th style={{ textAlign: 'center', padding: '10px 24px', fontSize: 12, color: '#5F6B7A', fontWeight: 600 }}>正答率</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(serviceMap).map(([service, stats], i) => {
                const sRate = Math.round((stats.correct / stats.total) * 100);
                const color = sRate >= 80 ? '#1D8348' : sRate >= 60 ? '#E88B00' : '#C0392B';
                return (
                  <tr key={service} style={{ borderTop: i === 0 ? 'none' : '1px solid #F2F3F3' }}>
                    <td style={{ padding: '13px 24px', fontSize: 14, fontWeight: 600, color: '#16191F' }}>{service}</td>
                    <td style={{ textAlign: 'center', padding: '13px 16px', fontSize: 14, color: '#3D4149' }}>{stats.correct}</td>
                    <td style={{ textAlign: 'center', padding: '13px 16px', fontSize: 14, color: '#3D4149' }}>{stats.total}</td>
                    <td style={{ textAlign: 'center', padding: '13px 24px' }}>
                      <span style={{ color, fontWeight: 700, fontSize: 14 }}>{sRate}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={onBackToTop}
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
            サービス選択に戻る
          </button>
          <button
            onClick={onRetry}
            className="aws-btn"
            style={{
              padding: '10px 28px',
              fontSize: 14,
              fontWeight: 700,
              background: '#FF9900',
              color: '#16191F',
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

export default Result;
