import type { ResultItem } from '../types/quiz';

interface ResultProps {
  results: ResultItem[];
  onRetry: () => void;
}

function Result({ results, onRetry }: ResultProps) {
  const total = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const rate = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  const serviceMap: Record<string, { correct: number; total: number }> = {};
  for (const r of results) {
    const s = r.question.service;
    if (!serviceMap[s]) {
      serviceMap[s] = { correct: 0, total: 0 };
    }
    serviceMap[s].total += 1;
    if (r.correct) serviceMap[s].correct += 1;
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>結果</h2>
      <p style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>
        {correctCount} / {total} 問正解
      </p>
      <p style={{ fontSize: 18, marginBottom: 24 }}>正答率: {rate}%</p>
      <h3 style={{ marginBottom: 8 }}>サービス別内訳</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #ccc' }}>サービス</th>
            <th style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '1px solid #ccc' }}>正解</th>
            <th style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '1px solid #ccc' }}>問題数</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(serviceMap).map(([service, stats]) => (
            <tr key={service}>
              <td style={{ padding: '6px 8px' }}>{service}</td>
              <td style={{ textAlign: 'center', padding: '6px 8px' }}>{stats.correct}</td>
              <td style={{ textAlign: 'center', padding: '6px 8px' }}>{stats.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={onRetry} style={{ padding: '10px 24px', fontSize: 15, cursor: 'pointer' }}>
        もう一度
      </button>
    </div>
  );
}

export default Result;
