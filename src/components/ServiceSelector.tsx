interface ServiceSelectorProps {
  services: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onStart: () => void;
  questionCount: number;
}

function ServiceSelector({ services, selected, onChange, onStart, questionCount }: ServiceSelectorProps) {
  const toggle = (service: string) => {
    if (selected.includes(service)) {
      onChange(selected.filter((s) => s !== service));
    } else {
      onChange([...selected, service]);
    }
  };

  const allSelected = selected.length === services.length;
  const toggleAll = () => onChange(allSelected ? [] : [...services]);

  return (
    <div>
      {/* Header */}
      <div style={{ background: '#232F3E', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#FF9900', fontWeight: 700, fontSize: 20 }}>AWS</span>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 500 }}>Quiz</span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {/* Card header */}
          <div style={{ background: '#232F3E', padding: '18px 28px' }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: 17, fontWeight: 600 }}>サービスを選択</h2>
            <p style={{ color: '#9BA7B4', margin: '4px 0 0', fontSize: 13, fontWeight: 400 }}>出題するAWSサービスを選んでください</p>
          </div>

          {/* Card body */}
          <div style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <span onClick={toggleAll} style={{ color: '#0073BB', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                {allSelected ? 'すべて解除' : 'すべて選択'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {services.map((service) => {
                const checked = selected.includes(service);
                return (
                  <label
                    key={service}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      border: `2px solid ${checked ? '#FF9900' : '#D5DBDB'}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: checked ? '#FFF8EC' : '#FAFAFA',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(service)}
                      style={{ width: 16, height: 16, accentColor: '#FF9900' }}
                    />
                    <span style={{ fontWeight: 600, fontSize: 15, color: '#16191F' }}>{service}</span>
                  </label>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ color: '#5F6B7A', fontSize: 14 }}>選択中の問題数</span>
              <span style={{ color: '#5F6B7A', fontSize: 14, fontWeight: 500 }}>
                {questionCount} 問
              </span>
            </div>

            <button
              onClick={onStart}
              disabled={questionCount === 0}
              style={{
                width: '100%',
                padding: '12px 0',
                fontSize: 15,
                fontWeight: 700,
                background: questionCount === 0 ? '#D5DBDB' : '#FF9900',
                color: questionCount === 0 ? '#9BA7B4' : '#16191F',
                border: 'none',
                borderRadius: 8,
                cursor: questionCount === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              クイズを開始する（{questionCount}問）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceSelector;
