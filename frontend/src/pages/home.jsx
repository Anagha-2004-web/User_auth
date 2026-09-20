import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import * as api from '../services/api.js'

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function formatDate(timestamp) {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

export default function Home() {
  const navigate = useNavigate()
  const { token, username, user, setUser, logout, clearSession } = useAuth()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDebug, setShowDebug] = useState(false)
  const [decodedToken, setDecodedToken] = useState(null)

  useEffect(() => {
    if (token) {
      setDecodedToken(parseJwt(token))
    }
  }, [token])

  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      if (!token) {
        navigate('/login', { replace: true })
        return
      }
      try {
        const data = await api.getCurrentUser(token)
        if (!cancelled) {
          setUser(data)
          setError('')
        }
      } catch (err) {
        if (err.status === 401) {
          clearSession()
          navigate('/login', {
            replace: true,
            state: { message: 'Session expired. Please login again.' }
          })
        } else if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadUser()
    return () => {
      cancelled = true
    }
  }, [token, navigate, setUser, clearSession])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} copied to clipboard!`)
    } catch {
      alert('Failed to copy')
    }
  }

  const tokenExpiry = decodedToken?.exp ? formatDate(decodedToken.exp) : 'N/A'
  const tokenIssued = decodedToken?.iat ? formatDate(decodedToken.iat) : 'N/A'
  const tokenSubject = decodedToken?.sub || 'N/A'
  const tokenUsername = decodedToken?.username || 'N/A'

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1>Welcome, {user ? user.username : username || 'User'}</h1>
          <button
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.75rem', marginTop: 0, marginBottom: '16px' }}
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>

        {loading && <p className="muted">Loading your information...</p>}
        {error && <div className="alert alert-error">{error}</div>}

        {user && (
          <div className="user-info">
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone</span>
              <span className="info-value">{user.phone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">User ID</span>
              <span className="info-value">{user.userId}</span>
            </div>
          </div>
        )}

        {showDebug && token && (
          <div style={{ marginTop: '24px', padding: '16px', background: '#111118', borderRadius: '8px', border: '1px solid #2a2a3a' }}>
            <h3 style={{ color: '#f5d566', marginBottom: '12px', fontSize: '0.9rem' }}>Debug Information</h3>
            
            <div style={{ marginBottom: '12px', fontSize: '0.75rem', lineHeight: '1.6' }}>
              <strong>JWT Token:</strong>
              <div style={{ 
                marginTop: '8px', 
                padding: '8px', 
                background: '#0a0a0f', 
                borderRadius: '4px', 
                fontSize: '0.65rem', 
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                color: '#777788'
              }}>
                {token}
              </div>
              <button 
                className="btn-secondary" 
                style={{ marginTop: '8px', padding: '6px 12px', fontSize: '0.7rem' }}
                onClick={() => copyToClipboard(token, 'JWT Token')}
              >
                Copy Token
              </button>
            </div>

            <div style={{ marginBottom: '12px', fontSize: '0.75rem', lineHeight: '1.8' }}>
              <strong>Token Details:</strong>
              <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '0.7rem', color: '#777788' }}>
                <div><strong>Subject (User ID):</strong> {tokenSubject}</div>
                <div><strong>Username:</strong> {tokenUsername}</div>
                <div><strong>Issued At:</strong> {tokenIssued}</div>
                <div><strong>Expires At:</strong> <span style={{ color: '#28c840' }}>{tokenExpiry}</span></div>
                <div><strong>Algorithm:</strong> HS512</div>
              </div>
            </div>

            <div style={{ marginBottom: '12px', fontSize: '0.75rem', lineHeight: '1.8' }}>
              <strong>User Credentials:</strong>
              <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '0.7rem', color: '#777788' }}>
                <div><strong>Username:</strong> {user?.username || username}</div>
                <div><strong>Email:</strong> {user?.email}</div>
                <div><strong>Phone:</strong> {user?.phone}</div>
                <div><strong>User ID:</strong> {user?.userId}</div>
              </div>
            </div>

            <div style={{ 
              marginTop: '12px', 
              padding: '8px', 
              background: 'rgba(255,77,77,0.1)', 
              border: '1px solid rgba(255,77,77,0.3)', 
              borderRadius: '4px',
              fontSize: '0.7rem',
              color: '#ff4d4d'
            }}>
              <strong>⚠ Security Notice:</strong> Never share your JWT token. It provides full access to your account.
            </div>
          </div>
        )}

        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}