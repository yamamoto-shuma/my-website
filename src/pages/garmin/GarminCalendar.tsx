import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchActivities } from '../../lib/garminApi'
import { signOut } from '../../lib/cognito'

function formatDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function detectIcons(activities: unknown[]): string[] {
  const icons: string[] = []
  for (const a of activities) {
    const act = a as { activityType?: string }
    const t = (act.activityType || '').toLowerCase()
    if (t.includes('swim') && !icons.includes('🏊')) icons.push('🏊')
    if ((t.includes('cycling') || t.includes('bike')) && !icons.includes('🚴')) icons.push('🚴')
    if ((t.includes('running') || t.includes('run')) && !icons.includes('🏃')) icons.push('🏃')
  }
  return icons
}

export default function GarminCalendar() {
  const navigate = useNavigate()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [activityMap, setActivityMap] = useState<Map<string, string[]>>(new Map())
  const [loading, setLoading] = useState(false)

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1

  const loadMonth = useCallback(async (y: number, m: number) => {
    setLoading(true)
    const daysInMonth = new Date(y, m, 0).getDate()
    const todayStr = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
    const dates: string[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(y, m, d)
      if (dateStr <= todayStr) dates.push(dateStr)
    }

    const results = await Promise.allSettled(dates.map(d => fetchActivities(d)))
    const newMap = new Map<string, string[]>()
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0) {
        newMap.set(dates[i], detectIcons(r.value))
      }
    })
    setActivityMap(newMap)
    setLoading(false)
  }, [])

  useEffect(() => { loadMonth(year, month) }, [year, month, loadMonth])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (isCurrentMonth) return
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  function handleDateClick(dateStr: string) {
    const todayStr = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
    if (dateStr > todayStr) return
    navigate(`/garmin/${dateStr}`)
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDow = new Date(year, month - 1, 1).getDay()
  const todayStr = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const cells: (string | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(formatDate(year, month, d))

  const dowLabels = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ color: 'var(--color-text-primary)', fontSize: 18, fontWeight: 700 }}>トレーニングログ</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/garmin/profile')} className="garmin-btn-outline" style={{ padding: '6px 12px', fontSize: 13 }}>
            プロフィール
          </button>
          <button onClick={() => { signOut(); navigate('/garmin/login') }} className="garmin-btn-outline" style={{ padding: '6px 12px', fontSize: 13, borderColor: '#9E9E9E', color: '#9E9E9E' }}>
            ログアウト
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 20, cursor: 'pointer' }}>‹</button>
        <span style={{ color: 'var(--color-text-primary)', fontSize: 18, fontWeight: 600 }}>
          {year}年{month}月 {loading && <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>読込中...</span>}
        </span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          style={{ background: 'none', border: 'none', color: isCurrentMonth ? 'var(--color-tag-border)' : 'var(--color-primary)', fontSize: 20, cursor: isCurrentMonth ? 'not-allowed' : 'pointer' }}
        >›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {dowLabels.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-secondary)', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} />
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr
          const icons = activityMap.get(dateStr) || []
          const day = parseInt(dateStr.split('-')[2])
          return (
            <div
              key={dateStr}
              onClick={() => handleDateClick(dateStr)}
              style={{
                background: isToday ? 'var(--color-primary)' : 'var(--color-surface)',
                borderRadius: 8,
                padding: '8px 4px',
                textAlign: 'center',
                cursor: isFuture ? 'default' : 'pointer',
                opacity: isFuture ? 0.3 : 1,
                minHeight: 56,
              }}
            >
              <div style={{ fontSize: 14, color: isToday ? '#fff' : 'var(--color-text-primary)', fontWeight: isToday ? 700 : 400 }}>
                {day}
              </div>
              {icons.length > 0 && (
                <div style={{ fontSize: 10, marginTop: 4 }}>{icons.join('')}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
