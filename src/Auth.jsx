import { useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './firebaseConfig'

const authErrorMessages = {
  'auth/email-already-in-use': 'That username is already taken. Try another.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/user-not-found': 'No account found with that username.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
}

const getAuthErrorMessage = (error) => {
  if (!error?.code) return 'Something went wrong. Please try again.'
  return authErrorMessages[error.code] || 'Unable to sign in right now. Please try again.'
}

export default function Auth({ user, onAuthStateChange }) {
  const [mode, setMode] = useState('signin')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      onAuthStateChange?.(currentUser)
    })
    return () => unsubscribe()
  }, [onAuthStateChange])

  const formTitle = useMemo(
    () => (mode === 'signup' ? 'Create your TrailTasks account' : 'Welcome back to TrailTasks'),
    [mode],
  )

  const resetMessages = () => setError('')
  const usernamePattern = /^[a-zA-Z0-9._-]+$/
  const normalizeUsername = (value) => value.trim().toLowerCase()
  const getUsernameEmail = (value) => `${normalizeUsername(value)}@trailtasks.local`

  const handleSignup = async (event) => {
    event.preventDefault()
    resetMessages()
    const cleanedUsername = username.trim()
    if (!cleanedUsername) {
      setError('Please enter a username to personalize your trail list.')
      return
    }
    if (!usernamePattern.test(cleanedUsername)) {
      setError('Username can use letters, numbers, ".", "_" or "-" only.')
      return
    }

    setLoading(true)
    try {
      const usernameEmail = getUsernameEmail(cleanedUsername)
      const credential = await createUserWithEmailAndPassword(auth, usernameEmail, password)
      await updateProfile(credential.user, { displayName: cleanedUsername })
      await setDoc(
        doc(db, 'users', credential.user.uid),
        {
          username: cleanedUsername,
          usernameLower: normalizeUsername(cleanedUsername),
          email: email.trim(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      )
    } catch (signUpError) {
      setError(getAuthErrorMessage(signUpError))
    } finally {
      setLoading(false)
    }
  }

  const handleSignin = async (event) => {
    event.preventDefault()
    resetMessages()
    const cleanedUsername = username.trim()
    if (!cleanedUsername) {
      setError('Please enter your username.')
      return
    }
    if (!usernamePattern.test(cleanedUsername)) {
      setError('Username can use letters, numbers, ".", "_" or "-" only.')
      return
    }
    setLoading(true)
    try {
      const usernameEmail = getUsernameEmail(cleanedUsername)
      await signInWithEmailAndPassword(auth, usernameEmail, password)
    } catch (signInError) {
      setError(getAuthErrorMessage(signInError))
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    resetMessages()
    setLoading(true)
    try {
      await signOut(auth)
    } catch (logoutError) {
      setError(getAuthErrorMessage(logoutError))
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <div className="auth-bar">
        <div>
          <p className="auth-greeting">Logged in as</p>
          <strong>{user.displayName || user.email}</strong>
        </div>
        <button className="secondary-button" onClick={handleLogout} disabled={loading}>
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1>TrailTasks</h1>
        <p>{formTitle}</p>
      </div>
      <form className="auth-form" onSubmit={mode === 'signup' ? handleSignup : handleSignin}>
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value)
              resetMessages()
            }}
            placeholder="Trail name"
            autoComplete="username"
            required
          />
        </label>
        {mode === 'signup' && (
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                resetMessages()
              }}
              placeholder="you@mountainmail.com"
              autoComplete="email"
              required
            />
          </label>
        )}
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              resetMessages()
            }}
            placeholder="Minimum 6 characters"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
          />
        </label>
        {error && <div className="auth-error">{error}</div>}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>
      <div className="auth-toggle">
        {mode === 'signup' ? 'Already have an account?' : 'New to TrailTasks?'}
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setMode(mode === 'signup' ? 'signin' : 'signup')
            resetMessages()
          }}
        >
          {mode === 'signup' ? 'Sign in' : 'Create one'}
        </button>
      </div>
    </div>
  )
}
