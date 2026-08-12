import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, TrendingUp, Package, Users, DollarSign } from "lucide-react";
import api from "../services/api";

const SUGGESTED_PROMPTS = [
  { icon: TrendingUp, text: "Analyze my revenue performance", color: "from-indigo-500 to-violet-500" },
  { icon: Package, text: "Which products have low stock?", color: "from-amber-500 to-orange-500" },
  { icon: Users, text: "How many customers do I have?", color: "from-cyan-500 to-teal-500" },
  { icon: DollarSign, text: "What is my net profit?", color: "from-emerald-500 to-green-500" },
  { icon: Sparkles, text: "Give me 3 tips to grow my business", color: "from-violet-500 to-pink-500" },
  { icon: TrendingUp, text: "Compare my revenue vs expenses", color: "from-rose-500 to-pink-500" },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span key={i} className="typing-dot w-2.5 h-2.5 rounded-full bg-indigo-400 opacity-80" />
      ))}
    </div>
  );
}

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "ai",
      text: "Hello! 👋 I'm **SmartBiz AI**, your intelligent business assistant powered by Gemini. I have live access to your business database — orders, revenue, expenses, customers, and inventory.\n\nAsk me anything about your business! For example: *\"What is my profit this month?\"* or *\"Which products are running low?\"*",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    const userMsg = { id: Date.now(), role: "user", text: msgText, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { message: msgText });
      const aiMsg = { id: Date.now() + 1, role: "ai", text: data.reply, time: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorText = err.response?.data?.message || "I couldn't process your request. Please check your backend server and Gemini API key.";
      const errMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: `⚠️ ${errorText}`,
        time: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-white'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 text-xs font-mono border border-slate-700">$1</code>')
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex flex-wrap items-center gap-3 tracking-tight">
            <span className="gradient-text">AI Business Assistant</span>
            <span className="text-xs font-bold bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-3 py-1 rounded-full shadow-md">
              Gemini Flash
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time analytical insights & recommendations for your business</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 shadow-xl shadow-violet-500/25 animate-float hidden sm:block flex-shrink-0">
          <Bot size={26} className="text-white" />
        </div>
      </div>

      {/* Chat Card Area */}
      <div className="flex flex-col flex-1 glass-card rounded-3xl border border-slate-700/60 overflow-hidden min-h-0 shadow-2xl">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-4 animate-fade-in-up ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/25 border border-indigo-400/20"
                  : "bg-gradient-to-br from-violet-600 to-cyan-600 shadow-violet-500/25 border border-violet-400/20"
              }`}>
                {msg.role === "user" ? (
                  <User size={18} className="text-white" />
                ) : (
                  <Bot size={18} className="text-white" />
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
                <div className={`px-5 py-4 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "chat-bubble-user text-white font-medium"
                    : `chat-bubble-ai text-slate-200 ${msg.isError ? "border-rose-500/40 bg-rose-500/10 text-rose-300" : ""}`
                }`}>
                  <p dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                </div>
                <span className="text-[11px] text-slate-500 font-medium px-2">
                  {msg.time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-4 animate-fade-in">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-violet-500/25 border border-violet-400/20">
                <Bot size={18} className="text-white" />
              </div>
              <div className="chat-bubble-ai rounded-2xl">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="px-6 lg:px-8 pb-4 flex-shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">✨ Recommended Questions</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {SUGGESTED_PROMPTS.map((prompt, i) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt.text)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all duration-200 text-left group"
                  >
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${prompt.color} flex-shrink-0 shadow-md`}>
                      <Icon size={14} className="text-white" />
                    </div>
                    <span className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors leading-snug">
                      {prompt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-5 lg:p-6 border-t border-slate-800/80 bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask smart insights about revenue, customers, orders, inventory..."
                rows={1}
                disabled={loading}
                className="w-full bg-slate-950/70 border border-slate-700/60 rounded-2xl px-5 py-3.5 pr-4 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-none disabled:opacity-50"
                style={{ minHeight: "52px", maxHeight: "140px" }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 text-white shadow-xl shadow-indigo-500/25 hover:opacity-95 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex-shrink-0 border border-indigo-400/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2.5 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono border border-slate-700">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono border border-slate-700">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;