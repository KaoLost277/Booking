import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signIn } from "../features/authSlice";
import type { AppDispatch, RootState } from "../store";
import { PATH } from "../constants";
import InputComponent from "../components/CustomInput";
import CustomButton from "../components/CustomButton";

export default function Login() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { status, error } = useSelector((state: RootState) => state.auth);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const loading = status === "loading";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) return;
        if (!password) return;

        const result = await dispatch(signIn({ email, password, rememberMe }));

        if (signIn.fulfilled.match(result)) {
            setEmail("");
            setPassword("");
            navigate(PATH.HOME);
        }
    };

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
                            <InputComponent lightOnly
                                id="email"
                                label="Email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="m@example.com"
                            />

                            <InputComponent lightOnly
                                id="password"
                                label="Password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {/* Remember Me checkbox */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-[#6B2FF9] focus:ring-[#6B2FF9] cursor-pointer accent-[#6B2FF9]"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="select-none text-sm text-slate-600 cursor-pointer"
                                >
                                    Remember me
                                </label>
                            </div>

                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                                    <p className="text-sm text-red-700">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <CustomButton
                                type="submit"
                                loading={loading}
                                fullWidth
                            >
                                {loading ? "Logging in..." : "Sign in"}
                            </CustomButton>

                            <p className="text-center text-sm text-slate-600">
                                Don&apos;t have an account?{" "}
                                <Link
                                    to={PATH.SIGNUP}
                                    className="font-medium text-[#6B2FF9] hover:text-[#5A26D6]"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-500">
                        By signing in, you agree to our terms and privacy
                        policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
