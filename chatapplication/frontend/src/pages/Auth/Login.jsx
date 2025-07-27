import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://chatapplication-zfio.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
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
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white bg-opacity-20 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-10 flex flex-col items-center border border-white border-opacity-30 hover:scale-105 transition-transform duration-300 group">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 drop-shadow-lg motion-safe:animate-fade-in">Login</h2>
          {error && <div className="mb-4 text-red-500 text-center animate-shake text-sm sm:text-base">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-7 w-full">
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                {/* Email Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 4h16v16H4z" opacity="0.2"/><path stroke="currentColor" strokeWidth="2" d="M4 4l8 8 8-8"/></svg>
              </span>
              <input
                type="email"
                id="login-email"
                className="peer w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg bg-white bg-opacity-60 focus:bg-opacity-90 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all duration-300 placeholder-transparent shadow-inner focus:shadow-blue-200/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
              />
              <label htmlFor="login-email" className="absolute left-12 top-3 text-gray-500 text-base transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue-600 bg-white bg-opacity-80 px-1 rounded">
                Email
              </label>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500">
                {/* Password Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/><path stroke="currentColor" strokeWidth="2" d="M8 12a4 4 0 1 1 8 0v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2z"/></svg>
              </span>
              <input
                type="password"
                id="login-password"
                className="peer w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg bg-white bg-opacity-60 focus:bg-opacity-90 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none transition-all duration-300 placeholder-transparent shadow-inner focus:shadow-purple-200/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
              />
              <label htmlFor="login-password" className="absolute left-12 top-3 text-gray-500 text-base transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-5 peer-focus:text-sm peer-focus:text-purple-600 bg-white bg-opacity-80 px-1 rounded">
                Password
              </label>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-500 text-white font-bold text-lg shadow-xl transform hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 motion-safe:animate-pop border-b-4 border-blue-400 group-hover:border-pink-400"
            >
              Login
            </button>
          </form>
          <p className="mt-6 text-center text-xs sm:text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline font-semibold">Sign up</Link>
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

export default Login; 
