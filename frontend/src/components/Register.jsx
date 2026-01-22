import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { BookOpen, Lock, Zap } from "lucide-react";

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password requirement checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(pwd))
      return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd))
      return "Password must contain at least one special character";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    const result = await register(email, password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex items-center justify-center mb-6">
              <BookOpen size={48} className="text-blue-500" />
            </div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Start saving articles to read later
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-2">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="text-xs space-y-1">
              <p className="text-gray-600">Password requirements:</p>
              <ul className="space-y-1">
                <li
                  className={`flex items-center gap-2 ${
                    !password
                      ? "text-gray-400"
                      : passwordChecks.length
                        ? "text-green-600"
                        : "text-red-500"
                  }`}
                >
                  <span>
                    {!password ? "○" : passwordChecks.length ? "✓" : "✗"}
                  </span>
                  <span>At least 8 characters</span>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    !password
                      ? "text-gray-400"
                      : passwordChecks.uppercase
                        ? "text-green-600"
                        : "text-red-500"
                  }`}
                >
                  <span>
                    {!password ? "○" : passwordChecks.uppercase ? "✓" : "✗"}
                  </span>
                  <span>One uppercase letter</span>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    !password
                      ? "text-gray-400"
                      : passwordChecks.number
                        ? "text-green-600"
                        : "text-red-500"
                  }`}
                >
                  <span>
                    {!password ? "○" : passwordChecks.number ? "✓" : "✗"}
                  </span>
                  <span>One number</span>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    !password
                      ? "text-gray-400"
                      : passwordChecks.special
                        ? "text-green-600"
                        : "text-red-500"
                  }`}
                >
                  <span>
                    {!password ? "○" : passwordChecks.special ? "✓" : "✗"}
                  </span>
                  <span>One special character</span>
                </li>
              </ul>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 items-center justify-center p-12">
        <div className="max-w-md text-center space-y-8">
          <h2 className="text-4xl font-bold text-gray-900">
            Start Organizing Today
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Join readers who are taking control of their content.
          </p>

          <div className="space-y-6 pt-8">
            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <Lock className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Completely Free
                </h3>
                <p className="text-sm text-gray-600">
                  No paywalls, no premium tiers, no limits
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="text-yellow-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Get Started in Seconds
                </h3>
                <p className="text-sm text-gray-600">
                  No complex setup, just start saving
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
