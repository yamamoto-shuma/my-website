interface PhaseGroup {
  phase: number;
  label: string;
  services: string[];
}

interface ServiceSelectorProps {
  phaseGroups: PhaseGroup[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onStart: () => void;
  error?: string | null;
}

function ServiceSelector({ phaseGroups, selected, onChange, onStart, error }: ServiceSelectorProps) {
  const allServices = phaseGroups.flatMap((g) => g.services);

  const toggle = (service: string) => {
    if (selected.includes(service)) {
      onChange(selected.filter((s) => s !== service));
    } else {
      onChange([...selected, service]);
    }
  };

  const allSelected = selected.length === allServices.length;
  const toggleAll = () => onChange(allSelected ? [] : [...allServices]);

  const togglePhase = (services: string[]) => {
    const allPhaseSelected = services.every((s) => selected.includes(s));
    if (allPhaseSelected) {
      onChange(selected.filter((s) => !services.includes(s)));
    } else {
      const toAdd = services.filter((s) => !selected.includes(s));
      onChange([...selected, ...toAdd]);
    }
  };

  const canStart = selected.length > 0;

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
            {error && (
              <div style={{ background: '#FEE', border: '1px solid #F66', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#C00', fontSize: 14 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button
                onClick={toggleAll}
                className="aws-btn"
                style={{ background: 'none', border: 'none', padding: 0, color: '#0073BB', fontSize: 13, cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}
              >
                {allSelected ? 'すべて解除' : 'すべて選択'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 28 }}>
              {phaseGroups.map((group) => {
                const allPhaseSelected = group.services.every((s) => selected.includes(s));
                return (
                  <div key={group.phase}>
                    {/* Phase section header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                      paddingBottom: 6,
                      borderBottom: '2px solid #F0F2F3',
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#5F6B7A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {group.label}
                      </span>
                      <button
                        onClick={() => togglePhase(group.services)}
                        className="aws-btn"
                        style={{ background: 'none', border: 'none', padding: 0, color: '#0073BB', fontSize: 12, cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}
                      >
                        {allPhaseSelected ? '解除' : '選択'}
                      </button>
                    </div>

                    {/* Service checkboxes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {group.services.map((service) => {
                        const checked = selected.includes(service);
                        return (
                          <label
                            key={service}
                            className={`service-label${checked ? '' : ' service-label--unchecked'}`}
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
                            <span style={{ fontWeight: 600, fontSize: 15, color: '#16191F', flex: 1 }}>{service}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ color: '#5F6B7A', fontSize: 14 }}>選択中のサービス数</span>
              <span style={{ color: '#5F6B7A', fontSize: 14, fontWeight: 500 }}>
                {selected.length} / {allServices.length}
              </span>
            </div>

            <button
              onClick={onStart}
              disabled={!canStart}
              className="aws-btn"
              style={{
                width: '100%',
                padding: '12px 0',
                fontSize: 15,
                fontWeight: 700,
                background: !canStart ? '#D5DBDB' : '#FF9900',
                color: !canStart ? '#9BA7B4' : '#16191F',
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

export default ServiceSelector;
