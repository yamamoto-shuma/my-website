import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, confirmMfa } from '../../lib/cognito'
import type { CognitoUser } from 'amazon-cognito-identity-js'

export default function GarminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [step, setStep] = useState<'login' | 'mfa'>('login')
  const [pendingUser, setPendingUser] = useState<CognitoUser | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn(email, password)
      if (result.mfaRequired && result.cognitoUser) {
        setPendingUser(result.cognitoUser)
        setStep('mfa')
      } else {
        navigate('/garmin')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault()
    if (!pendingUser) return
    setError('')
    setLoading(true)
    try {
      await confirmMfa(pendingUser, mfaCode)
      navigate('/garmin')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '認証コードが正しくありません')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-tag-border)',
    borderRadius: 6,
    color: 'var(--color-text-primary)',
    fontSize: 14,
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      background: 'var(--color-bg)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 12,
        padding: 32,
        width: '100%',
        maxWidth: 400,
      }}>
        <h1 style={{ color: 'var(--color-primary)', fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
          Garmin Training Log
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
          {step === 'login' ? 'ログイン' : 'メール認証コードを入力'}
        </p>

        {step === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            {error && <p style={{ color: '#FF3B30', fontSize: 13 }}>{error}</p>}
            <button type="submit" disabled={loading} className="garmin-btn-primary" style={{ marginTop: 8 }}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfa} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>認証コード（6桁）</label>
              <input
                type="text"
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value)}
                maxLength={6}
                required
                style={inputStyle}
              />
            </div>
            {error && <p style={{ color: '#FF3B30', fontSize: 13 }}>{error}</p>}
            <button type="submit" disabled={loading} className="garmin-btn-primary">
              {loading ? '確認中...' : '確認'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
