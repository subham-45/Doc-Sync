import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-700 mb-6 leading-tight">
          Welcome to <span className="text-blue-900">Doc-Sync</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Seamless document collaboration made easy. Sync, edit, and share your
          documents in real time — with powerful rich text tools and secure role-based access.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center sm:items-stretch">
          <Link
            to="/login"
            className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded-full border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-100 transition"
          >
            Get Started
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 text-left">
          <div className="p-5 sm:p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">
              Real-time Collaboration
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Collaborate with your team instantly — see changes in real time as they happen.
            </p>
          </div>
          <div className="p-5 sm:p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">
              Rich Text & Media Editor
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Create beautifully formatted documents with support for images, videos, and more.
            </p>
          </div>
          <div className="p-5 sm:p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">
              Role-Based Document Sharing
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Share documents securely and control access with role-based permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
