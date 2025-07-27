import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const menuItems = [
  { key: 'profile', label: 'Profile', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" opacity="0.2"/></svg>
  ) },
  { key: 'chat', label: 'Chat', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ) },
  { key: 'sent', label: 'Request Sent', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
  ) },
  { key: 'received', label: 'Request Received', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 16l-4-4m0 0l4-4m-4 4h18"/></svg>
  ) },
];

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const [active, setActive] = useState('profile');
  const [activeChatId, setActiveChatId] = useState(null);

  // State for Request Sent section
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingSent, setLoadingSent] = useState(false);

  // State for Request Received section
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loadingReceived, setLoadingReceived] = useState(false);

  // State for Available Users to send requests
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  useEffect(() => {
    if (active === 'sent') {
      setLoadingSent(true);
      fetch('https://chatapplication-zfio.onrender.com/api/auth/sent-requests', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setSentRequests(data))
        .catch(() => setSentRequests([]))
        .finally(() => setLoadingSent(false));
      setLoadingAvailable(true);
      fetch('https://chatapplication-zfio.onrender.com/api/auth/available-users', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setAvailableUsers(data))
        .catch(() => setAvailableUsers([]))
        .finally(() => setLoadingAvailable(false));
    }
    if (active === 'received') {
      setLoadingReceived(true);
      fetch('https://chatapplication-zfio.onrender.com/api/auth/received-requests', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setReceivedRequests(data))
        .catch(() => setReceivedRequests([]))
        .finally(() => setLoadingReceived(false));
    }
  }, [active, token]);

  const handleSendRequest = async (targetUserId) => {
    await fetch('https://chatapplication-zfio.onrender.com/api/auth/send-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId }),
    });
    setAvailableUsers(users => users.filter(u => u._id !== targetUserId));
    // Optionally refetch sent requests
    setSentRequests(reqs => [...reqs]);
  };

  const handleAccept = async (requestId) => {
    await fetch('https://chatapplication-zfio.onrender.com/api/auth/accept-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId }),
    });
    setReceivedRequests(reqs => reqs.map(r => r._id === requestId ? { ...r, status: 'Accepted' } : r));
  };

  const handleDecline = async (requestId) => {
    await fetch('https://chatapplication-zfio.onrender.com/api/auth/decline-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId }),
    });
    setReceivedRequests(reqs => reqs.map(r => r._id === requestId ? { ...r, status: 'Declined' } : r));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const renderSection = () => {
    switch (active) {
      case 'profile':
        return (
          <div className="p-4 animate-fade-in flex justify-center">
            <div className="flex flex-col items-center bg-white bg-opacity-90 rounded-2xl shadow-xl p-8 max-w-xs w-full border border-pink-100">
              {user?.profilePic ? (
                <img src={`https://chatapplication-zfio.onrender.com/${user.profilePic}`} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-pink-200 shadow mb-4" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center text-3xl text-pink-400 border-4 border-pink-200 shadow mb-4">
                  <span>{user?.fullName?.[0] || '?'}</span>
                </div>
              )}
              <div className="w-full text-center">
                <div className="mb-3">
                  <span className="block text-pink-400 text-xs font-semibold uppercase tracking-wider">Full Name</span>
                  <span className="block text-xl font-bold text-yellow-700">{user?.fullName}</span>
                </div>
                <div className="mb-3">
                  <span className="block text-pink-400 text-xs font-semibold uppercase tracking-wider">Email</span>
                  <span className="block text-base font-medium text-yellow-700">{user?.email}</span>
                </div>
                <div>
                  <span className="block text-pink-400 text-xs font-semibold uppercase tracking-wider">Number</span>
                  <span className="block text-base font-medium text-yellow-700">{user?.number}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'chat':
        return (
          <div className="p-4 animate-fade-in flex gap-4 h-[70vh]">
            <div className="w-1/3 min-w-[220px] max-w-xs">
              <ChatList token={token} onSelectChat={setActiveChatId} activeChatId={activeChatId} />
            </div>
            <div className="flex-1">
              <ChatWindow token={token} chatId={activeChatId} user={user} />
            </div>
          </div>
        );
      case 'sent':
        return (
          <div className="p-4 animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-pink-700">Requests Sent</h2>
            {loadingSent ? (
              <div className="text-center text-pink-500">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {sentRequests.length === 0 ? (
                  <div className="col-span-full text-gray-400">No requests sent yet.</div>
                ) : (
                  sentRequests.map(r => (
                    <div key={r._id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-pink-100">
                      {r.user?.profilePic ? (
                        <img src={`https://chatapplication-zfio.onrender.com/${r.user.profilePic}`} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-pink-200 shadow mb-2" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-xl text-pink-400 border-2 border-pink-200 shadow mb-2">
                          <span>{r.user?.fullName?.[0] || '?'}</span>
                        </div>
                      )}
                      <div className="text-center mb-2">
                        <div className="font-bold text-pink-700">{r.user?.fullName}</div>
                      </div>
                      <span className={`px-4 py-1 rounded font-semibold text-xs ${r.status === 'Accepted' ? 'bg-green-200 text-green-700' : r.status === 'Declined' ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{r.status}</span>
                    </div>
                  ))
                )}
              </div>
            )}
            <h3 className="text-lg font-semibold text-pink-600 mb-2">Available Users</h3>
            {loadingAvailable ? (
              <div className="text-center text-pink-500">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {availableUsers.length === 0 ? (
                  <div className="col-span-full text-gray-400">No users available to send requests.</div>
                ) : (
                  availableUsers.map(u => (
                    <div key={u._id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-pink-100">
                      {u.profilePic ? (
                        <img src={`https://chatapplication-zfio.onrender.com/${u.profilePic}`} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-pink-200 shadow mb-2" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-xl text-pink-400 border-2 border-pink-200 shadow mb-2">
                          <span>{u.fullName?.[0] || '?'}</span>
                        </div>
                      )}
                      <div className="text-center mb-2">
                        <div className="font-bold text-pink-700">{u.fullName}</div>
                      </div>
                      <button className="px-4 py-1 rounded bg-pink-500 text-white font-semibold hover:bg-pink-600 transition" onClick={() => handleSendRequest(u._id)}>Send Request</button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      case 'received':
        return (
          <div className="p-4 animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-pink-700">Requests Received</h2>
            {loadingReceived ? (
              <div className="text-center text-pink-500">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {receivedRequests.length === 0 ? (
                  <div className="col-span-full text-gray-400">No requests received.</div>
                ) : (
                  receivedRequests.map(r => (
                    <div key={r._id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-pink-100">
                      {r.user?.profilePic ? (
                        <img src={`https://chatapplication-zfio.onrender.com/${r.user.profilePic}`} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-pink-200 shadow mb-2" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-xl text-pink-400 border-2 border-pink-200 shadow mb-2">
                          <span>{r.user?.fullName?.[0] || '?'}</span>
                        </div>
                      )}
                      <div className="text-center mb-2">
                        <div className="font-bold text-pink-700">{r.user?.fullName}</div>
                      </div>
                      {r.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button className="px-4 py-1 rounded bg-green-500 text-white font-semibold hover:bg-green-600 transition" onClick={() => handleAccept(r._id)}>Accept</button>
                          <button className="px-4 py-1 rounded bg-yellow-400 text-white font-semibold hover:bg-yellow-500 transition" onClick={() => handleDecline(r._id)}>Decline</button>
                        </div>
                      ) : (
                        <span className={`px-4 py-1 rounded font-semibold text-xs ${r.status === 'Accepted' ? 'bg-green-200 text-green-700' : 'bg-yellow-200 text-yellow-700'}`}>{r.status}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-purple-600 to-pink-500 flex flex-col sm:flex-row items-stretch w-full overflow-x-hidden">
      {/* Sidebar */}
      <div className="sm:w-56 w-full bg-white bg-opacity-20 backdrop-blur-xl border-r border-white border-opacity-20 flex sm:flex-col flex-row items-center sm:items-stretch py-4 px-2 sm:px-0 z-10">
        <div className="mb-8">
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 to-pink-500">💬</span>
        </div>
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`flex items-center w-full px-4 py-3 rounded-lg mb-2 transition-all duration-200 group ${active === item.key ? 'bg-gradient-to-r from-pink-400 to-yellow-300 text-white shadow-lg scale-105' : 'text-pink-700 hover:bg-white hover:bg-opacity-40'}`}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="hidden sm:inline font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 bg-white bg-opacity-30 shadow-md z-10">
          <h1 className="text-2xl font-extrabold text-pink-700 drop-shadow-lg">Welcome, {user?.fullName || 'User'}!</h1>
          <button onClick={handleLogout} className="ml-4 px-4 py-2 rounded bg-pink-500 text-white font-semibold hover:bg-pink-600 transition shadow">Logout</button>
        </header>
        <main className="flex-1 w-full overflow-y-auto">
          {renderSection()}
        </main>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 
