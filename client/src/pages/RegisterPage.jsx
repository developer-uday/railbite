import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    restaurantName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '', // store only 10 digits
    station: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For phone, keep only digits and max 10
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: digits }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('📝 Form submission started');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Phone validation: require exactly 10 digits
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        // For vendors, use restaurant name as the account name
        name: formData.role === 'vendor' ? formData.restaurantName : formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        // send phone with +91 prefix
        phone: `+91${formData.phone}`,
      };

      // include station only for vendors
      if (formData.role === 'vendor') {
        userData.station = formData.station;
      }

      console.log('📤 Sending registration data:', userData);
      const user = await register(userData);
      console.log('✅ Registration successful, user:', user);
      
      if (user.role === 'vendor') {
        navigate('/vendor');
      } else {
        navigate('/user');
      }
    } catch (err) {
      console.error('❌ Registration failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">🚂 RAILBITE</h1>
        <p className="text-center text-gray-600 mb-8">Food Delivery in Trains</p>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Create Account</h2>

        {error && (
          <div className="mb-4 p-3 bg-accent bg-opacity-10 border border-accent text-accent rounded-lg text-sm">
            {error}
          </div>
        )}

        {!selectedRole ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Select your role to continue</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => handleRoleSelect('user')} className="flex-1 py-2 rounded-lg border hover:bg-gray-50">Customer</button>
              <button type="button" onClick={() => handleRoleSelect('vendor')} className="flex-1 py-2 rounded-lg border hover:bg-gray-50">Restaurant Vendor</button>
            </div>
            <p className="text-sm text-gray-500">Already have an account? <Link to="/login" className="text-secondary font-semibold">Login</Link></p>
            <div className="text-xs text-gray-400">You chose: <span className="font-medium">{selectedRole || 'none'}</span></div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {formData.role === 'vendor' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                placeholder="Pizza Palace"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-50">+91</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10 digit mobile number"
                className="w-full px-4 py-2 border border-gray-300 rounded-r focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
                required
              />
            </div>
          </div>

          {formData.role === 'vendor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
              <input
                type="text"
                name="station"
                value={formData.station}
                onChange={handleChange}
                placeholder="Vendor station name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input type="text" readOnly value={formData.role} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full  bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        )}

        <p className="text-center text-gray-600 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary hover:text-yellow-500 font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
