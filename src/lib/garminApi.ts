const BASE_URL = import.meta.env.VITE_GARMIN_API_URL

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const { getValidToken } = await import('./cognito')
  const token = await getValidToken()
  if (!token) throw new Error('Unauthorized')
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: token, ...options.headers },
  })
}

export async function fetchActivities(date: string) {
  const res = await authFetch(`/garmin/activities/${date}`)
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function fetchNotes(date: string) {
  const res = await authFetch(`/garmin/notes/${date}`)
  if (res.status === 404) return {}
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function saveNotes(
  date: string,
  notes: { good: string; problem: string; others: string }
) {
  const res = await authFetch(`/garmin/notes/${date}`, {
    method: 'PUT',
    body: JSON.stringify(notes),
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
}

export async function fetchAnalysis(date: string) {
  const res = await authFetch(`/garmin/analysis/${date}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  const data = await res.json()
  return data.analysis as string
}

export async function generateAnalysis(date: string) {
  const res = await authFetch(`/garmin/analysis/${date}`, { method: 'POST' })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  const data = await res.json()
  return data.analysis as string
}

export async function fetchProfile() {
  const res = await authFetch('/garmin/profile')
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}

export async function saveProfile(profile: Record<string, string>) {
  const res = await authFetch('/garmin/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
}
