import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import * as api from '../services/api.js'

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const PHONE_REGEX = /^[0-9]{10,15}$/

export default function Signup() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: ''
  })
  const [errors, setErrors] = useState({})
  const [serverMessage, setServerMessage] = useState('')
  const [success, setSuccess] = useState('')
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
    else if (form.username.trim().length < 3 || form.username.trim().length > 50)
      next.username = 'Username must be 3-50 characters'

    if (!form.password) next.password = 'Password is required'
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters'

    if (!form.confirmPassword) next.confirmPassword = 'Confirm password is required'
    else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match'

    if (!form.email.trim()) next.email = 'Email is required'
    else if (!EMAIL_REGEX.test(form.email.trim())) next.email = 'Enter a valid email address'

    if (!form.phone.trim()) next.phone = 'Phone is required'
    else if (!PHONE_REGEX.test(form.phone.trim())) next.phone = 'Enter a valid phone number (10-15 digits)'

    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validate()
    setErrors(validation)
    setServerMessage('')
    setSuccess('')

    if (Object.keys(validation).length > 0) return

    setLoading(true)
    try {
      await api.register(form)
      setSuccess('Account created successfully! Please login.')
      setTimeout(() => navigate('/login', {
        replace: true,
        state: { message: 'Account created successfully! Please login.' }
      }), 1200)
    } catch (error) {
      setServerMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create Account</h1>

        {serverMessage && <div className="alert alert-error">{serverMessage}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {!success && <div className="alert-placeholder" />}

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
            placeholder="Min 8 characters"
            autoComplete="new-password"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            autoComplete="new-password"
          />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-15 digits"
            autoComplete="tel"
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>

        <p className="switch-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}