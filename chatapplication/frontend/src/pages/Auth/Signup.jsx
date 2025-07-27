import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({
    fullName: '',
    number: '',
    email: '',
    password: '',
    profilePic: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    try {
      const res = await fetch('https://chatapplication-zfio.onrender.com/api/auth/signup', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      setSuccess('Signup successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-purple-600 to-pink-500 relative overflow-hidden px-2 sm:px-0 py-4">
      {/* Animated background shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute animate-bounce-slow left-1/4 top-10 w-40 h-40 bg-white bg-opacity-10 rounded-full shadow-2xl blur-2xl" style={{ filter: 'blur(30px)' }} />
        <div className="absolute animate-spin-slow right-1/4 bottom-10 w-56 h-56 bg-white bg-opacity-10 rounded-full shadow-2xl blur-2xl" style={{ filter: 'blur(40px)' }} />
      </div>
      <div className="relative z-10 w-full max-w-xs sm:max-w-md">
        <div className="bg-white bg-opacity-20 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center border border-white border-opacity-30 hover:scale-105 transition-transform duration-300 group">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 drop-shadow-lg motion-safe:animate-fade-in">Sign Up</h2>
          {error && <div className="mb-4 text-red-500 text-center animate-shake text-sm sm:text-base">{error}</div>}
          {success && <div className="mb-4 text-green-600 text-center animate-pop text-sm sm:text-base">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-7 w-full" encType="multipart/form-data">
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                {/* User Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" d="M4 20c0-4 4-7 8-7s8 3 8 7" opacity="0.2"/></svg>
              </span>
              <input
                type="text"
                name="fullName"
                id="signup-fullName"
                className="peer w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg bg-white bg-opacity-60 focus:bg-opacity-90 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all duration-300 placeholder-transparent shadow-inner focus:shadow-blue-200/50"
                value={form.fullName}
                onChange={handleChange}
                required
                placeholder="Full Name"
              />
              <label htmlFor="signup-fullName" className="absolute left-12 top-3 text-gray-500 text-base transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue-600 bg-white bg-opacity-80 px-1 rounded">
                Full Name
              </label>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500">
                {/* Phone Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="4" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>
              </span>
              <input
                type="text"
                name="number"
                id="signup-number"
                className="peer w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg bg-white bg-opacity-60 focus:bg-opacity-90 focus:border-pink-500 focus:ring-2 focus:ring-pink-300 outline-none transition-all duration-300 placeholder-transparent shadow-inner focus:shadow-pink-200/50"
                value={form.number}
                onChange={handleChange}
                required
                placeholder="Number"
              />
              <label htmlFor="signup-number" className="absolute left-12 top-3 text-gray-500 text-base transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-5 peer-focus:text-sm peer-focus:text-pink-600 bg-white bg-opacity-80 px-1 rounded">
                Number
              </label>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500">
                {/* Email Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 4h16v16H4z" opacity="0.2"/><path stroke="currentColor" strokeWidth="2" d="M4 4l8 8 8-8"/></svg>
              </span>
              <input
                type="email"
                name="email"
                id="signup-email"
                className="peer w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg bg-white bg-opacity-60 focus:bg-opacity-90 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none transition-all duration-300 placeholder-transparent shadow-inner focus:shadow-purple-200/50"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email"
              />
              <label htmlFor="signup-email" className="absolute left-12 top-3 text-gray-500 text-base transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-5 peer-focus:text-sm peer-focus:text-purple-600 bg-white bg-opacity-80 px-1 rounded">
                Email
              </label>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                {/* Password Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/><path stroke="currentColor" strokeWidth="2" d="M8 12a4 4 0 1 1 8 0v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2z"/></svg>
              </span>
              <input
                type="password"
                name="password"
                id="signup-password"
                className="peer w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg bg-white bg-opacity-60 focus:bg-opacity-90 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all duration-300 placeholder-transparent shadow-inner focus:shadow-blue-200/50"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Password"
              />
              <label htmlFor="signup-password" className="absolute left-12 top-3 text-gray-500 text-base transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue-600 bg-white bg-opacity-80 px-1 rounded">
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500">
                {/* Profile Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/><path stroke="currentColor" strokeWidth="2" d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </span>
              <input
                type="file"
                name="profilePic"
                id="signup-profilePic"
                accept="image/*"
                className="w-full pl-12 file:rounded file:bg-gradient-to-r file:from-pink-500 file:to-purple-500 file:text-white file:font-bold file:px-4 file:py-2 file:border-none file:shadow-lg file:hover:scale-105 file:transition-transform file:duration-200"
                onChange={handleChange}
              />
              <label htmlFor="signup-profilePic" className="absolute left-12 -top-6 text-sm text-pink-600 bg-white bg-opacity-80 px-1 rounded pointer-events-none">Profile Picture</label>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow-xl transform hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 motion-safe:animate-pop border-b-4 border-pink-400 group-hover:border-blue-400"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-6 text-center text-xs sm:text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">Login</Link>
          </p>
        </div>
      </div>
      {/* Custom Animations */}
      <style>{`
        .animate-bounce-slow {
          animation: bounce 4s infinite alternate;
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .animate-pop {
          animation: pop 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-40px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          0% { transform: scale(0.8); }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};

export default Signup; 
