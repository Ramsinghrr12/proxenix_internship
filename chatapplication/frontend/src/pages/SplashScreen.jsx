import React from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-purple-600 to-pink-500 relative overflow-hidden px-2 sm:px-0 py-4">
      {/* Animated 3D shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute animate-bounce-slow left-1/4 top-10 w-40 h-40 bg-white bg-opacity-10 rounded-full shadow-2xl blur-2xl" style={{ filter: 'blur(30px)' }} />
        <div className="absolute animate-spin-slow right-1/4 bottom-10 w-56 h-56 bg-white bg-opacity-10 rounded-full shadow-2xl blur-2xl" style={{ filter: 'blur(40px)' }} />
        <div className="absolute animate-pulse left-1/2 top-1/2 w-24 h-24 bg-white bg-opacity-20 rounded-full shadow-2xl blur-2xl" style={{ filter: 'blur(20px)', transform: 'translate(-50%, -50%)' }} />
      </div>
      <div className="relative z-10 w-full max-w-md mx-auto bg-white bg-opacity-90 rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center backdrop-blur-md">
        <div className="mb-6">
          {/* App Logo (3D effect) */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-blue-500 to-pink-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white transform hover:scale-105 transition-transform duration-300">
            <span className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg" style={{ textShadow: '2px 2px 8px #0002' }}>💬</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 mb-4 drop-shadow-lg text-center">ChatSphere</h1>
        <p className="text-gray-700 text-center mb-8 font-medium text-base sm:text-lg">Connect. Chat. Enjoy real-time conversations with a modern, secure, and beautiful chat app.</p>
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-500 text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            Sign Up
          </button>
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
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-40px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen; 