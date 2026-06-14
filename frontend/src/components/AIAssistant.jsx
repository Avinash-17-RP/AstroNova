import { useState, useEffect } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { useAppStore } from '../context/store';
import AIService from '../services/AIService';

const AIAssistant = () => {
  const { isAIOpen, setIsAIOpen, aiQuery, setAIQuery } = useAppStore();
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I\'m AstroNova AI. Ask me anything about space, satellites, or what\'s visible tonight!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (aiQuery) {
      setInput(aiQuery);
      setAIQuery('');
      setIsAIOpen(true);
    }
  }, [aiQuery, setIsAIOpen, setAIQuery]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { type: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Get AI response
      const response = await AIService.chat(input);
      const botMessage = {
        type: 'bot',
        text: response.data?.data?.response || response.data?.response || 'Sorry, I couldn\'t process that.',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('AI error:', error);
      const errorMessage = {
        type: 'bot',
        text: 'Sorry, I\'m having trouble connecting. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAIOpen) {
    return (
      <button
        onClick={() => setIsAIOpen(true)}
        className="fixed bottom-6 right-6 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-full p-4 shadow-lg hover:shadow-neon-purple/50 transition-all pulse-glow"
        title="Open AI Assistant"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] glass flex flex-col rounded-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-bold text-neon-blue">🤖 AstroNova AI</h3>
        <button
          onClick={() => setIsAIOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-neon-blue text-space-900'
                  : 'bg-space-700 text-white'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-space-700 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-400">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-space-700 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-neon-blue hover:bg-neon-blue/80 disabled:opacity-50 text-space-900 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;
