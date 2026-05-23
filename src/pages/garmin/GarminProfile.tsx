import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProfile, saveProfile } from '../../lib/garminApi'

interface Profile {
  targetRace?: string
  currentLevel?: string
  experience?: string
  notes?: string
}

export default function GarminProfile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchProfile().then(setProfile).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await saveProfile(profile as Record<string, string>)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 10,
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-tag-border)',
    borderRadius: 6,
    color: 'var(--color-text-primary)',
    fontSize: 14,
    boxSizing: 'border-box',
  }

  const fields: { key: keyof Profile; label: string; textarea?: boolean }[] = [
    { key: 'targetRace', label: '目標レース' },
    { key: 'currentLevel', label: '現在の実力' },
    { key: 'experience', label: 'トライアスロン歴' },
    { key: 'notes', label: '備考', textarea: true },
  ]

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/garmin')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: 16 }}>
          ← 戻る
        </button>
        <h2 style={{ color: 'var(--color-text-primary)', fontSize: 18, fontWeight: 700 }}>プロフィール設定</h2>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>読込中...</p>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>{f.label}</label>
              {f.textarea ? (
                <textarea
                  value={profile[f.key] || ''}
                  onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              ) : (
                <input
                  type="text"
                  value={profile[f.key] || ''}
                  onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                  style={inputStyle}
                />
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="submit" disabled={saving} className="garmin-btn-primary" style={{ flex: 1 }}>
              {saving ? '保存中...' : '保存'}
            </button>
            {saved && <span style={{ color: '#30D158', fontSize: 14 }}>✓ 保存しました</span>}
          </div>
        </form>
      )}
    </div>
  )
}
