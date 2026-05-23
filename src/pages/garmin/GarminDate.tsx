import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ActivityCard from '../../components/garmin/ActivityCard'
import type { Activity } from '../../components/garmin/ActivityCard'
import { fetchActivities, fetchNotes, saveNotes, fetchAnalysis, generateAnalysis } from '../../lib/garminApi'

interface Notes {
  good?: string
  problem?: string
  others?: string
}

function formatDateJa(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${y}年${parseInt(m)}月${parseInt(d)}日`
}

export default function GarminDate() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()

  const [activities, setActivities] = useState<Activity[]>([])
  const [actLoading, setActLoading] = useState(true)
  const [actError, setActError] = useState(false)

  const [notes, setNotes] = useState<Notes>({})
  const [editMode, setEditMode] = useState(false)
  const [editNotes, setEditNotes] = useState<Notes>({})
  const [saveLoading, setSaveLoading] = useState(false)

  const [analysis, setAnalysis] = useState<string | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!date) return

    setActLoading(true)
    fetchActivities(date)
      .then((data: Activity[]) => { setActivities(data); setActError(false) })
      .catch(() => setActError(true))
      .finally(() => setActLoading(false))

    fetchNotes(date).then(setNotes).catch(() => {})

    setAnalysisLoading(true)
    fetchAnalysis(date)
      .then(setAnalysis)
      .catch(() => setAnalysis(null))
      .finally(() => setAnalysisLoading(false))
  }, [date])

  function startEdit() {
    setEditNotes({ ...notes })
    setEditMode(true)
  }

  function cancelEdit() {
    setEditMode(false)
    setEditNotes({})
  }

  async function handleSaveNotes() {
    if (!date) return
    setSaveLoading(true)
    try {
      const n = { good: editNotes.good || '', problem: editNotes.problem || '', others: editNotes.others || '' }
      await saveNotes(date, n)
      setNotes(n)
      setEditMode(false)
    } catch {
      alert('保存に失敗しました')
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleGenerate() {
    if (!date) return
    setGenerating(true)
    try {
      const result = await generateAnalysis(date)
      setAnalysis(result)
    } catch {
      alert('分析の生成に失敗しました')
    } finally {
      setGenerating(false)
    }
  }

  const sectionStyle: React.CSSProperties = {
    background: 'var(--color-surface)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  }

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-tag-border)',
    borderRadius: 6,
    color: 'var(--color-text-primary)',
    fontSize: 14,
    padding: 10,
    resize: 'vertical',
    minHeight: 80,
    boxSizing: 'border-box',
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => navigate('/garmin')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: 16 }}>
          ← 戻る
        </button>
        <h2 style={{ color: 'var(--color-text-primary)', fontSize: 18, fontWeight: 700 }}>
          {date ? formatDateJa(date) : ''}
        </h2>
      </div>

      {/* Activities */}
      <h3 style={{ color: 'var(--color-text-secondary)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>アクティビティ</h3>
      {actLoading ? (
        <div style={{ ...sectionStyle, color: 'var(--color-text-secondary)', textAlign: 'center' }}>読込中...</div>
      ) : actError ? (
        <div style={{ ...sectionStyle, color: '#FF3B30', textAlign: 'center' }}>データの取得に失敗しました</div>
      ) : activities.length === 0 ? (
        <div style={{ ...sectionStyle, color: 'var(--color-text-secondary)', textAlign: 'center' }}>表示するアクティビティがありません</div>
      ) : (
        activities.map((a, i) => <ActivityCard key={a.activityId ?? i} activity={a} />)
      )}

      {/* Notes */}
      <h3 style={{ color: 'var(--color-text-secondary)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>トレーニングノート</h3>
      <div style={sectionStyle}>
        {editMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(['good', 'problem', 'others'] as const).map(key => (
              <div key={key}>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                  {key === 'good' ? 'Good' : key === 'problem' ? 'Problem' : 'Others'}
                </label>
                <textarea
                  value={editNotes[key] || ''}
                  onChange={e => setEditNotes(n => ({ ...n, [key]: e.target.value }))}
                  style={textareaStyle}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSaveNotes} disabled={saveLoading} className="garmin-btn-primary" style={{ flex: 1 }}>
                {saveLoading ? '保存中...' : '保存'}
              </button>
              <button onClick={cancelEdit} className="garmin-btn-outline" style={{ flex: 1 }}>キャンセル</button>
            </div>
          </div>
        ) : (
          <div>
            {(['good', 'problem', 'others'] as const).map(key => (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  {key === 'good' ? 'Good' : key === 'problem' ? 'Problem' : 'Others'}
                </div>
                <div style={{ fontSize: 14, color: notes[key] ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                  {notes[key] || '---'}
                </div>
              </div>
            ))}
            <button onClick={startEdit} className="garmin-btn-outline" style={{ marginTop: 4 }}>編集</button>
          </div>
        )}
      </div>

      {/* AI Analysis */}
      <h3 style={{ color: 'var(--color-text-secondary)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>AIコーチング</h3>
      <div style={sectionStyle}>
        {analysisLoading ? (
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>分析を取得中...</p>
        ) : analysis ? (
          <div>
            <pre style={{ fontSize: 14, color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', margin: 0, marginBottom: 16, lineHeight: 1.6 }}>
              {analysis}
            </pre>
            <button onClick={handleGenerate} disabled={generating} className="garmin-btn-outline">
              {generating ? '分析中...' : '再分析'}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 12 }}>
              アクティビティとノートをもとにAIがアドバイスを生成します
            </p>
            <button onClick={handleGenerate} disabled={generating} className="garmin-btn-primary">
              {generating ? '分析中...' : '分析を生成'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
