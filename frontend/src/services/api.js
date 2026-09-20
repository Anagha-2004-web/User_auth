const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function parseError(res, fallback) {
  return res.json().then((data) => {
    const error = new Error(data.message || fallback)
    error.status = res.status
    throw error
  })
}

export async function register({ username, password, confirmPassword, email, phone }) {
  const res = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, confirmPassword, email, phone })
  })

  if (!res.ok) {
    await parseError(res, 'Registration failed')
  }
  return res.json()
}

export async function login({ username, password }) {
  const res = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  if (!res.ok) {
    await parseError(res, 'Login failed')
  }
  return res.json()
}

export async function getCurrentUser(token) {
  const res = await fetch(`${API_BASE_URL}/api/user`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    await parseError(res, 'Failed to load user information')
  }
  return res.json()
}

export async function logout(token) {
  const res = await fetch(`${API_BASE_URL}/api/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    await parseError(res, 'Logout failed')
  }
  return res.json()
}