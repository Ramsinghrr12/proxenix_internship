import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

const SOCKET_URL = 'https://chatapplication-zfio.onrender.com';

const ChatWindow = ({ token, chatId, user }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const mountedRef = useRef(true);

  // Track mounted state to avoid setState after unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Setup socket connection once
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Join/leave chat room on chatId change
  useEffect(() => {
    if (!chatId || !socketRef.current) return;
    socketRef.current.emit('joinChat', chatId);
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveChat', chatId);
      }
    };
  }, [chatId]);

  // Fetch messages when chatId changes
  useEffect(() => {
    if (!chatId || !token) return;
    setLoading(true);
    fetch(`https://chatapplication-zfio.onrender.com/api/chats/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (mountedRef.current) setMessages(data);
      })
      .catch(() => {
        if (mountedRef.current) setMessages([]);
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
  }, [chatId, token]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socketRef.current || !chatId) return;
    const handler = (message) => {
      if (mountedRef.current) setMessages((prev) => [...prev, message]);
    };
    socketRef.current.on('receiveMessage', handler);
    return () => {
      if (socketRef.current) {
        socketRef.current.off('receiveMessage', handler);
      }
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;
    setSending(true);
    // Find the other participant's userId
    const chat = JSON.parse(localStorage.getItem('chats'))?.find(c => c._id === chatId);
    let otherUserId = null;
    if (chat) {
      otherUserId = chat.participants.find(p => p._id !== user.id)?._id;
    }
    // Fallback: fetch chat list if not in localStorage
    if (!otherUserId) {
      const res = await fetch('https://chatapplication-zfio.onrender.com/api/chats', { headers: { Authorization: `Bearer ${token}` } });
      const chats = await res.json();
      localStorage.setItem('chats', JSON.stringify(chats));
      const found = chats.find(c => c._id === chatId);
      otherUserId = found?.participants.find(p => p._id !== user.id)?._id;
    }
    if (!otherUserId) return setSending(false);
    // Save to backend
    await fetch(`https://chatapplication-zfio.onrender.com/api/chats/${otherUserId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: input }),
    });
    setInput('');
    // Emit to Socket.IO
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', {
        chatId,
        message: {
          sender: user.id,
          content: input,
          timestamp: new Date().toISOString(),
        },
      });
    }
    if (mountedRef.current) setSending(false);
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Handle image upload and send
  const handleSendImage = async (e) => {
    e.preventDefault();
    if (!image || !chatId) return;
    setSending(true);
    const formData = new FormData();
    formData.append('image', image);
    // Upload image to backend
    const res = await fetch(`https://chatapplication-zfio.onrender.com/api/chats/${chatId}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    setImage(null);
    // Emit to Socket.IO
    if (socketRef.current && data.success && data.message) {
      socketRef.current.emit('sendMessage', {
        chatId,
        message: data.message,
      });
    }
    if (mountedRef.current) setSending(false);
  };

  const handleEmojiSelect = (emojiData) => {
    setInput(input + (emojiData.emoji || ''));
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white bg-opacity-80 rounded-lg shadow flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-pink-500">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-400 text-center">No messages yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow text-sm ${msg.sender === user.id ? 'bg-pink-500 text-white self-end' : 'bg-pink-100 text-pink-900 self-start'}`}
              >
                {msg.imageUrl && (
                  <img
                    src={`https://chatapplication-zfio.onrender.com/${msg.imageUrl}`}
                    alt="chat-img"
                    className="max-w-[200px] max-h-[200px] rounded mb-1 border border-pink-200"
                  />
                )}
                {msg.content && <div>{msg.content}</div>}
                <div className="text-xs text-right mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      {chatId && (
        <form className="flex gap-2 p-2 border-t bg-white bg-opacity-90 relative" onSubmit={image ? handleSendImage : handleSend}>
          <button
            type="button"
            className="text-2xl px-2 focus:outline-none"
            onClick={() => setShowEmoji((v) => !v)}
            tabIndex={-1}
          >
            😊
          </button>
          {showEmoji && (
            <div className="absolute bottom-14 left-2 z-10">
              <EmojiPicker onEmojiClick={handleEmojiSelect} theme="light" height={350} width={300} />
            </div>
          )}
          <input
            ref={inputRef}
            className="flex-1 rounded-full px-4 py-2 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={sending || !!image}
          />
          <label className="cursor-pointer flex items-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={sending}
            />
            <span className="text-xl ml-2">📷</span>
          </label>
          {image && (
            <div className="flex items-center ml-2">
              <img src={URL.createObjectURL(image)} alt="preview" className="w-10 h-10 object-cover rounded border border-pink-200 mr-2" />
              <button type="button" className="text-red-500 text-lg" onClick={() => setImage(null)}>&times;</button>
            </div>
          )}
          <button
            type="submit"
            className="bg-pink-500 text-white rounded-full px-6 py-2 font-semibold hover:bg-pink-600 transition"
            disabled={sending || (!input.trim() && !image)}
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
};

export default ChatWindow; 
