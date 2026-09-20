import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, login } = useAuth()

  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverMessage, setServerMessage] = useState(
    location.state?.message || ''
  )
  const [loading, setLoading] = useState(false)

  if (token) {
    navigate('/home', { replace: true })
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const next = {}
    if (!form.username.trim()) next.username = 'Username is required'
    if (!form.password) next.password = 'Password is required'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validate()
    setErrors(validation)
    setServerMessage('')

    if (Object.keys(validation).length > 0) return

    setLoading(true)
    try {
      await login({
        username: form.username.trim(),
        password: form.password
      })
      navigate('/home', { replace: true })
    } catch (error) {
      setServerMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Login</h1>

        {serverMessage && <div className="alert alert-error">{serverMessage}</div>}
        <div className="alert-placeholder" />

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter username"
            autoComplete="username"
          />
          {errors.username && <span className="field-error">{errors.username}</span>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            autoComplete="current-password"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="switch-link">
          New user? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  )
}