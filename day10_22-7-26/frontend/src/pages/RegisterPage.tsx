import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.register({ name, email, password });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Account</h2>
          <p className="text-gray-400">Join us to start managing your players.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 mb-6 text-sm text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 rounded-lg p-3 mb-6 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="John Doe"
              disabled={loading || !!success}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
              disabled={loading || !!success}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              disabled={loading || !!success}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
