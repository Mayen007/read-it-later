import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { BookOpen, Chrome, FolderOpen } from "lucide-react";

export default function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

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
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Access your saved articles
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
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
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
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                Don't have an account? Register
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 items-center justify-center p-12">
        <div className="max-w-md text-center space-y-8">
          <h2 className="text-4xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Your saved articles are waiting for you.
          </p>

          <div className="space-y-6 pt-8">
            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <Chrome className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Save from Anywhere
                </h3>
                <p className="text-sm text-gray-600">
                  One click to save articles while browsing
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <FolderOpen className="text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Visual Organization
                </h3>
                <p className="text-sm text-gray-600">
                  Color-coded categories for easy sorting
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
