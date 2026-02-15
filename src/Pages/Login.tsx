import { Link, redirect, useFetcher, type ActionFunctionArgs } from 'react-router'

import { createClient } from '../lib/client'

export const action = async ({ request }: ActionFunctionArgs) => {
  //const { supabase, headers } = createClient(request)

  const formData = await request.formData()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }

  return redirect('/protected', { headers })
}

export default function Login() {
  const fetcher = useFetcher<typeof action>()

  const error = fetcher.data?.error
  const loading = fetcher.state === 'submitting'

  return (
    <div className="min-h-svh bg-slate-50">
      <div className="mx-auto flex min-h-svh max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-slate-900">
              Sign in
            </h1>
            <p className="mt-2 text-pretty text-sm text-slate-600">
              Enter your email below to login to your account.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <fetcher.Form method="post" className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-900"
                >
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
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-[#6B2FF9] hover:text-[#5A26D6]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    type="password"
                    name="password"
                    required
                    autoComplete="current-password"
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
                {loading ? 'Logging in...' : 'Sign in'}
              </button>

              {/* Footer */}
              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link
                  to="/SignUp"
                  className="font-medium text-[#6B2FF9] hover:text-[#5A26D6]"
                >
                  Sign up
                </Link>
              </p>
            </fetcher.Form>
          </div>

          {/* Bottom note */}
          <p className="mt-6 text-center text-xs text-slate-500">
            By signing in, you agree to our terms and privacy policy.
          </p>
        </div>
      </div>
    </div>
  )
}
