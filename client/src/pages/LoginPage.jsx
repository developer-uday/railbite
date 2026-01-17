import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('📝 Login form submitted with email:', email);

    try {
      console.log('🔵 Login initiated');
      const user = await login(email, password);
      console.log('🟢 Login successful, user:', user);
      
      if (user.role === 'admin') {
        console.log('➡️ Redirecting to admin');
        navigate('/admin');
      } else if (user.role === 'vendor') {
        console.log('➡️ Redirecting to vendor');
        navigate('/vendor');
      } else {
        console.log('➡️ Redirecting to user');
        navigate('/user');
      }
    } catch (err) {
      console.error('🔴 Login error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">🚂 RAILBITE</h1>
        <p className="text-center text-gray-600 mb-8">Food Delivery in Trains</p>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-accent bg-opacity-10 border border-accent text-accent rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-secondary hover:text-yellow-600 font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
