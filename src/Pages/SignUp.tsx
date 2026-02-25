import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signUp } from '../features/authSlice'
import type { AppDispatch, RootState } from '../store'
import { PATH } from '../constants.ts'
import InputComponent from '../components/CustomInput'
import CustomButton from '../components/CustomButton'

export default function SignUp() {
  const dispatch = useDispatch<AppDispatch>()
  const { status, error } = useSelector((state: RootState) => state.auth)
  const [repeatPassword, setRepeatPassword] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const [success, setSuccess] = useState(false)

  const loading = status === 'loading'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      return
    }
    if (!password) {
      return
    }
    if (password !== repeatPassword) {
      setPasswordMismatch(true)
      return
    }

    setPasswordMismatch(false)
    const result = await dispatch(signUp({ email, password }))

    if (signUp.fulfilled.match(result)) {
      setSuccess(true)
      setEmail('')
      setPassword('')
      setRepeatPassword('')
    }
  }

  return (
    <div className="min-h-svh bg-slate-50">
      <div className="mx-auto flex min-h-svh max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-slate-900">
              {success ? 'Thank you for signing up!' : 'Sign up'}
            </h1>
            <p className="mt-2 text-pretty text-sm text-slate-600">
              {success ? 'Check your email to confirm' : 'Create a new account'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {success ? (
              <p className="text-sm text-slate-600">
                You&apos;ve successfully signed up. Please check your email to confirm your
                account before signing in.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <InputComponent lightOnly
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <InputComponent lightOnly
                  id="password"
                  label="Password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <InputComponent lightOnly
                  id="repeat-password"
                  label="Repeat Password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  error={passwordMismatch ? "Passwords do not match" : undefined}
                />


                {/* Error - From Redux */}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <CustomButton
                  type="submit"
                  loading={loading}
                  fullWidth
                >
                  {loading ? 'Creating an account...' : 'Sign up'}
                </CustomButton>

                {/* Footer */}
                <p className="text-center text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link to={PATH.LOGIN} className="font-medium text-[#6B2FF9] hover:text-[#5A26D6]">
                    Login
                  </Link>
                </p>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            By signing up, you agree to our terms and privacy policy.
          </p>
        </div>
      </div>
    </div>
  )
}
