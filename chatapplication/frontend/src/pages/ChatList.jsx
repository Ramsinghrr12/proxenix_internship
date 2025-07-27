import React, { useEffect, useState } from 'react';

const ChatList = ({ token, onSelectChat, activeChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('https://chatapplication-zfio.onrender.com/api/chats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setChats(data))
      .catch(() => setChats([]))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="bg-white bg-opacity-80 rounded-lg shadow p-2 h-full overflow-y-auto">
      <h3 className="text-lg font-bold mb-2 text-pink-700">Chats</h3>
      {loading ? (
        <div className="text-center text-pink-500">Loading...</div>
      ) : chats.length === 0 ? (
        <div className="text-gray-400 text-center">No chats yet.</div>
      ) : (
        <ul>
          {chats.map(chat => {
            const other = chat.participants.find(p => p._id !== JSON.parse(localStorage.getItem('user')).id);
            return (
              <li
                key={chat._id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer mb-1 hover:bg-pink-50 transition ${activeChatId === chat._id ? 'bg-pink-100' : ''}`}
                onClick={() => onSelectChat(chat._id)}
              >
                {other?.profilePic ? (
                  <img src={`https://chatapplication-zfio.onrender.com/${other.profilePic}`} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-pink-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-lg text-pink-400 border-2 border-pink-200">
                    <span>{other?.fullName?.[0] || '?'}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-pink-700 truncate">{other?.fullName}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {chat.lastMessage ? chat.lastMessage.content : <span className="italic text-gray-300">No messages yet</span>}
                  </div>
                </div>
                {chat.lastMessage && (
                  <div className="text-xs text-gray-400 whitespace-nowrap ml-2">{new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ChatList; 
