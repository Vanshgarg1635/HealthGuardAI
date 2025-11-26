import React, { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/ChatWidget.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ChatWidget({ user, token }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hello! I\'m your AI health assistant. Ask me anything about your health reports.'
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/chat`,
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.data.response }
      ]);
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          className="chat-fab"
          onClick={() => setIsOpen(true)}
          data-testid="chat-open-btn"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div className="chat-widget" data-testid="chat-widget">
          <div className="chat-header">
            <div className="chat-title">
              <MessageCircle size={20} />
              <span>AI Health Assistant</span>
            </div>
            <button
              className="chat-close"
              onClick={() => setIsOpen(false)}
              data-testid="chat-close-btn"
            >
              <X size={20} />
            </button>
          </div>

          <div className="chat-messages" data-testid="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.role}`}
                data-testid={`chat-message-${index}`}
              >
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant" data-testid="chat-loading">
                <Loader2 className="animate-spin" size={20} />
              </div>
            )}
          </div>

          <div className="chat-input-container">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your health reports..."
              disabled={loading}
              data-testid="chat-input"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              size="sm"
              data-testid="chat-send-btn"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
