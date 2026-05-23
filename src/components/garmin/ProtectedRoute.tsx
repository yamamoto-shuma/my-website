import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../../lib/cognito'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'ok' | 'ng'>('loading')

  useEffect(() => {
    isAuthenticated().then(ok => setState(ok ? 'ok' : 'ng'))
  }, [])

  if (state === 'loading') {
    return <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }} />
  }
  if (state === 'ng') return <Navigate to="/garmin/login" replace />
  return <>{children}</>
}
