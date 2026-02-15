import {
  Link,
  redirect,
  useFetcher,
  useSearchParams,
  type ActionFunctionArgs,
} from 'react-router'

import { createClient } from '../lib/client'

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = createClient(request)

  const url = new URL(request.url)
  const origin = url.origin

  const formData = await request.formData()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const repeatPassword = formData.get('repeat-password') as string

  if (!password) return { error: 'Password is required' }
  if (password !== repeatPassword) return { error: 'Passwords do not match' }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/protected` },
  })

  if (error) return { error: error.message }

  return redirect('/')
}

export default function SignUp() {
  const fetcher = useFetcher<typeof action>()
  const [searchParams] = useSearchParams()

  const success = searchParams.has('success')
  const error = fetcher.data?.error
  const loading = fetcher.state === 'submitting'

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
              <fetcher.Form method="post" className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-900">
                    Email
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      autoComplete="email"
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-[#6B2FF9] focus:ring-4 focus:ring-[#6B2FF9]/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoComplete="new-password"
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-[#6B2FF9] focus:ring-4 focus:ring-[#6B2FF9]/10"
                    />
                  </div>
                </div>

                {/* Repeat Password */}
                <div>
                  <label
                    htmlFor="repeat-password"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Repeat Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="repeat-password"
                      name="repeat-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-[#6B2FF9] focus:ring-4 focus:ring-[#6B2FF9]/10"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#7F23FE] via-[#6B2FF9] to-[#5438F7] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-[#6B2FF9]/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      aria-hidden="true"
                    />
                  )}
                  {loading ? 'Creating an account...' : 'Sign up'}
                </button>

                {/* Footer */}
                <p className="text-center text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-[#6B2FF9] hover:text-[#5A26D6]"
                  >
                    Login
                  </Link>
                </p>
              </fetcher.Form>
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
