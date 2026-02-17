import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signIn } from '../features/authSlice'
import type { AppDispatch, RootState } from '../store'
import { PATH } from '../constants'

export default function Login() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { status, error } = useSelector((state: RootState) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loading = status === 'loading'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return
    if (!password) return

    const result = await dispatch(signIn({ email, password }))

    if (signIn.fulfilled.match(result)) {
      setEmail('')
      setPassword('')
      navigate(PATH.HOME)
    }
  }

  return (
    <div className="min-h-svh bg-slate-50">
      <div className="mx-auto flex min-h-svh max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-slate-900">
              Sign in
            </h1>
            <p className="mt-2 text-pretty text-sm text-slate-600">
              Enter your email below to login to your account.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-900">
                  Email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-[#6B2FF9] focus:ring-4 focus:ring-[#6B2FF9]/10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-900">
                    Password
                  </label>
                  
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-[#6B2FF9] focus:ring-4 focus:ring-[#6B2FF9]/10"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#7F23FE] via-[#6B2FF9] to-[#5438F7] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-[#6B2FF9]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                )}
                {loading ? 'Logging in...' : 'Sign in'}
              </button>

              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link to={PATH.SIGNUP} className="font-medium text-[#6B2FF9] hover:text-[#5A26D6]">
                  Sign up
                </Link>
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">By signing in, you agree to our terms and privacy policy.</p>
        </div>
      </div>
    </div>
  )
}
