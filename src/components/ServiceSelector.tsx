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

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>サービスを選択してください</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {services.map((service) => (
          <label key={service} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selected.includes(service)}
              onChange={() => toggle(service)}
            />
            {service}
          </label>
        ))}
      </div>
      <button
        onClick={onStart}
        disabled={questionCount === 0}
        style={{
          padding: '10px 24px',
          fontSize: 16,
          cursor: questionCount === 0 ? 'not-allowed' : 'pointer',
          opacity: questionCount === 0 ? 0.5 : 1,
        }}
      >
        開始（{questionCount}問）
      </button>
    </div>
  );
}

export default ServiceSelector;
