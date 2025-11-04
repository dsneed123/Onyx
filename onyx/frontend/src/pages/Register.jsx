import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-onyx-darker via-onyx-dark to-onyx-gray flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-onyx-purple/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-onyx-cyan/10 rounded-full filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-block p-4 mb-4 bg-gradient-to-br from-onyx-purple to-onyx-cyan rounded-3xl shadow-glow animate-bounce-subtle">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-6xl font-black mb-2 gradient-text">ONYX</h1>
          <p className="text-gray-400 text-lg">Join the experience</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl animate-slide-down backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3.5 border border-onyx-light bg-onyx-dark/50 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-onyx-purple focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Choose a username"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3.5 border border-onyx-light bg-onyx-dark/50 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-onyx-purple focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300">
                  Display Name <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3.5 border border-onyx-light bg-onyx-dark/50 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-onyx-purple focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="How should we call you?"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3.5 border border-onyx-light bg-onyx-dark/50 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-onyx-purple focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-onyx-purple to-onyx-cyan hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-onyx-purple disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-glow"
            >
              {loading ? (
                <>
                  <svg className="spinner w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-400">Already have an account? </span>
              <Link to="/login" className="text-onyx-purple hover:text-purple-400 font-semibold transition-colors">
                Sign in
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm">
          By continuing, you agree to Onyx's Terms & Privacy
        </p>
      </div>
    </div>
  );
}
