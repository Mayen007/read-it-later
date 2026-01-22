import {
  BookOpen,
  Chrome,
  Search,
  FolderOpen,
  CheckCircle,
} from "lucide-react";

export default function Landing({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen size={56} className="text-blue-500" />
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Read It Later
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            A simple, visual way to organize articles you want to read.
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Completely free, with color-coded organization that actually makes
            sense.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-xl hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Chrome className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Save from Anywhere
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Use our Chrome extension to save articles with a single click
              while browsing.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <FolderOpen className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Visual Organization
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Color-coded categories make it easy to organize and find your
              articles at a glance.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Search className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Find Instantly
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Search through your saved articles and filter by category or read
              status.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="text-purple-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Track Your Progress
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Mark articles as read and keep track of what you've finished.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {/* Step 1 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Create Your Account
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Sign up in seconds to start saving articles for later.
              </p>
            </div>
            {/* Connector line - hidden on mobile */}
            <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-linear-to-r from-blue-300 to-transparent"></div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-linear-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Save Articles
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Paste any article URL or use our Chrome extension to save
                directly from your browser.
              </p>
            </div>
            {/* Connector line - hidden on mobile */}
            <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-linear-to-r from-indigo-300 to-transparent"></div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 shadow-lg">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Read at Your Pace
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Access your articles anytime, anywhere. No distractions, just
              content.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Simple Organization. Powerful Features. Completely Free.
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          No paywalls, no ads, no complexity. Just a better way to save what you
          want to read.
        </p>
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-xl hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Get Started Free
        </button>
      </div>
    </div>
  );
}
