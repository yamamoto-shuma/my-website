interface Activity {
  activityId?: string | number
  activityName?: string
  activityType: string
  distance?: number
  duration?: number
  averageHR?: number
  averageSwolf?: number
  averageStrokeRate?: number
  averageSpeed?: number
  averageBikeCadence?: number
  elevationGain?: number
  aerobicTrainingEffect?: number
  averageRunningCadenceInStepsPerMinute?: number
  vO2MaxValue?: number
}

interface Props {
  activity: Activity
}

export type { Activity }

function detectType(typeKey: string): 'swim' | 'bike' | 'run' | 'other' {
  const k = typeKey.toLowerCase()
  if (k.includes('swim')) return 'swim'
  if (k.includes('cycling') || k.includes('bike')) return 'bike'
  if (k.includes('running') || k.includes('run')) return 'run'
  return 'other'
}

function fmtDistance(m?: number): string {
  if (m == null) return '--'
  return `${(m / 1000).toFixed(2)} km`
}

function fmtDuration(s?: number): string {
  if (s == null) return '--'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

function fmtPace(speedMs?: number): string {
  if (!speedMs || speedMs === 0) return '--'
  const secPerKm = 1000 / speedMs
  const m = Math.floor(secPerKm / 60)
  const s = Math.floor(secPerKm % 60)
  return `${m}'${String(s).padStart(2, '0')}"/km`
}

function fmtSpeed(speedMs?: number): string {
  if (speedMs == null) return '--'
  return `${(speedMs * 3.6).toFixed(1)} km/h`
}

function fmtNum(v?: number, digits = 1): string {
  if (v == null) return '--'
  return Number.isInteger(v) ? String(v) : v.toFixed(digits)
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default function ActivityCard({ activity }: Props) {
  const type = detectType(activity.activityType)

  const accentBorder =
    type === 'swim' ? 'var(--color-activity-swim)'
    : type === 'bike' ? 'var(--color-activity-bike)'
    : type === 'run' ? 'var(--color-activity-run)'
    : 'var(--color-primary)'

  const title = activity.activityName || activity.activityType

  const swimMetrics = [
    { label: 'SWOLF', value: fmtNum(activity.averageSwolf, 0) },
    { label: 'ストロークレート', value: fmtNum(activity.averageStrokeRate, 0) },
    { label: '心拍数', value: fmtNum(activity.averageHR, 0) },
  ]

  const bikeMetrics = [
    { label: '平均速度', value: fmtSpeed(activity.averageSpeed) },
    { label: 'ケイデンス', value: fmtNum(activity.averageBikeCadence, 0) },
    { label: '獲得標高', value: activity.elevationGain != null ? `${Math.round(activity.elevationGain)} m` : '--' },
    { label: '心拍数', value: fmtNum(activity.averageHR, 0) },
    { label: 'TE', value: fmtNum(activity.aerobicTrainingEffect) },
  ]

  const runMetrics = [
    { label: 'ペース', value: fmtPace(activity.averageSpeed) },
    { label: 'ケイデンス', value: fmtNum(activity.averageRunningCadenceInStepsPerMinute, 0) },
    { label: 'VO2Max', value: fmtNum(activity.vO2MaxValue) },
    { label: '心拍数', value: fmtNum(activity.averageHR, 0) },
    { label: 'TE', value: fmtNum(activity.aerobicTrainingEffect) },
  ]

  const subMetrics =
    type === 'swim' ? swimMetrics
    : type === 'bike' ? bikeMetrics
    : type === 'run' ? runMetrics
    : [{ label: '心拍数', value: fmtNum(activity.averageHR, 0) }]

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 12,
      borderLeft: `4px solid ${accentBorder}`,
    }}>
      {type === 'run' && (
        <div style={{ height: 4, background: 'linear-gradient(135deg, var(--color-activity-run), var(--color-activity-run-end))' }} />
      )}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>
          {fmtDistance(activity.distance)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>距離</div>
        <div style={{ fontSize: 16, color: 'var(--color-text-primary)', marginBottom: 12 }}>
          ⏱ {fmtDuration(activity.duration)}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderTop: '1px solid var(--color-divider)',
        }}>
          {subMetrics.map((m, i) => (
            <div key={m.label} style={{
              borderBottom: i < subMetrics.length - 2 ? '1px solid var(--color-divider)' : 'none',
              borderRight: i % 2 === 0 ? '1px solid var(--color-divider)' : 'none',
              paddingLeft: i % 2 === 0 ? 0 : 12,
            }}>
              <MetricCell label={m.label} value={m.value} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
