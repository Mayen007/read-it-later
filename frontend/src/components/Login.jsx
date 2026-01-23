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
    <div className="h-screen flex overflow-hidden">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-linear-to-br from-white via-blue-50/30 to-indigo-50/20 overflow-y-auto relative">
        {/* Decorative shapes/doodles - App themed */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          {/* Folder shape - blue (top left) */}
          <svg className="absolute top-10 left-8 w-20 h-16" viewBox="0 0 80 64">
            <path
              d="M0 8 L0 56 Q0 60 4 60 L76 60 Q80 60 80 56 L80 16 Q80 12 76 12 L32 12 L28 8 Q26 4 22 4 L4 4 Q0 4 0 8 Z"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="2"
            />
          </svg>

          {/* Article card outline (top right) */}
          <div className="absolute top-20 right-20 w-24 h-32 border-2 border-indigo-200 rounded-lg">
            <div className="w-full h-8 bg-indigo-100 rounded-t-lg"></div>
            <div className="p-2 space-y-1">
              <div className="w-full h-2 bg-indigo-100 rounded"></div>
              <div className="w-3/4 h-2 bg-indigo-100 rounded"></div>
            </div>
          </div>

          {/* Bookmark ribbon (middle left) */}
          <svg
            className="absolute top-1/3 left-12 w-8 h-12"
            viewBox="0 0 32 48"
          >
            <path
              d="M4 0 L28 0 L28 48 L16 40 L4 48 Z"
              fill="#a78bfa"
              opacity="0.6"
            />
          </svg>

          {/* Category dot cluster (bottom right) */}
          <div className="absolute bottom-24 right-16">
            <div className="w-3 h-3 bg-blue-500 rounded-full absolute top-0 left-0"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 left-5"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full absolute top-0 left-10"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full absolute top-5 left-2.5"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full absolute top-5 left-7.5"></div>
          </div>

          {/* Browser tab shape (top middle) */}
          <svg
            className="absolute top-8 left-1/2 w-24 h-10"
            viewBox="0 0 96 40"
          >
            <path
              d="M4 40 L4 8 Q4 4 8 4 L88 4 Q92 4 92 8 L92 40"
              fill="none"
              stroke="#e0e7ff"
              strokeWidth="2"
            />
            <circle cx="12" cy="20" r="3" fill="#c7d2fe" />
          </svg>

          {/* Folder shape - green (bottom left) */}
          <svg
            className="absolute bottom-16 left-16 w-16 h-12"
            viewBox="0 0 64 48"
          >
            <path
              d="M0 6 L0 44 Q0 48 4 48 L60 48 Q64 48 64 44 L64 12 Q64 8 60 8 L26 8 L22 6 Q20 4 18 4 L4 4 Q0 4 0 6 Z"
              fill="none"
              stroke="#86efac"
              strokeWidth="2"
            />
          </svg>

          {/* Small article card (middle right) */}
          <div className="absolute top-1/2 right-8 w-16 h-20 border-2 border-purple-200 rounded-lg bg-white/50"></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
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
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="/login-img.png"
          alt="Welcome back to your organized reading collection"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
