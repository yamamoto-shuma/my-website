import type { Title } from '../types/vcQuiz';

interface VcTitleSelectorProps {
  titles: Title[];
  selectedIds: string[];
  questionCount: number;
  onChangeSelected: (ids: string[]) => void;
  onChangeCount: (count: number) => void;
  onStart: () => void;
  error?: string | null;
}

function VcTitleSelector({
  titles,
  selectedIds,
  questionCount,
  onChangeSelected,
  onChangeCount,
  onStart,
  error,
}: VcTitleSelectorProps) {
  const allSelected = selectedIds.length === titles.length;

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChangeSelected(selectedIds.filter((s) => s !== id));
    } else {
      onChangeSelected([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    onChangeSelected(allSelected ? [] : titles.map((t) => t.id));
  };

  const canStart = selectedIds.length > 0;

  return (
    <div>
      {/* Header */}
      <div style={{ background: '#1A1A1A', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: 'var(--vc-primary)', fontWeight: 700, fontSize: 20 }}>声優</span>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 500 }}>クイズ</span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {/* Card header */}
          <div style={{ background: '#1A1A1A', padding: '18px 28px' }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: 17, fontWeight: 600 }}>作品を選択</h2>
            <p style={{ color: '#9BA7B4', margin: '4px 0 0', fontSize: 13, fontWeight: 400 }}>出題する作品を選んでください</p>
          </div>

          {/* Card body */}
          <div style={{ padding: 28 }}>
            {error && (
              <div style={{ background: '#FEE', border: '1px solid #F66', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#C00', fontSize: 14 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button
                onClick={toggleAll}
                className="vc-btn"
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--vc-primary)', fontSize: 13, cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}
              >
                {allSelected ? 'すべて解除' : 'すべて選択'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {titles.map((title) => {
                const checked = selectedIds.includes(title.id);
                return (
                  <label
                    key={title.id}
                    className={`vc-label${checked ? '' : ' vc-label--unchecked'}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      border: `2px solid ${checked ? 'var(--vc-primary)' : '#D5DBDB'}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: checked ? 'var(--vc-surface)' : '#FAFAFA',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(title.id)}
                      style={{ width: 16, height: 16, accentColor: 'var(--vc-primary)', flexShrink: 0 }}
                    />
                    <span style={{ fontWeight: 600, fontSize: 15, color: '#1A1A1A', flex: 1 }}>{title.title}</span>
                    <span style={{ fontSize: 12, color: '#8A9199', flexShrink: 0 }}>{title.broadcast_year}</span>
                  </label>
                );
              })}
            </div>

            {/* 問題数設定 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '16px', background: '#F8F9FA', borderRadius: 8 }}>
              <label style={{ fontSize: 14, color: '#3D4149', fontWeight: 500, flex: 1 }}>問題数</label>
              <input
                type="number"
                min={1}
                max={50}
                value={questionCount}
                onChange={(e) => onChangeCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                style={{
                  width: 64,
                  padding: '6px 10px',
                  fontSize: 15,
                  fontWeight: 600,
                  border: '1.5px solid #D5DBDB',
                  borderRadius: 6,
                  textAlign: 'center',
                  fontFamily: 'inherit',
                  color: '#1A1A1A',
                }}
              />
              <span style={{ fontSize: 14, color: '#3D4149' }}>問</span>
            </div>

            <button
              onClick={onStart}
              disabled={!canStart}
              className="vc-btn"
              style={{
                width: '100%',
                padding: '12px 0',
                fontSize: 15,
                fontWeight: 700,
                background: !canStart ? '#D5DBDB' : 'var(--vc-primary)',
                color: !canStart ? '#9BA7B4' : '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: !canStart ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              クイズを開始する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VcTitleSelector;
